type ContextmenuProps = {
  x: number;
  y: number;
  isActive: boolean;
  onCloseLeft: () => void;
  onCloseRight: () => void;
  onCloseOther: () => void;
  onRefresh: () => void;
};

const Contextmenu = ({ x, y, isActive, onCloseLeft, onCloseRight, onCloseOther, onRefresh }: ContextmenuProps) => {
  return (
    <ul
      className="fixed z-[20000] m-0 w-28 list-none cursor-pointer select-none border border-[#e6e8ec] bg-white p-0 text-[#1c1f24] [&>li]:h-9 [&>li]:w-full [&>li]:text-center [&>li]:text-sm [&>li]:leading-9 [&>li:hover]:bg-[#e7f2ef]"
      style={{ left: x, top: y }}
      onClick={e => e.stopPropagation()}>
      <li onClick={onCloseLeft}>关闭左侧</li>
      <li onClick={onCloseRight}>关闭右侧</li>
      <li onClick={onCloseOther}>关闭其他</li>
      {isActive ? <li onClick={onRefresh}>刷新页面</li> : null}
    </ul>
  );
};

export default Contextmenu;
