import styles from "./index.module.scss";

const Owl = ({ closeEyes }) => {
  return (
    <div className={styles.owlRect}>
      <div className={styles.position}>
        <div className={`${styles.owlContainer} ${closeEyes ? styles.owlpassword : ""}`}>
          <div className={styles.leftHand} />
          <div className={styles.rightHand} />
          <div className={styles.leftHideHand} />
          <div className={styles.rightHideHand} />
          <div className={styles.closeEyes} />
        </div>
      </div>
    </div>
  );
};

export default Owl;
