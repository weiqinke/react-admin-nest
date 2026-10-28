import React, { FC } from "react";

import SystemInfo from "@/components/SystemInfo";
import LoginLog from "@/components/LoginLog";

const Workbench: FC = () => {
  return (
    <div className="p-3">
      <div className="mb-3">
        <SystemInfo />
      </div>
      <LoginLog />
    </div>
  );
};

export default Workbench;
