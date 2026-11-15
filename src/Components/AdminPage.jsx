import { useCallback, useEffect, useState } from "react";
import {
  getIdTokenResult,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { ref, set } from "firebase/database";
import { auth, functions } from "../../firbase";
import db from "../../firbase";
import {
  copyPortfolio,
  normalizePortfolioForStorage,
} from "../data/portfolioDefaults";
import { usePortfolio } from "../context/PortfolioContext";

const updatePath = (setValue, path, value) => {
  setValue((current) => {
    const updated = copyPortfolio(current);
    let target = updated;
    for (const key of path.slice(0, -1)) target = target[key];
    target[path[path.length - 1]] = value;
    return updated;
  });
};

const localRequest = async (route, options = {}) => {
  const response = await fetch(`/__local_portfolio${route}`, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const result = await response.json();
  if (!response.ok) {
    throw Object.assign(new Error(result.error || "Local admin request failed."), {
      status: response.status,
    });
  }
  return result;
};

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const Field = ({
  label,
  value,
  onChange,
  multiline = false,
  type = "text",
  inputMode,
  pattern,
  required = false,
}) => (
  <label className="admin-field">
    <span>{label}</span>
    {multiline ? (
      <textarea value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    ) : (
      <input
        type={type}
        value={value ?? ""}
        inputMode={inputMode}
        pattern={pattern}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    )}
  </label>
);

const AdminPage = ({ onClose }) => {
  const { portfolio, replacePortfolio } = usePortfolio();
  const [user, setUser] = useState(null);
  const [draft, setDraft] = useState(() => copyPortfolio(portfolio));
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState("success");
  const [busy, setBusy] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const updateStatus = useCallback((message, tone = "success") => {
    setStatus(message);
    setStatusTone(tone);
  }, []);

  useEffect(() => {
    if (import.meta.env.DEV) {
      let active = true;
      localRequest("/session")
        .then(({ authenticated }) => {
          if (!active) return;
          setUser(
            authenticated
              ? { uid: "local-dev-admin", email: "Local development", isLocal: true }
              : null
          );
          setAuthLoading(false);
        })
        .catch((error) => {
          console.error("Could not check the local admin session.", error);
          if (!active) return;
          setAuthLoading(false);
          updateStatus(
            "Restart the local Vite server to enable the file-based editor.",
            "error"
          );
        });

      return () => {
        active = false;
      };
    }

    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!active) return;
      if (!nextUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }

      try {
        const token = await getIdTokenResult(nextUser);
        if (!active) return;
        if (token.claims.admin !== true) {
          await signOut(auth);
          if (!active) return;
          setUser(null);
          setAuthLoading(false);
          updateStatus("This account is not authorized to edit the portfolio.", "error");
          return;
        }

        setUser(nextUser);
        setAuthLoading(false);
        updateStatus("");
      } catch (error) {
        console.error("Could not verify the admin session.", error);
        if (active) {
          setUser(null);
          setAuthLoading(false);
          updateStatus("The admin session could not be verified.", "error");
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [updateStatus]);

  useEffect(() => {
    if (!user) setDraft(copyPortfolio(portfolio));
  }, [portfolio, user]);

  const handleSignIn = async (event) => {
    event.preventDefault();
    updateStatus("");
    setBusy(true);
    try {
      if (import.meta.env.DEV) {
        await localRequest("/login", {
          method: "POST",
          body: JSON.stringify({ pin }),
        });
        setUser({
          uid: "local-dev-admin",
          email: "Local development",
          isLocal: true,
        });
        setPin("");
        return;
      }

      const requestPinLogin = httpsCallable(functions, "portfolioPinLogin");
      const result = await requestPinLogin({ pin });
      await signInWithCustomToken(auth, result.data.token);
      setPin("");
    } catch (error) {
      console.error("Admin PIN sign-in failed.", error);
      if (import.meta.env.DEV) {
        updateStatus(
          error.status === 503
            ? "Local PIN is not configured. Set PORTFOLIO_ADMIN_PIN in .env.local and restart Vite."
            : error.status === 429
              ? error.message
              : error.status === 401
                ? "That local development PIN is incorrect."
                : "Could not reach the local editor. Restart npm run dev.",
          "error"
        );
        return;
      }

      switch (error.code) {
        case "functions/not-found":
        case "functions/unavailable":
          updateStatus("PIN sign-in service is not deployed. Follow the setup steps in README.", "error");
          break;
        case "functions/internal":
          updateStatus("PIN sign-in is not configured. Set the ADMIN_PIN Firebase secret.", "error");
          break;
        case "functions/resource-exhausted":
          updateStatus("Too many attempts. Wait 15 minutes before trying again.", "error");
          break;
        case "functions/unauthenticated":
          updateStatus("That PIN does not match the ADMIN_PIN secret configured in Firebase.", "error");
          break;
        case "auth/operation-not-allowed":
          updateStatus("Enable Firebase Authentication for this project before signing in.", "error");
          break;
        default:
          updateStatus("Could not verify the PIN. Check the Firebase Function deployment and try again.", "error");
      }
    } finally {
      setBusy(false);
    }
  };

  const savePortfolio = async () => {
    setBusy(true);
    updateStatus("");
    try {
      if (user?.isLocal) {
        const content = normalizePortfolioForStorage(draft);
        await localRequest("/content", {
          method: "PUT",
          body: JSON.stringify(content),
        });
        replacePortfolio(content);
        updateStatus("Saved to portfolio-data/content.json.");
        return;
      }

      await set(
        ref(db, "portfolio/content"),
        normalizePortfolioForStorage(draft)
      );
      updateStatus("Changes saved.");
    } catch (error) {
      console.error("Could not save portfolio content.", error);
      updateStatus(
        "Save failed. Confirm the Firebase database rules are deployed for the owner PIN.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (user?.isLocal) {
        await localRequest("/logout", { method: "POST", body: "{}" });
        setUser(null);
        updateStatus("");
        return;
      }

      await signOut(auth);
      updateStatus("");
    } catch (error) {
      console.error("Could not sign out of the admin editor.", error);
      updateStatus("Sign-out failed. Please try again.", "error");
    }
  };

  const uploadImage = async (event, path) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      updateStatus("Choose an image file.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      updateStatus("Images must be 5 MB or smaller.", "error");
      return;
    }

    if (!user?.isLocal) {
      updateStatus(
        "Upload images from the local editor to save them in public/uploads, then deploy the project.",
        "error"
      );
      return;
    }

    setBusy(true);
    updateStatus("");
    try {
      const data = await readFileAsBase64(file);
      const result = await localRequest("/media", {
        method: "POST",
        body: JSON.stringify({ type: file.type, data }),
      });
      updatePath(setDraft, path, result.url);
      updateStatus("Image added to public/uploads. Save changes to publish it.");
    } catch (error) {
      console.error("Could not upload portfolio image.", error);
      updateStatus(
        "Image upload failed. Restart the local Vite editor and try again.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  };

  const editPath = (path) => (value) => updatePath(setDraft, path, value);

  const changeSkill = (index, key, value) => {
    setDraft((current) => {
      const updated = copyPortfolio(current);
      updated.skills[index][key] =
        key === "rating" ? Number(value) : value;
      return updated;
    });
  };

  const changeProject = (index, key, value) => {
    setDraft((current) => {
      const updated = copyPortfolio(current);
      updated.projects[index][key] = value;
      return updated;
    });
  };

  const addItem = (key, value) => {
    setDraft((current) => {
      const updated = copyPortfolio(current);
      updated[key].push(value);
      return updated;
    });
  };

  const removeItem = (key, index) => {
    setDraft((current) => {
      const updated = copyPortfolio(current);
      updated[key].splice(index, 1);
      return updated;
    });
  };

  const addProject = () => {
    addItem("projects", {
      id: `project-${Date.now()}`,
      title: "New project",
      description: "",
      image: "",
      technologies: [],
      liveUrl: "",
      sourceUrl: "",
      showGames: false,
    });
  };

  if (authLoading) {
    return (
      <main className="admin-page">
        <section className="admin-login">
          <span className="admin-kicker">PRIVATE AREA</span>
          <h1>Portfolio editor</h1>
          <p>Checking the local admin session...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="admin-page">
        <section className="admin-login">
          <button className="admin-back" type="button" onClick={onClose}>
            Back to portfolio
          </button>
          <span className="admin-kicker">PRIVATE AREA</span>
          <h1>Portfolio editor</h1>
          <p>Enter your PIN to manage your portfolio content.</p>
          <form onSubmit={handleSignIn}>
            <Field
              label="PIN"
              value={pin}
              onChange={setPin}
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4,12}"
              required
            />
            <button className="admin-primary" type="submit" disabled={busy}>
              {busy ? "Verifying..." : "Unlock editor"}
            </button>
          </form>
          {status && (
            <p
              className={`admin-status admin-status-${statusTone}`}
              role="status"
            >
              {status}
            </p>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <div>
          <span className="admin-kicker">OWNER DASHBOARD</span>
          <h1>Portfolio editor</h1>
          <p>Signed in with the owner PIN</p>
        </div>
        <div className="admin-top-actions">
          <button className="admin-secondary" type="button" onClick={onClose}>
            View portfolio
          </button>
          <button
            className="admin-secondary"
            type="button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
          <button
            className="admin-primary"
            type="button"
            onClick={savePortfolio}
            disabled={busy}
          >
            {busy ? "Working..." : "Save changes"}
          </button>
        </div>
      </header>

      {status && (
        <p className={`admin-status admin-status-${statusTone}`} role="status">
          {status}
        </p>
      )}

      <section className="admin-panel">
        <h2>Introduction</h2>
        <div className="admin-grid">
          <Field label="Name" value={draft.hero.name} onChange={editPath(["hero", "name"])} />
          <Field label="Eyebrow" value={draft.hero.eyebrow} onChange={editPath(["hero", "eyebrow"])} />
          <Field label="Introduction" value={draft.hero.intro} onChange={editPath(["hero", "intro"])} multiline />
          <Field label="Hero image URL" value={draft.hero.image} onChange={editPath(["hero", "image"])} />
        </div>
        <label className="admin-upload">
          Upload hero image (5 MB max)
          <input type="file" accept="image/*" onChange={(event) => uploadImage(event, ["hero", "image"])} />
        </label>
      </section>

      <section className="admin-panel">
        <h2>Section headings and links</h2>
        <div className="admin-grid">
          {Object.entries(draft.sectionTitles).map(([key, value]) => (
            <Field
              key={key}
              label={`${key} heading`}
              value={value}
              onChange={editPath(["sectionTitles", key])}
            />
          ))}
          <Field label="Contact email" value={draft.links.contactEmail} onChange={editPath(["links", "contactEmail"])} type="email" />
          <Field label="Resume URL" value={draft.links.resume} onChange={editPath(["links", "resume"])} />
          <Field label="Certificates URL" value={draft.links.certificates} onChange={editPath(["links", "certificates"])} />
          {Object.entries(draft.links.social).map(([key, value]) => (
            <Field
              key={key}
              label={`${key} URL`}
              value={value}
              onChange={editPath(["links", "social", key])}
            />
          ))}
        </div>
        <Field label="Testimonial / profile summary" value={draft.testimonial} onChange={editPath(["testimonial"])} multiline />
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>Skills</h2>
          <button
            className="admin-secondary"
            type="button"
            onClick={() =>
              addItem("skills", { name: "New skill", image: "", rating: 65 })
            }
          >
            Add skill
          </button>
        </div>
        <div className="admin-list">
          {draft.skills.map((skill, index) => (
            <div className="admin-list-row" key={`skill-${index}`}>
              <Field label="Skill" value={skill.name} onChange={(value) => changeSkill(index, "name", value)} />
              <Field
                label="Rating (0–100)"
                type="number"
                value={skill.rating ?? 65}
                onChange={(value) =>
                  changeSkill(index, "rating", Math.max(0, Math.min(100, Number(value))))
                }
              />
              <Field label="Icon URL" value={skill.image} onChange={(value) => changeSkill(index, "image", value)} />
              <label className="admin-upload">
                Upload icon
                <input type="file" accept="image/*" onChange={(event) => uploadImage(event, ["skills", index, "image"])} />
              </label>
              <button className="admin-danger" type="button" onClick={() => removeItem("skills", index)}>Remove</button>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>Projects</h2>
          <button className="admin-secondary" type="button" onClick={addProject}>Add project</button>
        </div>
        <div className="admin-list">
          {draft.projects.map((project, index) => (
            <article className="admin-project" key={project.id || `project-${index}`}>
              <div className="admin-panel-heading">
                <h3>{project.title || "Untitled project"}</h3>
                <button className="admin-danger" type="button" onClick={() => removeItem("projects", index)}>Remove project</button>
              </div>
              <div className="admin-grid">
                <Field label="Title" value={project.title} onChange={(value) => changeProject(index, "title", value)} />
                <Field label="Description" value={project.description} onChange={(value) => changeProject(index, "description", value)} multiline />
                <Field label="Thumbnail URL" value={project.image} onChange={(value) => changeProject(index, "image", value)} />
                <Field label="Live project URL" value={project.liveUrl} onChange={(value) => changeProject(index, "liveUrl", value)} />
                <Field label="Source code URL" value={project.sourceUrl} onChange={(value) => changeProject(index, "sourceUrl", value)} />
                <Field
                  label="Technology icon keys (comma-separated)"
                  value={(Array.isArray(project.technologies) ? project.technologies : []).join(", ")}
                  onChange={(value) => changeProject(index, "technologies", value.split(",").map((item) => item.trim()).filter(Boolean))}
                />
              </div>
              <label className="admin-upload">
                Upload thumbnail (5 MB max)
                <input type="file" accept="image/*" onChange={(event) => uploadImage(event, ["projects", index, "image"])} />
              </label>
              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(project.showGames)}
                  onChange={(event) => changeProject(index, "showGames", event.target.checked)}
                />
                Open the mini-games popup for this project
              </label>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <h2>Education and profile</h2>
        <div className="admin-grid">
          <Field label="Internship and experience" value={draft.education.internship} onChange={editPath(["education", "internship"])} multiline />
          <Field label="University" value={draft.education.university.title} onChange={editPath(["education", "university", "title"])} />
          <Field label="CGPA" value={draft.education.university.cgpa} onChange={editPath(["education", "university", "cgpa"])} />
          <Field label="University highlights (one per line)" value={draft.education.university.highlights.join("\n")} onChange={(value) => editPath(["education", "university", "highlights"])(value.split("\n"))} multiline />
          <Field label="School" value={draft.education.school.title} onChange={editPath(["education", "school", "title"])} />
          <Field label="12th grade" value={draft.education.school.twelfth} onChange={editPath(["education", "school", "twelfth"])} />
          <Field label="10th grade" value={draft.education.school.tenth} onChange={editPath(["education", "school", "tenth"])} />
          <Field label="School highlights (one per line)" value={draft.education.school.highlights.join("\n")} onChange={(value) => editPath(["education", "school", "highlights"])(value.split("\n"))} multiline />
          <Field label="Profile name" value={draft.education.profile.name} onChange={editPath(["education", "profile", "name"])} />
          <Field label="Birth date" value={draft.education.profile.birthDate} onChange={editPath(["education", "profile", "birthDate"])} />
          <Field label="Phone" value={draft.education.profile.phone} onChange={editPath(["education", "profile", "phone"])} />
          <Field label="Languages" value={draft.education.profile.languages} onChange={editPath(["education", "profile", "languages"])} />
          <Field label="Profile email" value={draft.education.profile.email} onChange={editPath(["education", "profile", "email"])} type="email" />
          <Field label="Gender" value={draft.education.profile.gender} onChange={editPath(["education", "profile", "gender"])} />
          <Field label="Location" value={draft.education.profile.location} onChange={editPath(["education", "profile", "location"])} />
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <h2>Marquee labels</h2>
          <button className="admin-secondary" type="button" onClick={() => addItem("marquee", "New label")}>Add label</button>
        </div>
        <div className="admin-list">
          {draft.marquee.map((label, index) => (
            <div className="admin-list-row" key={`marquee-${index}`}>
              <Field label="Label" value={label} onChange={(value) => editPath(["marquee", index])(value)} />
              <button className="admin-danger" type="button" onClick={() => removeItem("marquee", index)}>Remove</button>
            </div>
          ))}
        </div>
      </section>

      <button
        className="admin-primary admin-save-bottom"
        type="button"
        onClick={savePortfolio}
        disabled={busy}
      >
        {busy ? "Working..." : "Save all changes"}
      </button>
    </main>
  );
};

export default AdminPage;
