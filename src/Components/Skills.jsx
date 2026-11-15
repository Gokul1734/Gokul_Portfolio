import { motion } from "motion/react";

const Skills = ({ skill, index = 0 }) => {
  const rating = Math.min(100, Math.max(0, Number(skill.rating ?? 65)));

  return (
    <motion.article
      className="skill-tile"
      initial={{ opacity: 0, y: 22, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -6, scale: 1.025 }}
      transition={{
        opacity: { duration: 0.4, delay: Math.min(index * 0.04, 0.5) },
        y: { duration: 0.4, delay: Math.min(index * 0.04, 0.5) },
        scale: { duration: 0.25 },
      }}
      aria-label={`${skill.name}, rated ${rating} out of 100`}
      title={`${skill.name} · ${rating}%`}
    >
      <span className="skill-icon">
        <img src={skill.image} alt="" loading="lazy" draggable="false" />
      </span>
      <div
        className="skill-progress-track"
        role="progressbar"
        aria-label={`${skill.name} rating`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rating}
      >
        <span
          className="skill-progress-fill"
          style={{
            width: `${rating}%`,
            animationDelay: `${Math.min(index * 0.04, 0.5)}s`,
          }}
        />
      </div>
    </motion.article>
  );
};

export default Skills;
