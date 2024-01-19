import React, { FC } from "react";

import styles from "./index.module.scss";
import SystemInfo from "@/components/SystemInfo";
import LoginLog from "@/components/LoginLog";

const Workbench: FC = () => {
  return (
    <div className={styles.workbench}>
      <div className={styles.info}>
        <SystemInfo />
      </div>
      <LoginLog />
    </div>
  );
};

export default Workbench;
