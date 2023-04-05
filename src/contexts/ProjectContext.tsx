import { getUserState } from "@/utils/core";
import React, { useState } from "react";

const SYSTEM_TOKEN = "token";

const ProjectContext = React.createContext({
  uid: undefined,
  userName: undefined,
  release: undefined,
  username: "",
  setValue: v => null
});

export default ProjectContext;

export const ProjectContextProvider = ({ children }) => {
  const [value, setValue] = useState(getUserState());
  return <ProjectContext.Provider value={{ ...value, setValue }}> {children} </ProjectContext.Provider>;
};
