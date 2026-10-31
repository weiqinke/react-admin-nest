import PageIntroduction from "@/components/PageIntroduction";
import { Tabs } from "antd";
import { FC } from "react";
import RulesTab from "./RulesTab";
import TemplatesTab from "./TemplatesTab";
import TicketListTab from "./TicketListTab";

const infos = [{ title: "系统管理" }, { title: "工单处理" }];

const TicketAdmin: FC = () => {
  return (
    <div className="admin-page">
      <PageIntroduction
        infos={infos}
        introduction="列表已按当前角色的数据范围过滤。支持批量分派/关闭/改优先级。模板用于创建工单预填；自动分派规则按优先级轮询处理人池。"
      />
      <div className="admin-card">
        <Tabs
          items={[
            { key: "list", label: "工单列表", children: <TicketListTab /> },
            { key: "templates", label: "工单模板", children: <TemplatesTab /> },
            { key: "rules", label: "自动分派", children: <RulesTab /> }
          ]}
        />
      </div>
    </div>
  );
};

export default TicketAdmin;
