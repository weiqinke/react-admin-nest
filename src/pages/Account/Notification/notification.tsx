import { NOTIFY_CHANNEL_LABELS, NOTIFY_EVENT_LABELS, getNotifyPrefs, getPreferences, putNotifyPrefs, putPreferences } from "@/api/ops";
import { Button, Divider, Form, Input, Select, Switch, Table, message } from "antd";
import React, { useEffect, useMemo, useState } from "react";

const NotificationPage: React.FC = function () {
  const [items, setItems] = useState<any[]>([]);
  const [quietStart, setQuietStart] = useState("");
  const [quietEnd, setQuietEnd] = useState("");
  const [prefs, setPrefs] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [prefForm] = Form.useForm();

  const load = () => {
    getNotifyPrefs()
      .then(res => {
        const data = res.data?.data || {};
        setItems(data.list || []);
        setQuietStart(data.quiet_hours_start || "");
        setQuietEnd(data.quiet_hours_end || "");
      })
      .catch(() => setItems([]));
    getPreferences()
      .then(res => {
        const data = res.data?.data || {};
        setPrefs(data);
        prefForm.setFieldsValue({
          theme: data.theme || undefined,
          locale: data.locale || undefined,
          timezone: data.timezone || undefined,
          home_layout: data.home_layout || undefined,
          sidebar_collapsed: data.sidebar_collapsed === true || data.sidebar_collapsed === "true"
        });
      })
      .catch(() => setPrefs({}));
  };

  useEffect(() => {
    load();
  }, []);

  const byEvent = useMemo(() => {
    const map = new Map<string, Record<string, boolean>>();
    items.forEach(item => {
      const row = map.get(item.event) || {};
      row[item.channel] = Boolean(item.enabled);
      map.set(item.event, row);
    });
    return Array.from(map.entries()).map(([event, channels]) => ({ event, ...channels }));
  }, [items]);

  const toggle = async (event: string, channel: string, enabled: boolean) => {
    setSaving(true);
    try {
      await putNotifyPrefs({ items: [{ event, channel, enabled }] });
      message.success("已更新");
      load();
    } finally {
      setSaving(false);
    }
  };

  const saveQuiet = async () => {
    setSaving(true);
    try {
      await putNotifyPrefs({ quiet_hours_start: quietStart, quiet_hours_end: quietEnd });
      message.success("静默时段已保存");
      load();
    } finally {
      setSaving(false);
    }
  };

  const savePrefs = async (values: any) => {
    setSaving(true);
    try {
      await putPreferences({
        theme: values.theme || "",
        locale: values.locale || "",
        timezone: values.timezone || "",
        home_layout: values.home_layout || "",
        sidebar_collapsed: Boolean(values.sidebar_collapsed)
      });
      message.success("偏好已保存");
      load();
    } finally {
      setSaving(false);
    }
  };

  const channels = Object.keys(NOTIFY_CHANNEL_LABELS);

  return (
    <div>
      <Divider titlePlacement="left" plain>
        消息通知
      </Divider>
      <Table
        rowKey="event"
        size="small"
        pagination={false}
        loading={saving}
        dataSource={byEvent}
        columns={[
          {
            title: "事件",
            dataIndex: "event",
            render: (event: string) => NOTIFY_EVENT_LABELS[event] || event
          },
          ...channels.map(channel => ({
            title: NOTIFY_CHANNEL_LABELS[channel] || channel,
            dataIndex: channel,
            width: 100,
            render: (enabled: boolean, row: any) => <Switch size="small" checked={Boolean(enabled)} onChange={checked => toggle(row.event, channel, checked)} />
          }))
        ]}
      />

      <Divider titlePlacement="left" plain>
        静默时段
      </Divider>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input style={{ width: 120 }} placeholder="开始 HH:MM" value={quietStart} onChange={e => setQuietStart(e.target.value)} />
        <span>至</span>
        <Input style={{ width: 120 }} placeholder="结束 HH:MM" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} />
        <Button type="primary" loading={saving} onClick={saveQuiet}>
          保存静默时段
        </Button>
        <span className="text-black/45">静默期内仍写站内信，跳过即时推送。</span>
      </div>

      <Divider titlePlacement="left" plain>
        界面偏好
      </Divider>
      <Form form={prefForm} layout="vertical" style={{ maxWidth: 420 }} onFinish={savePrefs} initialValues={prefs}>
        <Form.Item name="theme" label="主题">
          <Select
            allowClear
            options={[
              { value: "light", label: "浅色" },
              { value: "dark", label: "深色" }
            ]}
          />
        </Form.Item>
        <Form.Item name="locale" label="语言">
          <Select
            allowClear
            options={[
              { value: "zh-CN", label: "简体中文" },
              { value: "en-US", label: "English" }
            ]}
          />
        </Form.Item>
        <Form.Item name="timezone" label="时区">
          <Input placeholder="例如 Asia/Shanghai" />
        </Form.Item>
        <Form.Item name="home_layout" label="首页布局">
          <Input placeholder="可选" />
        </Form.Item>
        <Form.Item name="sidebar_collapsed" label="侧栏默认收起" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving}>
          保存偏好
        </Button>
      </Form>
    </div>
  );
};

export default NotificationPage;
