import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import GameComponent from "./GameComponent";
import { motion } from "motion/react";

const games = [
  { title: "Pig Game", url: "https://pig-game12345.netlify.app" },
  { title: "Guess the Number", url: "https://subtle-phoenix-0efb5d.netlify.app" },
];

const Popup = ({ onClose }) => {
  const [activeGame, setActiveGame] = useState(0);
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveGame((index) => (index + 1) % games.length);
      } else if (event.key === "ArrowLeft") {
        setActiveGame((index) => (index - 1 + games.length) % games.length);
      } else if (event.key === "Tab") {
        const focusableElements = dialogRef.current?.querySelectorAll(
          'button:not([disabled]), iframe, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements?.length) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [onClose]);

  const moveGame = (direction) => {
    setActiveGame((index) => (index + direction + games.length) % games.length);
  };

  return createPortal(
    <motion.div
      className="game-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.section
        ref={dialogRef}
        className="game-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-modal-title"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <header className="game-modal-header">
          <div>
            <p className="game-modal-eyebrow">MINI-GAME ARCADE</p>
            <h2 id="game-modal-title">{games[activeGame].title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            className="game-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close games"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>

        <GameComponent
          key={games[activeGame].url}
          title={games[activeGame].title}
          url={games[activeGame].url}
        />

        <footer className="game-modal-footer">
          <button
            className="game-modal-nav"
            type="button"
            onClick={() => moveGame(-1)}
            aria-label="Show previous game"
          >
            <span aria-hidden="true">&larr;</span> Previous
          </button>
          <div className="game-modal-pagination" aria-live="polite">
            {games.map((game, index) => (
              <button
                className={`game-modal-dot${index === activeGame ? " is-active" : ""}`}
                key={game.url}
                type="button"
                onClick={() => setActiveGame(index)}
                aria-label={`Play ${game.title}`}
                aria-current={index === activeGame ? "true" : undefined}
              />
            ))}
            <span>
              {activeGame + 1} / {games.length}
            </span>
          </div>
          <button
            className="game-modal-nav"
            type="button"
            onClick={() => moveGame(1)}
            aria-label="Show next game"
          >
            Next <span aria-hidden="true">&rarr;</span>
          </button>
        </footer>
      </motion.section>
    </motion.div>,
    document.body
  );
};

export default Popup;
