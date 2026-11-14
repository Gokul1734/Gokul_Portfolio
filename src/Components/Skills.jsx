import { motion } from "motion/react";

const Skills = ({ screen, div, skill, icon }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.96 }}
    className={`div${div} flex-col p-3`}
  >
    <img
      src={icon}
      alt=""
      className={screen === "mobile" ? "mobileSkills" : "skills mt-5"}
    />
    <h2 className={screen === "mobile" ? "text-xl p-0" : "text-2xl"}>
      {skill}
    </h2>
  </motion.div>
);

export default Skills;
