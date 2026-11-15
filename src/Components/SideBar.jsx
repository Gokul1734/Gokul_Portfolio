import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { FiArrowUpRight, FiMenu, FiX } from "react-icons/fi";
import AdminTrigger from "./AdminTrigger";
import { usePortfolio } from "../context/PortfolioContext";

const SideBar = ({ onAdminOpen }) => {
  const { portfolio } = usePortfolio();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMenuOpen]);

  const navigationLinks = [
    { href: "#home", label: "Home" },
    { href: "#skills", label: "Skills" },
    { href: "#projects", label: "Projects" },
    { href: "#education", label: "Education" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="mobile-header">
      <div className="mobile-header-bar">
        <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
          <AdminTrigger
            className="mobile-logo"
            onAdminOpen={onAdminOpen}
            onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span>G</span>
          </AdminTrigger>
        </motion.div>

        <div className="mobile-brand">
          <span>GOKULPRIYAN</span>
          <small>Software developer</small>
        </div>

        <motion.button
          type="button"
          className="mobile-menu-toggle"
          whileTap={{ scale: 0.94 }}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-primary-navigation"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isMenuOpen ? "close" : "open"}
              initial={{ opacity: 0, rotate: -35, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 35, scale: 0.7 }}
              transition={{ duration: 0.16 }}
              aria-hidden="true"
            >
              {isMenuOpen ? <FiX /> : <FiMenu />}
            </motion.span>
          </AnimatePresence>
          <span className="mobile-menu-label">
            {isMenuOpen ? "Close" : "Menu"}
          </span>
        </motion.button>
      </div>

      <AnimatePresence initial={false}>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu-panel"
            initial={{ height: 0, opacity: 0, y: -8 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav
              id="mobile-primary-navigation"
              className="mobile-navigation"
              aria-label="Main navigation"
            >
              <div className="mobile-section-links">
                {navigationLinks.map(({ href, label }, index) => (
                  <motion.a
                    key={href}
                    href={href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.035, duration: 0.2 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {label}
                  </motion.a>
                ))}
              </div>
              <div className="mobile-action-links">
                <a
                  href={portfolio.links.resume}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Resume
                </a>
                <a
                  href={portfolio.links.certificates}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Certificates
                </a>
                <a
                  href={`mailto:${portfolio.links.contactEmail}`}
                  className="mobile-hire-button"
                  onClick={() => setIsMenuOpen(false)}
                >
                  HIRE ME <FiArrowUpRight aria-hidden="true" />
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default SideBar;
