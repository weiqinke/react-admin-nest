import React from "react";
import styles from "./index.module.scss";
import { Link } from "react-router-dom";

const Copyright = () => {
  return (
    <div className={styles.copyright}>
      <Link to="https://beian.miit.gov.cn/" target="_blank" className={styles.link}>
        京ICP备17023235号
      </Link>
    </div>
  );
};

export default Copyright;
