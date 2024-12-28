import { userinfo } from "@/api/microservice/user";
import { getUserState } from "@/utils/core";
import axios from "axios";
import React, { useEffect, useState } from "react";

const Cancel = axios.CancelToken;
const source = Cancel.source();

const ProjectContext: any = React.createContext({
  profile: {},
  setProfile: () => null,
  value: {},
  setValue: () => null,
  theme: {},
  setTheme: () => null
});

export const ProjectContextProvider = ({ theme, setTheme, children }) => {
  const [value, setValue] = useState(getUserState());
  const [profile, setProfile] = useState({});

  useEffect(() => {
    if (value.uid) {
      userinfo({ uid: value.uid, cancelToken: source.token }).then(res => {
        setProfile(res.data.data.profile);
      });
    }
    return () => {
      source.cancel();
    };
  }, [value]);

  return <ProjectContext.Provider value={{ value, setValue, profile, setProfile, theme, setTheme }}>{children}</ProjectContext.Provider>;
};

export default ProjectContext;
