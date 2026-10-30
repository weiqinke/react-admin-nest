import { subscribeSession, getUserState } from "@/api/session";
import { userinfo } from "@/api/user";
import React, { useEffect, useState } from "react";

const ProjectContext: any = React.createContext({
  profile: {},
  setProfile: () => null,
  value: {},
  setValue: () => null,
  theme: {},
  setTheme: () => null
});

export const ProjectContextProvider = ({ theme, setTheme, children }) => {
  const [value, setValue] = useState(getUserState);
  const [profile, setProfile] = useState({});

  useEffect(() => subscribeSession(setValue), []);

  useEffect(() => {
    if (!value.uid) {
      setProfile({});
      return;
    }
    const controller = new AbortController();
    userinfo({ signal: controller.signal })
      .then(res => {
        if (!controller.signal.aborted) setProfile(res.data?.data?.profile || {});
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [value.uid]);

  return <ProjectContext.Provider value={{ value, setValue, profile, setProfile, theme, setTheme }}>{children}</ProjectContext.Provider>;
};

export default ProjectContext;
