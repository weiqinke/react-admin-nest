import { TICKET_STATUS, TICKET_STATUS_COLOR } from "@/api/platform";
import { Tag } from "antd";
import { FC } from "react";

type Props = {
  status?: string;
};

const TicketStatusTag: FC<Props> = ({ status }) => {
  const key = status || "";
  return <Tag color={TICKET_STATUS_COLOR[key] || "default"}>{TICKET_STATUS[key] || key || "—"}</Tag>;
};

export default TicketStatusTag;
