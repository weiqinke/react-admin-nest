import { SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { lazy, Suspense, useState } from "react";

const AutoSearch = lazy(() => import("./AutoSearch"));

const shell = <Input style={{ width: 220 }} allowClear prefix={<SearchOutlined />} placeholder="搜索用户/工单" size="middle" />;

const GlobalSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [ready, setReady] = useState(false);

  if (!ready) {
    return (
      <Input
        style={{ width: 220 }}
        allowClear
        prefix={<SearchOutlined />}
        placeholder="搜索用户/工单"
        size="middle"
        value={keyword}
        onFocus={() => setReady(true)}
        onChange={event => {
          setKeyword(event.target.value);
          setReady(true);
        }}
      />
    );
  }

  return <Suspense fallback={shell}>{<AutoSearch initial={keyword} />}</Suspense>;
};

export default GlobalSearch;
