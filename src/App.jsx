import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useMediaQuery } from "react-responsive";
import { BiUpArrowCircle } from "react-icons/bi";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";
import AdminPage from "./Components/AdminPage";
import AmbientScene from "./Components/AmbientScene";
import Bmw from "./Components/Bmw";
import EducationSlide from "./Components/EducationSlide";
import Form from "./Components/Form";
import Header from "./Components/Header";
import Media from "./Components/Media";
import Popup from "./Components/Popup";
import ProjectSlide from "./Components/ProjectSlide";
import Skills from "./Components/Skills";
import Slider from "./Components/Slider";
import Mobile from "./Mobile";
import { usePortfolio } from "./context/PortfolioContext";

function App() {
  const [showPopup, setShowPopup] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(
    () => window.location.pathname === "/admin"
  );
  const { portfolio, dataError } = usePortfolio();
  const isDesktop = useMediaQuery({ query: "(min-width: 1000px)" });

  useEffect(() => {
    const updateAdminRoute = () => {
      setIsAdminOpen(window.location.pathname === "/admin");
    };

    window.addEventListener("popstate", updateAdminRoute);
    return () => window.removeEventListener("popstate", updateAdminRoute);
  }, []);

  const openAdmin = () => {
    window.history.pushState(null, "", "/admin");
    setIsAdminOpen(true);
  };

  const closeAdmin = () => {
    window.history.replaceState(null, "", "/");
    setIsAdminOpen(false);
  };

  const openHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <AmbientScene />
      {isAdminOpen ? (
        <AdminPage onClose={closeAdmin} />
      ) : isDesktop ? (
        <main className="portfolio">
          <div className="hero-shell" id="home">
            <div className="hero-content">
              <Header onAdminOpen={openAdmin} />
              <div className="hero-layout">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="img hero-avatar rounded-full items-center justify-center"
                  style={{
                    backgroundImage: portfolio.hero.image
                      ? `url("${portfolio.hero.image}")`
                      : undefined,
                  }}
                  role="img"
                  aria-label={portfolio.hero.name}
                />
                <div className="hero-copy">
                  <Bmw />
                  <p className="hero-eyebrow">{portfolio.hero.eyebrow}</p>
                  <h1 className="hero-name">{portfolio.hero.name}</h1>
                  <p className="hero-intro">{portfolio.hero.intro}</p>
                  <motion.h2
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    id="carfade"
                    onClick={() => {
                      document.querySelector(".Carsvg").style.display = "flex";
                      document.getElementById("carfade").classList.add("active");
                      document
                        .getElementById("carfade")
                        .classList.remove("carfade");
                      document.getElementById("BMW").classList.add("play");
                      document.getElementById("carfade").style.zIndex = 0;
                    }}
                    className="carfade"
                  />
                </div>
              </div>
            </div>
            <Media />
          </div>
          <Slider />
          <h1 id="skills" className="title section-title mt-20">
            {portfolio.sectionTitles.skills}
          </h1>
          <p className="skills-intro">Core tools and self-rated proficiency</p>
          <section className="skills-board" aria-label="Skills and ratings">
            {portfolio.skills.map((skill, index) => (
              <Skills key={`${skill.name}-${index}`} skill={skill} index={index} />
            ))}
          </section>
          <h1 id="projects" className="title section-title">
            {portfolio.sectionTitles.projects}
          </h1>
          <div className="wrapper project-gallery">
            <div className="box">
              {portfolio.projects.map((project) => (
                <ProjectSlide
                  key={project.id}
                  project={project}
                  onGameOpen={() => setShowPopup(true)}
                />
              ))}
            </div>
          </div>
          {showPopup && (
            <Popup status={[showPopup, setShowPopup]} />
          )}
          <h1 id="education" className="title section-title">
            {portfolio.sectionTitles.education}
          </h1>
          <div className="education w-full flex justify-center items-start">
            <div className="w-4/6 flex justify-center items-center">
              <EducationSlide screen="" />
            </div>
            <div className="testimonial w-3/6 flex flex-col justify-center items-start">
              <h2 className="text-5xl mb-10">Testimonial</h2>
              <p className="para text-justify">{portfolio.testimonial}</p>
            </div>
          </div>
          <h1 id="contact" className="title section-title">
            {portfolio.sectionTitles.contact}
          </h1>
          <div className="contact contact-layout">
            <Form />
          </div>
          {dataError && (
            <p className="portfolio-data-warning" role="status">
              {dataError} Showing the original portfolio content.
            </p>
          )}
          <motion.button
            onClick={openHome}
            className="top m-10 bg-none p-2 bg-primary text-black text-2xl opacity-60"
            aria-label="Back to top"
          >
            <BiUpArrowCircle size={50} color="white" />
          </motion.button>
        </main>
      ) : (
        <Mobile onAdminOpen={openAdmin} />
      )}
      <SpeedInsights />
    </>
  );
}

export default App;
