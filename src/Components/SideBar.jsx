import { motion } from "motion/react";
import AdminTrigger from "./AdminTrigger";
import { usePortfolio } from "../context/PortfolioContext";

const SideBar = ({ onAdminOpen }) => {
  const { portfolio } = usePortfolio();

  return (
    <header className="flex header mb-20 w-11/12 items-center rounded-full p-2">
      <div className="w-full flex justify-between items-center bg-black h-20 p-4 rounded-full">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <AdminTrigger
            className="bg-white rounded-full flex justify-between items-center"
            onAdminOpen={onAdminOpen}
            onHome={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <h1 className="font-extrabold text-black text-5xl flex items-center z-10">
              G
            </h1>
          </AdminTrigger>
        </motion.div>
        <nav className="flex gap-5" aria-label="Portfolio documents">
          <motion.a
            href={portfolio.links.resume}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-xl mobileA rounded-full"
          >
            Resume
          </motion.a>
          <motion.a
            href={portfolio.links.certificates}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-xl mobileA p-2 rounded-full"
          >
            Certificates
          </motion.a>
        </nav>
      </div>
    </header>
  );
};

export default SideBar;
