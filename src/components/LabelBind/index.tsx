import { hasPermission } from "@/api/announcement";
import { listLabelBindings, listLabelOptions, setLabelBindings } from "@/api/label";
import { Button, Select, Space, Tag, message } from "antd";
import { FC, useEffect, useState } from "react";

type Props = {
  targetType: "ticket" | "user" | "announcement";
  targetId: string;
};

const LabelBind: FC<Props> = ({ targetType, targetId }) => {
  const canRead = hasPermission("label:read");
  const canWrite = hasPermission("label:write");
  const [options, setOptions] = useState<any[]>([]);
  const [value, setValue] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canRead || !targetId) return;
    listLabelOptions()
      .then(res => setOptions(Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.list || []))
      .catch(() => setOptions([]));
    listLabelBindings(targetType, targetId)
      .then(res => setValue((res.data?.data?.list || []).map((item: any) => String(item.id))))
      .catch(() => setValue([]));
  }, [canRead, targetType, targetId]);

  if (!canRead) return <span className="text-neutral-500">没有标签查看权限</span>;

  const save = async () => {
    setSaving(true);
    try {
      await setLabelBindings({ target_type: targetType, target_id: targetId, label_ids: value });
      message.success("标签已更新");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Space direction="vertical" className="w-full">
      <Select
        mode="multiple"
        allowClear
        showSearch={{ optionFilterProp: "label" }}
        disabled={!canWrite}
        placeholder="选择启用中的标签，保存后整单替换"
        value={value}
        options={options.map(item => ({
          value: String(item.id),
          label: item.name
        }))}
        optionRender={option => {
          const row = options.find(item => String(item.id) === String(option.value));
          return (
            <Space size={8}>
              <Tag color={row?.color || undefined}>{option.label}</Tag>
            </Space>
          );
        }}
        onChange={next => setValue(next)}
      />
      {canWrite ? (
        <Button size="small" type="primary" loading={saving} onClick={save}>
          保存标签
        </Button>
      ) : null}
    </Space>
  );
};

export default LabelBind;
