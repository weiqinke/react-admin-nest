import React, { useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import { useLocale } from "../locales";

const IntlContext = React.createContext({
  locale: "zh",
  setLocale: v => null,
  formatMessage: v => null
});

export default IntlContext;

export const IntlContextProvider = ({ children }) => {
  const language = localStorage.getItem("language");
  const { lacaleConfig, formatMessage } = useLocale();
  const [locale, setLocale] = useState(language || "zh");
  const [messages, setMessages] = useState({});

  useEffect(() => {
    setMessages(lacaleConfig[locale]);
  }, [locale]);

  return (
    <IntlContext.Provider value={{ locale, setLocale, formatMessage }}>
      <IntlProvider locale={locale} messages={messages} defaultLocale={language}>
        {children}
      </IntlProvider>
    </IntlContext.Provider>
  );
};
