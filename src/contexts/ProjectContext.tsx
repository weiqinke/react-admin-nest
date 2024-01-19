import { getUserState } from "@/utils/core";
import React, { useState } from "react";

const ProjectContext: any = React.createContext({
  uid: undefined,
  userName: undefined,
  release: undefined,
  username: "",
  setValue: () => null
});

export const ProjectContextProvider = ({ children }) => {
  const [value, setValue] = useState(getUserState());
  return <ProjectContext.Provider value={{ ...value, setValue }}>{children}</ProjectContext.Provider>;
};

export default ProjectContext;
