import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BiArrowBack, BiArrowFromLeft, BiCheck, BiSend } from "react-icons/bi";
import { HiOutlineCpuChip } from "react-icons/hi2";
import { LuSparkles } from "react-icons/lu";
import { push, ref, set } from "firebase/database";
import db from "../../firbase";

const CONTACT_WRITE_TIMEOUT = 15000;

const Form = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brief, setBrief] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [error, setError] = useState("");
  const briefRef = useRef(null);
  const submissionRef = useRef(null);
  const submissionPayloadRef = useRef(null);
  const hasUnconfirmedWriteRef = useRef(false);

  const continueToContact = () => {
    if (!brief.trim()) {
      setError("Tell me a little about what you’d like to build first.");
      briefRef.current?.focus();
      return;
    }

    setError("");
    setStep(2);
  };

  const sendBrief = async (event) => {
    event.preventDefault();
    if (isSending || isSent) return;

    setIsSending(true);
    setError("");
    let timeoutId;
    let requestTimedOut = false;

    try {
      if (!submissionRef.current) {
        submissionRef.current = push(ref(db, "/Viewers"));
        submissionPayloadRef.current = {
          Name: name.trim(),
          Email: email.trim(),
          Message: brief.trim(),
          SubmittedAt: new Date().toISOString(),
        };
      }

      const savePromise = set(
        submissionRef.current,
        submissionPayloadRef.current
      );
      savePromise.then(
        () => {
          hasUnconfirmedWriteRef.current = false;
          setIsSent(true);
          setHasTimedOut(false);
          setError("");
        },
        (saveError) => {
          if (requestTimedOut) {
            console.error(
              "The portfolio contact request failed after the timeout.",
              saveError
            );
          }
        }
      );

      await Promise.race([
        savePromise,
        new Promise((_, reject) => {
          timeoutId = setTimeout(() => {
            requestTimedOut = true;
            hasUnconfirmedWriteRef.current = true;
            const timeoutError = new Error("Contact request timed out.");
            timeoutError.name = "TimeoutError";
            reject(timeoutError);
          }, CONTACT_WRITE_TIMEOUT);
        }),
      ]);
      setIsSent(true);
    } catch (sendError) {
      console.error("Could not send the portfolio contact request.", sendError);
      if (sendError.name === "TimeoutError") {
        setHasTimedOut(true);
        setError(
          "This is taking longer than expected. You can retry safely; it won’t create a duplicate request."
        );
      } else if (hasUnconfirmedWriteRef.current) {
        setHasTimedOut(true);
        setError(
          "I couldn’t confirm the request yet. You can retry safely; it won’t create a duplicate request."
        );
      } else {
        submissionRef.current = null;
        submissionPayloadRef.current = null;
        setError("I couldn’t send that just now. Please try again in a moment.");
      }
    } finally {
      clearTimeout(timeoutId);
      setIsSending(false);
    }
  };

  const previewText = brief.trim()
    ? brief.trim()
    : "Your project idea will appear here as you write it.";

  return (
    <section
      className="contact-experience"
      aria-label="Project inquiry"
    >
      <div className="contact-workspace">
        <div className="contact-brief-panel">
          <div className="contact-kicker">
            <LuSparkles aria-hidden="true" />
            <span>LET’S MAKE IT REAL</span>
          </div>
          <h2>Tell me what you’re imagining.</h2>
          <p className="contact-lead">
            Share a few details and my little project assistant will package
            everything into a clear brief.
          </p>

          <div className="contact-steps" aria-label={`Step ${step} of 2`}>
            <span className={step >= 1 ? "is-current" : ""}>
              <i>01</i> Project brief
            </span>
            <span className={step >= 2 ? "is-current" : ""}>
              <i>02</i> Your details
            </span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {isSent ? (
              <motion.div
                key="sent"
                className="contact-form-success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <span className="contact-success-icon">
                  <BiCheck aria-hidden="true" />
                </span>
                <div>
                  <strong>Brief delivered</strong>
                  <p>Your assistant has saved the project details for me.</p>
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div
                key="brief"
                className="contact-step-content"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.22 }}
              >
                <label className="contact-field">
                  <span>What would you like to build?</span>
                  <textarea
                    ref={briefRef}
                    value={brief}
                    onChange={(event) => {
                      setBrief(event.target.value);
                      if (error) setError("");
                    }}
                    placeholder="A product, website, app, or an idea you’re still shaping..."
                    rows={5}
                    maxLength={2000}
                    aria-describedby="brief-hint"
                  />
                </label>
                <div className="contact-field-meta" id="brief-hint">
                  <span>A rough idea is plenty to get started.</span>
                  <span>{brief.length}/2000</span>
                </div>
                <button
                  type="button"
                  className="contact-primary"
                  onClick={continueToContact}
                >
                  Add contact details
                  <BiArrowFromLeft aria-hidden="true" />
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="details"
                className="contact-step-content"
                onSubmit={sendBrief}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.22 }}
              >
                <label className="contact-field">
                  <span>Your name</span>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="How should I address you?"
                    maxLength={100}
                    disabled={isSending || hasTimedOut}
                    required
                  />
                </label>
                <label className="contact-field">
                  <span>Email address</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    maxLength={254}
                    disabled={isSending || hasTimedOut}
                    required
                  />
                </label>
                <div className="contact-action-row">
                  <button
                    type="button"
                    className="contact-back"
                    onClick={() => {
                      setError("");
                      setStep(1);
                    }}
                    disabled={isSending || hasTimedOut}
                  >
                    <BiArrowBack aria-hidden="true" />
                    Back
                  </button>
                  <button
                    type="submit"
                    className="contact-primary"
                    disabled={isSending}
                  >
                    {isSending
                      ? "Sending brief..."
                      : hasTimedOut
                        ? "Retry sending"
                        : "Send my brief"}
                    {isSending ? (
                      <span className="contact-spinner" aria-hidden="true" />
                    ) : (
                      <BiSend aria-hidden="true" />
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <p className="contact-error" role="alert">
              {error}
            </p>
          )}
          <div className="contact-privacy-note">
            <HiOutlineCpuChip aria-hidden="true" />
            <span>Your details are only used to reply to this inquiry.</span>
          </div>
        </div>

        <div
          className={`contact-computer ${isSent ? "contact-computer-sent" : ""}`}
        >
          <div className="computer-window">
            <div className="computer-titlebar">
              <span className="computer-window-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="computer-window-title">project-assistant.exe</span>
              <span className="computer-live">
                <i />
                {isSent ? "DONE" : "LIVE"}
              </span>
            </div>
            <div className="computer-screen">
              {isSent ? (
                <motion.div
                  className="computer-thanks"
                  role="status"
                  aria-live="polite"
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.42, ease: "easeOut" }}
                >
                  <span className="computer-check">
                    <BiCheck aria-hidden="true" />
                  </span>
                  <span className="computer-label">TRANSMISSION COMPLETE</span>
                  <h3>Thanks for reaching out, {name.trim()}.</h3>
                  <p>
                    Your idea is saved with your contact details. I’ll get back
                    to you at{" "}
                    <strong>{email.trim()}</strong> soon.
                  </p>
                  <div className="computer-ticket">
                    <span>YOUR PROJECT BRIEF</span>
                    <p>{brief.trim()}</p>
                  </div>
                </motion.div>
              ) : (
                <div className="computer-assistant">
                  <div className="assistant-heading">
                    <span className="assistant-avatar">
                      <HiOutlineCpuChip aria-hidden="true" />
                    </span>
                    <span>
                      <strong>GOKUL’S ASSISTANT</strong>
                      <small>Listening to your idea</small>
                    </span>
                    <LuSparkles className="assistant-sparkle" aria-hidden="true" />
                  </div>
                  <div className="assistant-terminal">
                    <span className="terminal-prompt">brief.init()</span>
                    <p>{previewText}</p>
                    <div className="terminal-divider" />
                    <span className="terminal-prompt">contact.status</span>
                    <div className="assistant-status-list">
                      <span className="is-ready">
                        <i />
                        Project idea {brief.trim() ? "captured" : "waiting"}
                      </span>
                      <span className={step === 2 ? "is-ready" : ""}>
                        <i />
                        Contact details {step === 2 ? "in progress" : "next"}
                      </span>
                    </div>
                    {step === 2 && email && (
                      <motion.span
                        className="terminal-email"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        reply_to: {email}
                      </motion.span>
                    )}
                    <span className="terminal-cursor" aria-hidden="true" />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="computer-stand" aria-hidden="true">
            <span />
          </div>
          <div className="computer-base" aria-hidden="true" />
          <p className="computer-caption">
            <span />
            {isSent ? "Your message is on its way" : "Your brief, built together"}
          </p>
        </div>
      </div>
      <div className="contact-bottom-note">
        <span>Have a bigger idea?</span>
        <span>Start with the rough version. We’ll shape it together.</span>
      </div>
    </section>
  );
};

export default Form;
