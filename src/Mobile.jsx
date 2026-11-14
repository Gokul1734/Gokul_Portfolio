import { motion } from "motion/react";
import ProgressBar from "@ramonak/react-progress-bar";
import { BiRightArrowCircle } from "react-icons/bi";
import { FaGithub } from "react-icons/fa";
import { BsTwitter } from "react-icons/bs";
import { RiInstagramFill } from "react-icons/ri";
import { GrLinkedin } from "react-icons/gr";
import Bmw from "./Components/Bmw";
import EducationSlide from "./Components/EducationSlide";
import Form from "./Components/Form";
import Skills from "./Components/Skills";
import Slider from "./Components/Slider";
import SideBar from "./Components/SideBar";
import { usePortfolio } from "./context/PortfolioContext";

const socialLinks = [
  { key: "github", Icon: FaGithub },
  { key: "instagram", Icon: RiInstagramFill },
  { key: "linkedin", Icon: GrLinkedin },
  { key: "x", Icon: BsTwitter },
];

const Mobile = ({ onAdminOpen }) => {
  const { portfolio, dataError } = usePortfolio();

  const openCarAnimation = () => {
    const car = document.querySelector(".Carsvg");
    const trigger = document.getElementById("carfade");
    if (!car || !trigger) return;

    car.style.display = "flex";
    trigger.classList.add("active");
    trigger.classList.remove("carfade");
    document.getElementById("BMW")?.classList.add("play");
    trigger.style.zIndex = "0";
  };

  return (
    <main className="body w-screen flex flex-col justify-center items-center h-full">
      <SideBar onAdminOpen={onAdminOpen} />
      <section className="h-full flex flex-col justify-center w-full items-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="img hero-avatar rounded-full w-244 h-244 items-center justify-center"
          style={{
            backgroundImage: portfolio.hero.image
              ? `url("${portfolio.hero.image}")`
              : undefined,
          }}
          role="img"
          aria-label={portfolio.hero.name}
        />
        <div className="flex flex-col gap-6 justify-center items-center">
          <Bmw />
          <p className="hero-eyebrow">{portfolio.hero.eyebrow}</p>
          <h1 className="hero-name text-center">{portfolio.hero.name}</h1>
          <p className="hero-intro">{portfolio.hero.intro}</p>
          <motion.h2
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            id="carfade"
            style={{ zIndex: 2 }}
            onClick={openCarAnimation}
            className="carfade text-2xl"
          />
          <Slider screen="mobile" />
        </div>
      </section>
      <h1 id="skills" className="title section-title mt-20">
        {portfolio.sectionTitles.skills}
      </h1>
      <section className="SkillTab flex-col h-max p-0">
        <div className="parentMobile w-1/2 h-auto mt-10 p-10">
          {portfolio.skills.map((skill, index) => (
            <Skills
              key={`${skill.name}-${index}`}
              div={String(index + 1)}
              screen="mobile"
              skill={skill.name}
              icon={skill.image}
            />
          ))}
        </div>
        <div className="flex flex-col grid-containerMobile justify-center my-0">
          {portfolio.proficiency.map((skill, index) => (
            <div className="grid-item" key={`${skill.label}-${index}`}>
              <section>
                <div className="my-3">
                  <label>
                    {skill.label}: {skill.value}%
                  </label>
                </div>
                <ProgressBar
                  animateOnRender
                  height={25}
                  completed={Number(skill.value)}
                  bgColor="#c3f56a"
                />
              </section>
            </div>
          ))}
        </div>
      </section>
      <h1 id="projects" className="title section-title mt-20">
        {portfolio.sectionTitles.projects}
      </h1>
      <section id="Card" className="cardScroll">
        <h2 className="sliderspace flex justify-center items-center gap-4">
          Slide
          <motion.button
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Scroll projects"
            onClick={() =>
              document.getElementById("Card")?.scrollBy({
                left: 300,
                behavior: "smooth",
              })
            }
            className="bg-none p-0"
          >
            <BiRightArrowCircle className="mt-1" size={50} />
          </motion.button>
        </h2>
        {portfolio.projects.map((project, index) => (
          <article
            className="mobileCard"
            key={project.id || `${project.title}-${index}`}
          >
            <img
              className="rounded-md w-96 h-56"
              src={project.image}
              alt={`${project.title} preview`}
            />
            <div className="mobile-project-copy">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <div className="mobile-project-actions">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Live project
                  </a>
                )}
                {project.sourceUrl && (
                  <a
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Source code
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
        <a
          className="mobile-github-link"
          href={portfolio.links.social.github}
          target="_blank"
          rel="noreferrer"
        >
          Visit GitHub
        </a>
      </section>
      <h1 id="education" className="title section-title mt-20">
        {portfolio.sectionTitles.education}
      </h1>
      <section className="flex flex-col justify-center items-start m-10">
        <h2 className="text-3xl mb-4 text-primary">Testimonial</h2>
        <p className="w-full text-justify">{portfolio.testimonial}</p>
      </section>
      <EducationSlide screen="mobile" />
      <h1 id="contact" className="title section-title my-20">
        {portfolio.sectionTitles.contact}
      </h1>
      <Form screen="mobile" />
      <footer className="footer my-10 flex justify-evenly items-center gap-7">
        {socialLinks.map(({ key, Icon }) => (
          <a
            key={key}
            href={portfolio.links.social[key]}
            target="_blank"
            rel="noreferrer"
            aria-label={key}
          >
            <Icon
              className="bg-primary rounded-full p-2 mobileIcons"
              size={42}
              color="white"
            />
          </a>
        ))}
      </footer>
      {dataError && (
        <p className="portfolio-data-warning" role="status">
          {dataError} Showing the original portfolio content.
        </p>
      )}
    </main>
  );
};

export default Mobile;
