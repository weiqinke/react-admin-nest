import { Breadcrumb } from "antd";
import TypingCard from "../TypingCard";

const PageIntroduction = ({ infos, introduction }) => {
  return (
    <div className="bg-white p-3 select-none">
      <Breadcrumb items={infos} />
      <div className="mt-3">
        <TypingCard title="测试" source={`${introduction}`} fontSize="1rem" />
      </div>
    </div>
  );
};

export default PageIntroduction;
