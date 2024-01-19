import styles from "./index.module.scss";

const Contextmenu = ({ pageclientX, pageclientY, handleCloseLeftTags, handleCloseRightTags, handleCloseOtherTags, contextMenuTag, refreshPage }) => {
  return (
    <ul className={styles.contextmenuDom} style={{ left: `${pageclientX}px`, top: `${pageclientY}px` }}>
      <li onClick={handleCloseLeftTags}>关闭左侧</li>
      <li onClick={handleCloseRightTags}>关闭右侧</li>
      <li onClick={handleCloseOtherTags}>关闭其他</li>
      {contextMenuTag?.active ? <li onClick={refreshPage}>刷新页面</li> : ""}
    </ul>
  );
};

export default Contextmenu;
