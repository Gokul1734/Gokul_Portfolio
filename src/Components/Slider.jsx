import Marquee from "react-fast-marquee";
import { FaCss3, FaDatabase, FaHtml5, FaNodeJs, FaPython, FaReact } from "react-icons/fa";
import { IoLogoFirebase } from "react-icons/io5";
import { LuFileJson } from "react-icons/lu";
import { PiFileCpp, PiShareNetworkFill } from "react-icons/pi";
import { SiExpress, SiMongodb } from "react-icons/si";
import { usePortfolio } from "../context/PortfolioContext";

const iconGroups = [
  <>
    <FaNodeJs size={60} color="green" />
    <SiExpress size={60} color="gray" />
    <PiShareNetworkFill size={60} color="blue" />
  </>,
  <>
    <LuFileJson size={60} color="white" />
    <FaPython size={60} color="yellow" />
    <PiFileCpp size={60} color="navy" />
  </>,
  <>
    <FaHtml5 size={60} color="red" />
    <FaCss3 size={60} color="orange" />
    <FaReact size={60} color="skyblue" />
  </>,
  <>
    <FaDatabase size={60} color="white" />
    <SiMongodb size={60} color="green" />
    <IoLogoFirebase size={60} color="yellow" />
  </>,
];

const Slider = ({ screen }) => {
  const { portfolio } = usePortfolio();
  const isMobile = screen === "mobile";

  return (
    <Marquee
      speed={200}
      className={`slider bg-transparent ${
        isMobile ? "h-10 py-3" : "h-48 py-10"
      } flex justify-evenly items-center`}
    >
      <span className="flex justify-evenly items-center gap-20 text-contrast">
        {portfolio.marquee.map((label, index) => (
          <span
            className="flex justify-evenly items-center gap-8"
            key={`${label}-${index}`}
          >
            <h1>{label}</h1>
            <section className="flex gap-8">
              {iconGroups[index % iconGroups.length]}
            </section>
          </span>
        ))}
      </span>
    </Marquee>
  );
};

export default Slider;
