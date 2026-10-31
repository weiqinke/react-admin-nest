import { hasPermission } from "@/api/announcement";
import {
  addMyTicketWatcher,
  addTicketWatcher,
  assignTicket,
  closeMyTicket,
  closeTicket,
  commentMyTicket,
  commentTicket,
  flattenDepts,
  getMyTicket,
  getTicket,
  listDepts,
  listMyTicketWatchers,
  listTicketWatchers,
  processTicket,
  rateMyTicket,
  removeMyTicketWatcher,
  removeTicketWatcher,
  reopenMyTicket,
  reopenTicket,
  setTicketPriority,
  ticketOverdue,
  TICKET_PRIORITY,
  toDeptTree
} from "@/api/platform";
import { getUserState } from "@/api/session";
import LabelBind from "@/components/LabelBind";
import TicketStatusTag from "@/components/TicketStatusTag";
import { findUserOptions } from "@/api/user";
import { Button, Descriptions, Drawer, Form, Input, Rate, Select, Space, Spin, Tag, Timeline, TreeSelect, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

const actionLabel: Record<string, string> = {
  create: "提交",
  assign: "分派",
  process: "开始处理",
  close: "关闭",
  comment: "留言",
  reopen: "重开",
  priority: "改优先级",
  rate: "评分"
};

type Props = {
  ticketId: string;
  mine?: boolean;
  onClose: () => void;
  onChanged: () => void;
};

const TicketPanel: FC<Props> = ({ ticketId, mine, onClose, onChanged }) => {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [watchers, setWatchers] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [commentForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const canWrite = !mine && hasPermission("ticket:write");

  const loadWatchers = () => {
    const request = mine ? listMyTicketWatchers(ticketId) : listTicketWatchers(ticketId);
    request.then(res => setWatchers((res.data?.data?.list || []).map(String))).catch(() => setWatchers([]));
  };

  const load = () => {
    setLoading(true);
    const request = mine ? getMyTicket(ticketId) : getTicket(ticketId);
    request
      .then(res => setTicket(res.data?.data || null))
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
    loadWatchers();
  };

  const viewerId = String(getUserState().uid || "");
  const isCreator = !!ticket && String(ticket.creator_id) === viewerId;
  const watching = watchers.includes(viewerId);

  useEffect(() => {
    setAction("");
    setTicket(null);
    form.resetFields();
    commentForm.resetFields();
    setLoading(true);
    const request = mine ? getMyTicket(ticketId) : getTicket(ticketId);
    request
      .then(res => setTicket(res.data?.data || null))
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
    loadWatchers();
  }, [ticketId, mine, form, commentForm]);

  useEffect(() => {
    if (hasPermission("user:read")) {
      findUserOptions()
        .then(res => setUsers(res.data?.data || []))
        .catch(() => setUsers([]));
    }
    if (!mine && canWrite && hasPermission("dept:read")) {
      listDepts()
        .then(res => setDepts(res.data?.data?.list || []))
        .catch(() => setDepts([]));
    }
  }, [mine, canWrite]);

  const deptName = (id?: string) => {
    if (!id) return "未分派";
    return flattenDepts(depts).find(item => String(item.id) === String(id))?.name || id;
  };

  const userName = (id?: string) => {
    if (!id) return "未分派";
    return users.find(item => String(item.uid || item.id) === String(id))?.username || id;
  };

  const submit = async (values: any) => {
    setSaving(true);
    try {
      if (action === "assign") {
        if (!values.assignee_id && !values.department_id) {
          message.warning("处理人和部门至少填一个");
          return;
        }
        await assignTicket(ticketId, {
          assignee_id: values.assignee_id || "",
          department_id: values.department_id || ""
        });
      } else if (action === "process") {
        await processTicket(ticketId, values.note);
      } else if (action === "close") {
        const close = mine ? closeMyTicket : closeTicket;
        await close(ticketId, values.close_reason);
      } else if (action === "reopen") {
        const reopen = mine ? reopenMyTicket : reopenTicket;
        await reopen(ticketId, values.reason || "");
      } else if (action === "priority") {
        await setTicketPriority(ticketId, values.priority);
      } else if (action === "rate") {
        await rateMyTicket(ticketId, Number(values.rating), values.comment || "");
      }
      message.success("已更新");
      setAction("");
      form.resetFields();
      load();
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const submitComment = async (values: { content: string }) => {
    setSaving(true);
    try {
      const send = mine ? commentMyTicket : commentTicket;
      const res = await send(ticketId, values.content);
      setTicket(res.data?.data || null);
      commentForm.resetFields();
      message.success("已留言");
      onChanged();
    } finally {
      setSaving(false);
    }
  };

  const movable = ticket && (ticket.status === "open" || ticket.status === "assigned");
  const open = ticket && ticket.status !== "closed";
  const canComment = Boolean(open && (mine || canWrite));

  return (
    <Drawer open title={ticket?.title || "工单"} size={560} onClose={onClose} destroyOnHidden>
      {loading ? (
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      ) : ticket ? (
        <>
          {mine && !isCreator ? <div className="mb-3 text-neutral-500">这张工单分派给你。关闭只能由提单人，或有工单处理权限的管理员操作。</div> : null}
          <Descriptions column={1} size="small">
            <Descriptions.Item label="状态">
              <TicketStatusTag status={ticket.status} />
            </Descriptions.Item>
            <Descriptions.Item label="优先级">{TICKET_PRIORITY[ticket.priority] || ticket.priority}</Descriptions.Item>
            <Descriptions.Item label="处理人">{userName(ticket.assignee_id)}</Descriptions.Item>
            <Descriptions.Item label="部门">{deptName(ticket.department_id)}</Descriptions.Item>
            <Descriptions.Item label="截止">
              {ticket.due_at ? (
                <span>
                  {dayjs(ticket.due_at).format("YYYY-MM-DD HH:mm")}
                  {ticketOverdue(ticket) ? (
                    <Tag color="red" className="ml-1">
                      已过期
                    </Tag>
                  ) : null}
                </span>
              ) : (
                "未设置"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="内容">{ticket.content}</Descriptions.Item>
            {ticket.close_reason ? <Descriptions.Item label="关闭原因">{ticket.close_reason}</Descriptions.Item> : null}
            {ticket.rating ? <Descriptions.Item label="评分">{ticket.rating} 星</Descriptions.Item> : null}
            <Descriptions.Item label="关注人">
              {watchers.length ? (
                <Space size={4} wrap>
                  {watchers.map(id => (
                    <Tag
                      key={id}
                      closable={canWrite && id !== viewerId}
                      onClose={async e => {
                        e.preventDefault();
                        await removeTicketWatcher(ticketId, id);
                        message.success("已取消关注");
                        loadWatchers();
                      }}>
                      {userName(id)}
                    </Tag>
                  ))}
                </Space>
              ) : (
                "无"
              )}
            </Descriptions.Item>
          </Descriptions>
          <Space className="mt-2 mb-2" wrap>
            <Button
              size="small"
              loading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  if (watching) {
                    if (mine) await removeMyTicketWatcher(ticketId);
                    else await removeTicketWatcher(ticketId, viewerId);
                    message.success("已取消关注");
                  } else {
                    if (mine) await addMyTicketWatcher(ticketId);
                    else await addTicketWatcher(ticketId);
                    message.success("已关注");
                  }
                  loadWatchers();
                } finally {
                  setSaving(false);
                }
              }}>
              {watching ? "取消关注" : "关注工单"}
            </Button>
            {canWrite && users.length ? (
              <Select
                size="small"
                style={{ width: 180 }}
                placeholder="添加关注人"
                showSearch
                optionFilterProp="label"
                options={users.map(item => ({ value: String(item.uid || item.id), label: item.username })).filter(item => !watchers.includes(item.value))}
                onSelect={async (userId: string) => {
                  await addTicketWatcher(ticketId, userId);
                  message.success("已添加关注");
                  loadWatchers();
                }}
              />
            ) : null}
          </Space>
          {hasPermission("label:read") ? (
            <div className="mt-3">
              <div className="mb-2">标签</div>
              <LabelBind targetType="ticket" targetId={String(ticket.id)} />
            </div>
          ) : null}
          <div className="mt-4 mb-2">处理记录</div>
          <Timeline
            items={(ticket.events || []).map((event: any) => ({
              key: event.id,
              content: (
                <div>
                  <div>{actionLabel[event.action] || event.action}</div>
                  <div className="text-xs text-neutral-500">
                    {event.created_at}
                    {event.note ? ` · ${event.note}` : ""}
                  </div>
                </div>
              )
            }))}
          />
          {canWrite && movable ? (
            <Space className="mb-3" wrap>
              <Button onClick={() => setAction("assign")}>分派</Button>
              <Button onClick={() => setAction("process")}>开始处理</Button>
              <Button onClick={() => setAction("priority")}>改优先级</Button>
            </Space>
          ) : null}
          {open && ((mine && isCreator) || (!mine && canWrite)) ? (
            <Button className="mb-3" onClick={() => setAction("close")}>
              关闭工单
            </Button>
          ) : null}
          {ticket.status === "closed" && ((mine && isCreator) || (!mine && canWrite)) ? (
            <Space className="mb-3" wrap>
              <Button onClick={() => setAction("reopen")}>重开</Button>
              {mine && isCreator && !ticket.rating ? <Button onClick={() => setAction("rate")}>评分</Button> : null}
            </Space>
          ) : null}
          {action ? (
            <Form form={form} layout="vertical" onFinish={submit}>
              {action === "assign" ? (
                <>
                  <Form.Item name="assignee_id" label="处理人" extra="指定处理人会给他发一条待办，入口是我的工单。只选部门不会发待办。">
                    {users.length ? (
                      <Select
                        allowClear
                        showSearch
                        optionFilterProp="label"
                        placeholder="选择处理人"
                        options={users.map(item => ({ value: String(item.uid || item.id), label: item.username }))}
                      />
                    ) : (
                      <Input placeholder="处理人的用户 ID" />
                    )}
                  </Form.Item>
                  <Form.Item name="department_id" label="部门">
                    {depts.length ? (
                      <TreeSelect allowClear treeDefaultExpandAll placeholder="选择部门" treeData={toDeptTree(depts, { disableOff: true })} />
                    ) : (
                      <Input placeholder="部门 ID，可留空" />
                    )}
                  </Form.Item>
                </>
              ) : null}
              {action === "process" ? (
                <Form.Item name="note" label="备注">
                  <Input.TextArea rows={3} maxLength={1024} placeholder="可选" />
                </Form.Item>
              ) : null}
              {action === "close" ? (
                <Form.Item name="close_reason" label="关闭原因" rules={[{ required: true, message: "请填写关闭原因" }]}>
                  <Input.TextArea rows={3} maxLength={512} />
                </Form.Item>
              ) : null}
              {action === "reopen" ? (
                <Form.Item name="reason" label="重开说明">
                  <Input.TextArea rows={3} maxLength={512} placeholder="可选" />
                </Form.Item>
              ) : null}
              {action === "priority" ? (
                <Form.Item name="priority" label="优先级" rules={[{ required: true, message: "请选择优先级" }]} initialValue={ticket.priority}>
                  <Select options={Object.entries(TICKET_PRIORITY).map(([value, label]) => ({ value, label }))} />
                </Form.Item>
              ) : null}
              {action === "rate" ? (
                <>
                  <Form.Item name="rating" label="评分" rules={[{ required: true, message: "请评分" }]} initialValue={5}>
                    <Rate />
                  </Form.Item>
                  <Form.Item name="comment" label="评价">
                    <Input.TextArea rows={3} maxLength={512} placeholder="可选" />
                  </Form.Item>
                </>
              ) : null}
              <Space>
                <Button type="primary" htmlType="submit" loading={saving}>
                  确定
                </Button>
                <Button onClick={() => setAction("")}>取消</Button>
              </Space>
            </Form>
          ) : null}
          {canComment ? (
            <Form form={commentForm} layout="vertical" onFinish={submitComment} className="mt-3">
              <Form.Item
                name="content"
                label="留言"
                extra="留言不会改变工单状态。有处理人时会通知对方。"
                rules={[
                  { required: true, whitespace: true, message: "请填写留言" },
                  { max: 1024, message: "留言不超过 1024 个字符" }
                ]}>
                <Input.TextArea rows={3} maxLength={1024} placeholder="补充说明" />
              </Form.Item>
              <Button htmlType="submit" loading={saving}>
                发送留言
              </Button>
            </Form>
          ) : null}
        </>
      ) : (
        <div>工单不存在，或已超出当前数据范围</div>
      )}
    </Drawer>
  );
};

export default TicketPanel;
