import styles from "./index.module.scss";

const MenuTag = ({ tag, onClose }) => {
  const className = tag?.active ? styles.activeContainer : styles.container;
  return (
    <div className={className}>
      <span className={`${tag?.active ? styles.activeRound : styles.round}`} />
      <span className={styles.name}>{tag.name}</span>
      <span className={styles.close} onClick={(e) => onClose(e, tag)}></span>
    </div>
  );
};

export default MenuTag;
