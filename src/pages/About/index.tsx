import { listPublishedChangelogs } from "@/api/changelog";
import TypingCard from "@/components/TypingCard";
import { Descriptions, Empty, List, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import pkg from "../../../package.json";

const dependencyItems = (deps: Record<string, string> = {}) =>
  Object.entries(deps).map(([key, value]) => ({
    key,
    label: key,
    children: value
  }));

function formatTime(value?: string | null) {
  if (!value) return "";
  return dayjs(value).format("YYYY-MM-DD HH:mm");
}

const About = () => {
  const { version, lastBuildTime } = REACT_PACKAGE;
  const dependencies = (pkg.dependencies || {}) as Record<string, string>;
  const devDependencies = (pkg.devDependencies || {}) as Record<string, string>;
  const [changelogs, setChangelogs] = useState<any[]>([]);
  const [changelogLoading, setChangelogLoading] = useState(false);

  useEffect(() => {
    setChangelogLoading(true);
    listPublishedChangelogs({ page: 1, page_size: 10 })
      .then(res => setChangelogs(res.data?.data?.list || []))
      .catch(() => setChangelogs([]))
      .finally(() => setChangelogLoading(false));
  }, []);

  return (
    <div>
      <div className="bg-white p-3 m-3">
        <Descriptions title="关于项目" column={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }} />
        <TypingCard
          title=""
          source={`nest-admin-react 是一个基于 React、 Ant design、TypeScript、 Nest.js
          和 Mysql 构建的后台通用管理系统。持续更新。`}
        />
      </div>

      <div className="bg-white p-3 m-3">
        <Descriptions title="变更日志" column={1} />
        <List
          loading={changelogLoading}
          locale={{ emptyText: <Empty description="暂无已发布变更" /> }}
          dataSource={changelogs}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={
                  <span>
                    <Tag color="blue">{item.version}</Tag>
                    {item.title}
                  </span>
                }
                description={
                  <div>
                    <div className="mb-1 text-black/45">{formatTime(item.published_at)}</div>
                    <div className="whitespace-pre-wrap">{item.body}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>

      <div className="bg-white p-3 m-3">
        <Descriptions
          title="项目信息"
          bordered
          column={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
          items={[
            {
              label: "版本信息",
              children: version
            },
            {
              label: "最后编译时间",
              children: lastBuildTime
            },
            {
              label: "仓库地址",
              children: (
                <Link to={"https://github.com/weiqinke/react-admin-nest"} target="_blank">
                  仓库地址
                </Link>
              )
            },
            {
              label: "预览地址",
              children: (
                <Link to={"https://nest-admin.com/"} target="_blank">
                  预览地址
                </Link>
              )
            }
          ]}
        />
      </div>
      <div className="bg-white p-3 m-3">
        <Descriptions title="生产环境依赖" bordered column={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }} items={dependencyItems(dependencies)} />
      </div>
      <div className="bg-white p-3 m-3">
        <Descriptions title="开发环境依赖" bordered column={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }} items={dependencyItems(devDependencies)} />
      </div>
    </div>
  );
};

export default About;
