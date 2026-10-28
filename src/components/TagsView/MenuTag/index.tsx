import type { MouseEvent } from "react";
import type { MenuTagItem } from "@/contexts/MenuTagContext";
import styles from "./index.module.scss";

type MenuTagProps = {
  tag: MenuTagItem;
  active: boolean;
  onClose: (event: MouseEvent, tag: MenuTagItem) => void;
};

const MenuTag = ({ tag, active, onClose }: MenuTagProps) => {
  return (
    <div className={`${styles.container} ${active ? styles.active : ""}`}>
      <span className={`${styles.round} ${active ? styles.activeRound : ""}`} />
      <span className={styles.name}>{tag.name}</span>
      <span className={styles.close} onClick={e => onClose(e, tag)} />
    </div>
  );
};

export default MenuTag;
