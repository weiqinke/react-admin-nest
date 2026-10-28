const Contextmenu = ({ pageclientX, pageclientY, handleCloseLeftTags, handleCloseRightTags, handleCloseOtherTags, contextMenuTag, refreshPage }) => {
  return (
    <ul
      className="fixed z-[20000] m-0 w-28 list-none cursor-pointer select-none rounded-lg bg-white p-0 shadow-[-4px_4px_16px_1px_rgba(0,0,0,0.15)] [&>li]:h-10 [&>li]:w-full [&>li]:text-center [&>li]:text-sm [&>li]:leading-10 [&>li:first-child]:rounded-t-lg [&>li:last-child]:rounded-b-lg [&>li:hover]:bg-[#41b3a3] [&>li:hover]:text-[#313653]"
      style={{ left: `${pageclientX}px`, top: `${pageclientY}px` }}>
      <li onClick={handleCloseLeftTags}>关闭左侧</li>
      <li onClick={handleCloseRightTags}>关闭右侧</li>
      <li onClick={handleCloseOtherTags}>关闭其他</li>
      {contextMenuTag?.active ? <li onClick={refreshPage}>刷新页面</li> : ""}
    </ul>
  );
};

export default Contextmenu;
