import React, { useCallback, useEffect, useState } from "react";

const GlobalContext = React.createContext({ isMobile: false, isTablet: false, isDesktop: false });

export default GlobalContext;

export const GlobalContextProvider = ({ children }) => {
  const offsetWidth = document.body.offsetWidth;

  const [isMobile, setIsMobile] = useState(offsetWidth <= 720);
  const [isTablet, setIsTablet] = useState(offsetWidth >= 721 && offsetWidth <= 1199);
  const [isDesktop, setIsDesktop] = useState(offsetWidth >= 1200);

  const resize = useCallback(() => {
    const offsetWidth = document.body.offsetWidth;
    setIsMobile(offsetWidth <= 720);
    setIsTablet(offsetWidth >= 721 && offsetWidth <= 1199);
    setIsDesktop(offsetWidth >= 1200);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", resize);
    return () => {
      window && window.removeEventListener("resize", resize);
    };
  }, []);

  return <GlobalContext.Provider value={{ isMobile, isTablet, isDesktop }}>{children}</GlobalContext.Provider>;
};
