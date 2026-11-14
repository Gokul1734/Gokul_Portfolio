import { motion } from "motion/react";
import AdminTrigger from "./AdminTrigger";
import { usePortfolio } from "../context/PortfolioContext";

const Header = ({ onAdminOpen }) => {
  const { portfolio } = usePortfolio();

  return (
    <header className="site-header">
      <div className="header-inner">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <AdminTrigger
            className="logo-button"
            onAdminOpen={onAdminOpen}
            onHome={() =>
              document
                .getElementById("home")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <h1>G</h1>
          </AdminTrigger>
        </motion.div>
        <div className="header-actions">
          <nav className="site-nav" aria-label="Main navigation">
            <a href="#home">Home</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#education">Education</a>
            <a href="#contact">Contact</a>
            <a href={portfolio.links.resume} target="_blank" rel="noreferrer">
              Resume
            </a>
            <a
              href={portfolio.links.certificates}
              target="_blank"
              rel="noreferrer"
            >
              Certificates
            </a>
          </nav>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.8 }}
            className="hire-button"
            href={`mailto:${portfolio.links.contactEmail}`}
          >
            HIRE ME
          </motion.a>
        </div>
      </div>
    </header>
  );
};

export default Header;
