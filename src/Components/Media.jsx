import { AiFillGithub, AiFillInstagram, AiFillLinkedin, AiFillTwitterCircle } from "react-icons/ai";
import { motion } from "motion/react";
import { usePortfolio } from "../context/PortfolioContext";

const socialLinks = [
  { key: "x", label: "X", Icon: AiFillTwitterCircle },
  { key: "instagram", label: "Instagram", Icon: AiFillInstagram },
  { key: "github", label: "GitHub", Icon: AiFillGithub },
  { key: "linkedin", label: "LinkedIn", Icon: AiFillLinkedin },
];

const Media = () => {
  const { portfolio } = usePortfolio();

  return (
    <div className="media">
      {socialLinks.map(({ key, label, Icon }) => (
        <motion.a
          key={key}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.8 }}
          href={portfolio.links.social[key]}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
        >
          <Icon size={50} />
        </motion.a>
      ))}
    </div>
  );
};

export default Media;
