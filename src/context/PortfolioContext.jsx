import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onValue, ref } from "firebase/database";
import db from "../../firbase";
import localPortfolio from "../../portfolio-data/content.json";
import { mergePortfolio } from "../data/portfolioDefaults";

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [portfolio, setPortfolio] = useState(() => mergePortfolio(localPortfolio));
  const [dataStatus, setDataStatus] = useState("loading");
  const [dataError, setDataError] = useState("");

  useEffect(() => {
    if (import.meta.env.DEV) {
      let active = true;

      fetch("/__local_portfolio/content")
        .then((response) => {
          if (!response.ok) throw new Error("Local content request failed.");
          return response.json();
        })
        .then((content) => {
          if (!active) return;
          setPortfolio(mergePortfolio(content));
          setDataStatus("ready");
          setDataError("");
        })
        .catch((error) => {
          console.error("Could not read the local portfolio content file.", error);
          if (!active) return;
          setPortfolio(mergePortfolio(localPortfolio));
          setDataStatus("error");
          setDataError("Local portfolio content could not be loaded.");
        });

      return () => {
        active = false;
      };
    }

    const unsubscribe = onValue(
      ref(db, "portfolio/content"),
      (snapshot) => {
        try {
          setPortfolio(
            snapshot.exists()
              ? mergePortfolio(snapshot.val())
              : mergePortfolio(localPortfolio)
          );
          setDataStatus("ready");
          setDataError("");
        } catch (error) {
          console.error("Could not read the saved portfolio content.", error);
          setPortfolio(mergePortfolio(localPortfolio));
          setDataStatus("error");
          setDataError("Live portfolio data could not be loaded.");
        }
      },
      (error) => {
        console.error("Could not connect to the portfolio content database.", error);
        setPortfolio(mergePortfolio(localPortfolio));
        setDataStatus("error");
        setDataError("Live portfolio data could not be loaded.");
      }
    );

    return unsubscribe;
  }, []);

  const replacePortfolio = useCallback((content) => {
    setPortfolio(mergePortfolio(content));
    setDataStatus("ready");
    setDataError("");
  }, []);

  const value = useMemo(
    () => ({ portfolio, dataStatus, dataError, replacePortfolio }),
    [portfolio, dataStatus, dataError, replacePortfolio]
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
