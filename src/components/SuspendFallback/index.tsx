import { Spin } from "antd";
import styles from "./index.module.scss";

const SuspendFallback = () => {
  return (
    <div className={styles.container}>
      <Spin tip="加载中..." spinning>
        <div className={styles.loadingText}>
          <div className={styles.title}>正在加载中，不会太久，请稍等。</div>
        </div>
      </Spin>
    </div>
  );
};

export default SuspendFallback;
