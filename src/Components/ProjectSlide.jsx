import react from "../assets/react.png";
import tailwind from "../assets/tailwind.png";
import js from "../assets/js.png";
import html from "../assets/html.png";
import firebase from "../assets/firebase.png";
import expo from "../assets/expo.png";
import blockchain from "../assets/Blockchain.png";
import css from "../assets/css.png";
import mongo from "../assets/mongo.png";
import native from "../assets/native.png";

const technologyIcons = {
  react,
  tw: tailwind,
  js,
  html,
  firebase,
  expo,
  blockchain,
  css,
  mongo,
  native,
};

const ProjectSlide = ({ project, onGameOpen }) => {
  const projectId = project.id;
  const projectTags = Array.isArray(project.tags)
    ? project.tags.filter((tag) => typeof tag === "string" && tag.trim())
    : [];

  return (
    <>
      <input type="radio" name="slide" id={projectId} />
      <label htmlFor={projectId} className="card" aria-label={project.title}>
        <div className="column">
          <div className="disp">
            <img src={project.image} alt="" />
          </div>
          <div className="description">
            <p className="text-wrap">{project.description}</p>
          </div>
          {projectTags.length > 0 && (
            <div className="project-tags" aria-label="Project tags">
              {projectTags.map((tag, index) => (
                <span className="project-tag" key={`${tag}-${index}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="block4">
            {project.technologies?.map((technology, index) => {
              const icon = technologyIcons[technology];
              return icon ? (
                <img
                  src={icon}
                  alt={technology}
                  key={`${technology}-${index}`}
                />
              ) : (
                <span className="project-tech-label" key={`${technology}-${index}`}>
                  {technology}
                </span>
              );
            })}
          </div>
          <div className="sourcer">
            <button
              onClick={(event) => {
                event.preventDefault();
                if (project.showGames) {
                  onGameOpen();
                } else if (project.liveUrl) {
                  window.open(project.liveUrl, "_blank", "noopener,noreferrer");
                } else {
                  window.alert("Project needs setup. Use the source code link.");
                }
              }}
            >
              OPEN PROJECT
            </button>
            <button
              onClick={(event) => {
                event.preventDefault();
                if (project.sourceUrl) {
                  window.open(
                    project.sourceUrl,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }
              }}
            >
              SOURCE CODE
            </button>
          </div>
        </div>
      </label>
    </>
  );
};

export default ProjectSlide;
