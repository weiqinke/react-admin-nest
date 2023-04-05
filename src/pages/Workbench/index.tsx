import React, { FC } from "react";
import { LoginLog } from "@/components/Tables";
import SystemInfo from "@/components/SystemInfo";

import styles from "./index.module.scss";

const Workbench: FC = () => {
  const OsInfo: any = {};
  return (
    <div className={styles.workbench}>
      <div className={styles.info}>
        <SystemInfo OsInfo={OsInfo} />
      </div>
      <LoginLog />
    </div>
  );
};

export default Workbench;
