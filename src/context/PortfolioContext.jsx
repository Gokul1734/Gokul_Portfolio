import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onValue, ref } from "firebase/database";
import db from "../../firbase";
import {
  copyPortfolio,
  DEFAULT_PORTFOLIO,
  mergePortfolio,
} from "../data/portfolioDefaults";

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState(DEFAULT_PORTFOLIO);
  const [dataStatus, setDataStatus] = useState("loading");
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    const unsubscribe = onValue(
      ref(db, "portfolio/content"),
      (snapshot) => {
        try {
          setPortfolio(
            snapshot.exists() ? mergePortfolio(snapshot.val()) : copyPortfolio()
          );
          setDataStatus("ready");
          setDataError("");
        } catch (error) {
          console.error("Could not read the saved portfolio content.", error);
          setPortfolio(copyPortfolio());
          setDataStatus("error");
          setDataError("Live portfolio data could not be loaded.");
        }
      },
      (error) => {
        console.error("Could not connect to the portfolio content database.", error);
        setPortfolio(copyPortfolio());
        setDataStatus("error");
        setDataError("Live portfolio data could not be loaded.");
      }
    );

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({ portfolio, dataStatus, dataError }),
    [portfolio, dataStatus, dataError]
  );

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio must be used within a PortfolioProvider.");
  }
  return context;
};
