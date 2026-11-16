import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import "./PortfolioRoadmap.css";

const roadmapStops = [
  { id: "home", label: "Home" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];

const PortfolioRoadmap = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const touchStart = useRef(null);
  const lastSwipeAt = useRef(0);
  const isLastStop = activeIndex === roadmapStops.length - 1;

  const scrollToStop = useCallback(
    (index) => {
      const boundedIndex = Math.max(
        0,
        Math.min(roadmapStops.length - 1, index)
      );
      document
        .getElementById(roadmapStops[boundedIndex].id)
        ?.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
    },
    [prefersReducedMotion]
  );

  useEffect(() => {
    let frameId = 0;

    const updateProgress = () => {
      frameId = 0;
      const stopPositions = roadmapStops.map((stop) => {
        const element = document.getElementById(stop.id);
        return element
          ? element.getBoundingClientRect().top + window.scrollY
          : null;
      });
      const markerPosition =
        window.scrollY + Math.min(window.innerHeight * 0.35, 240);
      let segment = 0;

      while (
        segment < roadmapStops.length - 1 &&
        stopPositions[segment + 1] !== null &&
        markerPosition >= stopPositions[segment + 1]
      ) {
        segment += 1;
      }

      const atPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 2;
      const nextStop = atPageEnd ? roadmapStops.length - 1 : segment;

      let nextProgress;
      if (atPageEnd || segment === roadmapStops.length - 1) {
        nextProgress = 1;
      } else {
        const start = stopPositions[segment] ?? 0;
        const end = stopPositions[segment + 1] ?? start;
        const segmentProgress =
          end > start
            ? Math.max(0, Math.min(1, (markerPosition - start) / (end - start)))
            : 0;
        nextProgress =
          (segment + segmentProgress) / (roadmapStops.length - 1);
      }

      setActiveIndex((current) => (current === nextStop ? current : nextStop));
      setProgress((current) =>
        Math.abs(current - nextProgress) < 0.002 ? current : nextProgress
      );
    };

    const scheduleUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const isEditing = (target) =>
      target instanceof Element &&
      target.closest(
        "input:not([type='radio']), textarea, select, [contenteditable='true']"
      );

    const isSwipeExempt = (target) =>
      target instanceof Element &&
      target.closest(
        "input, textarea, select, button, a, [contenteditable='true'], .contact-experience"
      );

    const handleKeyDown = (event) => {
      if (
        event.repeat ||
        document.querySelector(".game-modal") ||
        isEditing(event.target)
      ) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        scrollToStop(isLastStop ? 0 : activeIndex + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        scrollToStop(Math.max(0, activeIndex - 1));
      }
    };

    const handleTouchStart = (event) => {
      if (
        event.touches.length !== 1 ||
        document.querySelector(".game-modal") ||
        isSwipeExempt(event.target)
      ) {
        touchStart.current = null;
        return;
      }

      const touch = event.touches[0];
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        vertical: false,
      };
    };

    const handleTouchMove = (event) => {
      const start = touchStart.current;
      if (!start || event.touches.length !== 1) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      if (Math.abs(deltaY) < 12 || Math.abs(deltaY) <= Math.abs(deltaX)) return;

      start.vertical = true;
      if (event.cancelable) event.preventDefault();
    };

    const handleTouchEnd = (event) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start?.vertical) return;

      const deltaY = event.changedTouches[0].clientY - start.y;
      if (Math.abs(deltaY) < 55 || Date.now() - lastSwipeAt.current < 650) return;

      lastSwipeAt.current = Date.now();
      scrollToStop(
        deltaY < 0
          ? isLastStop
            ? 0
            : activeIndex + 1
          : Math.max(0, activeIndex - 1)
      );
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [activeIndex, isLastStop, scrollToStop]);

  const navigateNext = () => {
    scrollToStop(isLastStop ? 0 : activeIndex + 1);
  };

  return (
    <aside className="portfolio-roadmap" aria-label="Portfolio roadmap">
      <div className="roadmap-heading">
        <span>ROADMAP</span>
        <span>
          {String(activeIndex + 1).padStart(2, "0")}
          <i> / {String(roadmapStops.length).padStart(2, "0")}</i>
        </span>
      </div>

      <nav className="roadmap-track" aria-label="Portfolio sections">
        <div className="roadmap-rail" aria-hidden="true" />
        <motion.div
          className="roadmap-rail-progress"
          aria-hidden="true"
          animate={{ scaleY: progress }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 160, damping: 28 }
          }
        />
        {roadmapStops.map((stop, index) => (
          <button
            className={`roadmap-stop${activeIndex === index ? " is-active" : ""}`}
            key={stop.id}
            type="button"
            style={{ top: `${(index / (roadmapStops.length - 1)) * 100}%` }}
            onClick={() => scrollToStop(index)}
            aria-label={`Go to ${stop.label}`}
            aria-current={activeIndex === index ? "location" : undefined}
          >
            <span className="roadmap-stop-marker">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="roadmap-stop-label">{stop.label}</span>
          </button>
        ))}
        <motion.span
          className="roadmap-cursor"
          aria-hidden="true"
          animate={{ top: `${progress * 100}%` }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 160, damping: 28 }
          }
        />
      </nav>

      <div className="roadmap-current" aria-live="polite">
        <span>NOW EXPLORING</span>
        <strong>{roadmapStops[activeIndex].label}</strong>
      </div>

      <button
        className="roadmap-next-button"
        type="button"
        onClick={navigateNext}
        aria-label={
          isLastStop
            ? "Return to the beginning"
            : `Continue to ${roadmapStops[activeIndex + 1].label}`
        }
      >
        <span className="roadmap-next-label">
          {isLastStop ? "RESTART" : "NEXT STOP"}
        </span>
        <span className="roadmap-next-arrow" aria-hidden="true">
          {isLastStop ? "↑" : "↓"}
        </span>
      </button>
    </aside>
  );
};

export default PortfolioRoadmap;
