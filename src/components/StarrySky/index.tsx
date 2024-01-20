import styles from "./index.module.scss";
const StarrySky = () => {
  return (
    <div>
      <div className={styles.container}>
        <div className={styles.shootingstars}>
          <div className={`${styles.shootingstar} ${styles.shootingstar1}`}></div>
          <div className={`${styles.shootingstar} ${styles.shootingstar2}`}></div>
          <div className={`${styles.shootingstar} ${styles.shootingstar3}`}></div>
          <div className={`${styles.shootingstar} ${styles.shootingstar4}`}></div>
          <div className={`${styles.shootingstar} ${styles.shootingstar5}`}></div>
        </div>
        <div className={styles.pyramids}>
          <div className={`${styles.pyramid} ${styles.pyramidgiza}`}></div>
          <div className={`${styles.pyramid} ${styles.pyramidKhafre}`}></div>
          <div className={`${styles.pyramid} ${styles.pyramidmenkaure}`}></div>
        </div>
        <div className={styles.sky}>
          <div className={styles.starssmall}></div>
          <div className={styles.starsmedium}></div>
          <div className={styles.starslarge}></div>
        </div>
      </div>
    </div>
  );
};

export default StarrySky;
