import { NOTIFY_CHANNEL_LABELS, NOTIFY_EVENT_LABELS, getNotifyPrefs, getNotifyPrefsCatalog, getPreferences, putNotifyPrefs, putPreferences } from "@/api/ops";
import { Button, Divider, Form, Input, Select, Space, Switch, Table, message } from "antd";
import React, { useEffect, useMemo, useState } from "react";

const NotificationPage: React.FC = function () {
  const [items, setItems] = useState<any[]>([]);
  const [quietStart, setQuietStart] = useState("");
  const [quietEnd, setQuietEnd] = useState("");
  const [prefs, setPrefs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prefForm] = Form.useForm();
  const [batchForm] = Form.useForm();
  const [eventLabels, setEventLabels] = useState<Record<string, string>>(NOTIFY_EVENT_LABELS);
  const [channelLabels, setChannelLabels] = useState<Record<string, string>>(NOTIFY_CHANNEL_LABELS);
  const [channels, setChannels] = useState<string[]>(Object.keys(NOTIFY_CHANNEL_LABELS));
  const [categories, setCategories] = useState<{ code: string; name: string; events: string[] }[]>([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      getNotifyPrefsCatalog()
        .then(res => {
          const data = res.data?.data || {};
          const nextEvents: Record<string, string> = { ...NOTIFY_EVENT_LABELS };
          (data.events || []).forEach((item: any) => {
            if (item?.code) nextEvents[item.code] = item.name || item.code;
          });
          setEventLabels(nextEvents);

          const nextChannels: Record<string, string> = { ...NOTIFY_CHANNEL_LABELS };
          const channelCodes: string[] = [];
          (data.channels || []).forEach((item: any) => {
            if (!item?.code) return;
            nextChannels[item.code] = item.name || item.code;
            channelCodes.push(item.code);
          });
          if (channelCodes.length) {
            setChannelLabels(nextChannels);
            setChannels(channelCodes);
          }
          setCategories(data.categories || []);
        })
        .catch(() => undefined),
      getNotifyPrefs()
        .then(res => {
          const data = res.data?.data || {};
          setItems(data.list || []);
          setQuietStart(data.quiet_hours_start || "");
          setQuietEnd(data.quiet_hours_end || "");
        })
        .catch(() => setItems([])),
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
        .catch(() => setPrefs({}))
    ]).finally(() => setLoading(false));
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
    return Array.from(map.entries()).map(([event, channelMap]) => ({ event, ...channelMap }));
  }, [items]);

  const toggle = async (event: string, channel: string, enabled: boolean) => {
    setSaving(true);
    try {
      await putNotifyPrefs({ items: [{ event, channel, enabled }] });
      setItems(prev => {
        const found = prev.some(item => item.event === event && item.channel === channel);
        if (found) return prev.map(item => (item.event === event && item.channel === channel ? { ...item, enabled } : item));
        return [...prev, { event, channel, enabled }];
      });
      message.success("已更新");
    } catch {
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
    } finally {
      setSaving(false);
    }
  };

  const saveBatchCategory = async (values: any) => {
    setSaving(true);
    try {
      await putNotifyPrefs({
        categories: [
          {
            category: values.category,
            channel: values.channel,
            enabled: Boolean(values.enabled)
          }
        ]
      });
      message.success("已按类别更新");
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

  return (
    <div>
      <Divider titlePlacement="left" plain>
        消息通知
      </Divider>
      <Table
        rowKey="event"
        size="small"
        pagination={false}
        loading={loading}
        dataSource={byEvent}
        locale={{ emptyText: loading ? "加载中…" : "暂无通知项" }}
        columns={[
          {
            title: "事件",
            dataIndex: "event",
            render: (event: string) => eventLabels[event] || event
          },
          ...channels.map(channel => ({
            title: channelLabels[channel] || channel,
            dataIndex: channel,
            width: 100,
            render: (enabled: boolean, row: any) => (
              <Switch size="small" disabled={saving} checked={Boolean(enabled)} onChange={checked => toggle(row.event, channel, checked)} />
            )
          }))
        ]}
      />

      <Divider titlePlacement="left" plain>
        按类别批量
      </Divider>
      <Form form={batchForm} layout="inline" className="mb-4" onFinish={saveBatchCategory} initialValues={{ enabled: true }}>
        <Form.Item name="category" rules={[{ required: true, message: "选择类别" }]}>
          <Select placeholder="类别" style={{ width: 140 }} options={categories.map(item => ({ value: item.code, label: item.name || item.code }))} />
        </Form.Item>
        <Form.Item name="channel" rules={[{ required: true, message: "选择渠道" }]}>
          <Select placeholder="渠道" style={{ width: 140 }} options={channels.map(code => ({ value: code, label: channelLabels[code] || code }))} />
        </Form.Item>
        <Form.Item name="enabled" label="启用" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} disabled={!categories.length}>
            应用到类别
          </Button>
        </Form.Item>
      </Form>
      <div className="mb-4 text-black/45">按类别会展开该类别下全部事件，一次写入对应渠道开关。短信渠道为占位，仅记日志。</div>

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
        <Space>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存偏好
          </Button>
        </Space>
      </Form>
    </div>
  );
};

export default NotificationPage;
