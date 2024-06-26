import { Breadcrumb } from "antd";

import styles from "./index.module.scss";
import TypingCard from "../TypingCard";

const PageIntroduction = ({ infos, introduction }) => {
  return (
    <div className={styles.container}>
      <Breadcrumb>
        {infos.map((item, index) => (
          <Breadcrumb.Item key={index}>{item.title}</Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <div className={styles.introduction}>
        <TypingCard title="测试" source={`${introduction}`} fontSize="1rem" />
      </div>
    </div>
  );
};

export default PageIntroduction;
