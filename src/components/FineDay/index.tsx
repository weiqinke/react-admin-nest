import styles from "./index.module.scss";

const FineDay = () => {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <div className={styles.sun}>
          <div className={styles.face}>
            <div className={styles.pupilleft}></div>
            <div className={styles.pupilright}></div>
            <div className={styles.smile}></div>
          </div>

          <div className={styles.ray}>
            <div className={`${styles.beam} ${styles.r1}`}></div>
            <div className={`${styles.beam} ${styles.r2}`}></div>
            <div className={`${styles.beam} ${styles.r3}`}></div>
            <div className={`${styles.beam} ${styles.r4}`}></div>
            <div className={`${styles.beam} ${styles.r5}`}></div>
            <div className={`${styles.beam} ${styles.r6}`}></div>
            <div className={`${styles.beam} ${styles.r7}`}></div>
            <div className={`${styles.beam} ${styles.r8}`}></div>
            <div className={`${styles.beam} ${styles.r9}`}></div>
            <div className={`${styles.beam} ${styles.r10}`}></div>
          </div>
        </div>

        <div className={styles.cloud}>
          <div className={styles.cloudleft}></div>
          <div className={styles.cloudright}></div>
          <div className={styles.cloudbottom}></div>
          <div className={styles.eyeleft}>
            <div className={styles.pupil}></div>
          </div>
          <div className={styles.eyeright}>
            <div className={styles.pupil}></div>
          </div>
          <div className={styles.mouth}></div>
          <div className={styles.tearleft}></div>
          <div className={styles.tearright}></div>
        </div>
      </div>
    </div>
  );
};

export default FineDay;
