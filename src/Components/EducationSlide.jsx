import { useState } from "react";
import { FaPython } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { motion } from "motion/react";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import { PiPhone } from "react-icons/pi";
import { IoLanguage, IoMaleSharp } from "react-icons/io5";
import { FaLocationCrosshairs } from "react-icons/fa6";
import {
  MdEngineering,
  MdOutlineDeveloperMode,
  MdScience,
} from "react-icons/md";
import { TbBinaryTree, TbMathIntegralX } from "react-icons/tb";
import { usePortfolio } from "../context/PortfolioContext";

const universityIcons = [MdEngineering, MdOutlineDeveloperMode, TbBinaryTree];
const schoolIcons = [MdScience, TbMathIntegralX, FaPython];

const EducationSlide = ({ screen = "" }) => {
  const [menu, setMenu] = useState("Profile");
  const { portfolio } = usePortfolio();
  const { education } = portfolio;
  const isMobile = screen === "mobile";

  const profileItems = [
    { Icon: LiaBirthdayCakeSolid, value: education.profile.birthDate },
    { Icon: PiPhone, value: education.profile.phone },
    { Icon: IoLanguage, value: education.profile.languages },
    { Icon: IoIosMail, value: education.profile.email },
    { Icon: IoMaleSharp, value: education.profile.gender },
    { Icon: FaLocationCrosshairs, value: education.profile.location },
  ];

  const highlights = (items, icons) => (
    <div className="flex-1 gap-5 justify-center p-3">
      {items.map((item, index) => {
        const Icon = icons[index % icons.length];
        return (
          <div className="flex gap-3 m-4" key={`${item}-${index}`}>
            <Icon
              color="white"
              size={40}
              className="bg-primary rounded-full p-2"
            />
            <small className="text-white mt-2 tracking-wide w-10/12">
              {item}
            </small>
          </div>
        );
      })}
    </div>
  );

  const content = () => {
    if (menu === "Internships") {
      return (
        <motion.div className={`${screen}info`}>
          <h2>Internships</h2>
          <br />
          <p className="text-justify px-5 self-center">
            {education.internship}
          </p>
        </motion.div>
      );
    }

    if (menu === "HigherEducation") {
      return (
        <motion.div className={`${screen}info`}>
          <h2>
            {education.university.title} (CGPA: {education.university.cgpa})
          </h2>
          {highlights(education.university.highlights, universityIcons)}
        </motion.div>
      );
    }

    if (menu === "SchoolEducation") {
      return (
        <motion.div className={`${screen}info`}>
          <h2>
            {education.school.title}
            {" ("}
            12th: {education.school.twelfth} | 10th: {education.school.tenth})
          </h2>
          {highlights(education.school.highlights, schoolIcons)}
        </motion.div>
      );
    }

    return (
      <motion.div className={`${screen}info`}>
        <h2 className="tracking-wide">{education.profile.name}</h2>
        <div className={`profile-details ${isMobile ? "mobile" : ""}`}>
          {profileItems.map(({ Icon, value }, index) => (
            <div className="profile-detail" key={`${value}-${index}`}>
              <Icon
                color="white"
                size={40}
                className="bg-primary rounded-full p-2"
              />
              <small className="text-white tracking-wide">{value}</small>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const menuItems = [
    ["Internships", "Internships"],
    ["HigherEducation", "University"],
    ["SchoolEducation", "School"],
    ["Profile", isMobile ? "Profile" : "Personal Profile"],
  ];

  return (
    <div className="flex flex-col items-center">
      <div className={`flex gap-6 ${screen}Navbar`}>
        {menuItems.map(([value, label]) => (
          <motion.button
            type="button"
            key={value}
            onClick={() => setMenu(value)}
            onHoverStart={() => setMenu(value)}
            whileHover={{ scale: 1.1 }}
            aria-pressed={menu === value}
          >
            {label}
          </motion.button>
        ))}
      </div>
      {content()}
    </div>
  );
};

export default EducationSlide;
