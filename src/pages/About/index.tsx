import { Descriptions } from "antd";
import styles from "./index.module.scss";
import { Link } from "react-router-dom";
import TypingCard from "@/components/TypingCard";

const About = () => {
  const { dependencies, devDependencies, version, lastBuildTime } = REACT_PACKAGE;

  const depResult = [];
  for (const key in dependencies) {
    depResult.push({
      key,
      label: key,
      children: dependencies[key]
    });
  }

  const devResult = [];
  for (const key in devDependencies) {
    devResult.push({
      key,
      label: key,
      children: devDependencies[key]
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Descriptions title="关于项目" column={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }} />
        <TypingCard
          title=""
          source={`nest-admin-react 是一个基于 React、 Ant design、TypeScript、 Nest.js
          和 Mysql 构建的后台通用管理系统。持续更新。`}
        />
      </div>

      <div className={styles.card}>
        <Descriptions
          title="项目信息"
          bordered
          column={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
          items={[
            {
              label: "版本信息",
              children: version
            },
            {
              label: "最后编译时间",
              children: lastBuildTime
            },
            {
              label: "仓库地址",
              children: (
                <Link to={"https://github.com/weiqinke/react-admin-nest"} target="_blank">
                  仓库地址
                </Link>
              )
            },
            {
              label: "预览地址",
              children: (
                <Link to={"https://nest-admin.com/"} target="_blank">
                  预览地址
                </Link>
              )
            }
          ]}
        />
      </div>
      <div className={styles.card}>
        <Descriptions title="生产环境依赖" bordered column={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }} items={depResult} />
      </div>
      <div className={styles.card}>
        <Descriptions title="开发环境依赖" bordered column={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }} items={devResult} />
      </div>
    </div>
  );
};

export default About;
