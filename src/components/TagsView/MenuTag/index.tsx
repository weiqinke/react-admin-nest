import styles from "./index.module.scss";

const MenuTag = ({ tag, onClose }) => {
  const active = Boolean(tag?.active);

  return (
    <div
      className={`relative m-0 whitespace-nowrap rounded-t bg-[#fafafa] py-0.5 pl-4 pr-5 select-none border-b-2 ${
        active ? "border-[#41b3a3]" : "border-black"
      }`}>
      <span
        className={`absolute top-[9px] left-[7px] h-[9px] w-[9px] rounded-full ${
          active ? "bg-[#41b3a3]" : "bg-[#ccc]"
        }`}
      />
      <span className="mx-[5px] text-[#575757] hover:text-[#313653] hover:opacity-85">{tag.name}</span>
      <span className={styles.close} onClick={e => onClose(e, tag)} />
    </div>
  );
};

export default MenuTag;
