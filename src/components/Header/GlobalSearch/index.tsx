import { globalSearch } from "@/api/platform";
import { SearchOutlined } from "@ant-design/icons";
import { AutoComplete, Input, Typography } from "antd";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router";

type Hit = { type: string; id: string; title: string; extra?: string };

const typeLabel: Record<string, string> = {
  user: "用户",
  ticket: "工单"
};

const GlobalSearch = () => {
  const navigate = useNavigate();
  const [options, setOptions] = useState<{ value: string; label: ReactNode; hit: Hit }[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = (q: string) => {
    if (timer.current) clearTimeout(timer.current);
    const keyword = q.trim();
    if (!keyword) {
      setOptions([]);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await globalSearch(keyword);
        const list: Hit[] = res.data?.data?.list || [];
        setOptions(
          list.map(hit => ({
            value: `${hit.type}:${hit.id}`,
            hit,
            label: (
              <div>
                <Typography.Text type="secondary" style={{ marginRight: 8 }}>
                  {typeLabel[hit.type] || hit.type}
                </Typography.Text>
                <span>{hit.title}</span>
                {hit.extra ? (
                  <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
                    {hit.extra}
                  </Typography.Text>
                ) : null}
              </div>
            )
          }))
        );
      } catch {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 280);
  };

  const empty = useMemo(() => (loading ? "搜索中…" : "无结果"), [loading]);

  return (
    <AutoComplete
      style={{ width: 220 }}
      options={options}
      onSearch={search}
      notFoundContent={empty}
      onSelect={(_, option) => {
        const hit = (option as any).hit as Hit;
        if (!hit) return;
        if (hit.type === "user") navigate(`/management/useradmin?keyword=${encodeURIComponent(hit.title)}`);
        else if (hit.type === "ticket") navigate(`/management/ticketadmin?id=${encodeURIComponent(hit.id)}`);
        else navigate("/workplace");
      }}>
      <Input allowClear prefix={<SearchOutlined />} placeholder="搜索用户/工单" size="middle" />
    </AutoComplete>
  );
};

export default GlobalSearch;
