import React from "react";
import { Link } from "react-router";

const Copyright = () => {
  return (
    <div className="h-5 pr-3 text-right">
      <Link to="https://beian.miit.gov.cn/" target="_blank" className="text-[#1677ff] active:text-[#1677ff]">
        京ICP备17023235号
      </Link>
    </div>
  );
};

export default Copyright;
