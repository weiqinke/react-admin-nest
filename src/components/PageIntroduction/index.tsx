import { Breadcrumb } from "antd";
import TypingCard from "../TypingCard";

import styles from "./index.module.scss";
const PageIntroduction = ({ infos, introduction }) => {
  return (
    <div className={styles.container}>
      <Breadcrumb items={infos} />
      <div className={styles.introduction}>
        <TypingCard title="测试" source={`${introduction}`} fontSize="1rem" />
      </div>
    </div>
  );
};

export default PageIntroduction;
