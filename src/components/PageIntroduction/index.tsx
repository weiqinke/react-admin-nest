import { Breadcrumb } from "antd";
import { memo } from "react";
import TypingCard from "../TypingCard";

type Props = {
  infos: { title: string }[];
  introduction: string;
};

const PageIntroduction = ({ infos, introduction }: Props) => {
  return (
    <div className="bg-white p-3 select-none">
      <Breadcrumb items={infos} />
      <div className="mt-3">
        <TypingCard source={introduction} fontSize="1rem" />
      </div>
    </div>
  );
};

export default memo(PageIntroduction);
