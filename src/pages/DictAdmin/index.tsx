import { hasPermission } from "@/api/announcement";
import { deleteDictItem, deleteDictType, listDictItems, listDictTypes, setDictItemStatus, setDictTypeStatus } from "@/api/dict";
import { commitDictImport, downloadDictImportTemplate, exportDictsCsv, previewDictImport } from "@/api/impexp";
import CsvImportModal from "@/components/CsvImportModal";
import { OperationDictItemModal, OperationDictTypeModal } from "@/components/Modals";
import PageIntroduction from "@/components/PageIntroduction";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Select, Space, Table, Tag, message } from "antd";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";

const infos = [{ title: "系统管理" }, { title: "字典管理" }];

const DictAdmin: FC = () => {
  const [types, setTypes] = useState<any[]>([]);
  const [typeTotal, setTypeTotal] = useState(0);
  const [typePage, setTypePage] = useState(1);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [selected, setSelected] = useState<any>(null);
  const [dictType, setDictType] = useState<any>();
  const [items, setItems] = useState<any[]>([]);
  const [itemTotal, setItemTotal] = useState(0);
  const [itemPage, setItemPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [itemStatus, setItemStatus] = useState<string | undefined>();
  const [dictItem, setDictItem] = useState<any>();
  const [importOpen, setImportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const canWrite = hasPermission("dict:write");
  const canRead = hasPermission("dict:read");

  const findTypes = (nextPage = typePage) => {
    listDictTypes({ page: nextPage, page_size: 20, code, name, status })
      .then(result => {
        if (result.data.code !== 0) return;
        const list = result.data.data?.list || [];
        setTypes(list);
        setTypeTotal(result.data.data?.total || 0);
        setTypePage(nextPage);
        if (selected) {
          const still = list.find((row: any) => row.id === selected.id);
          if (still) setSelected(still);
          else if (list.length) setSelected(list[0]);
          else setSelected(null);
        } else if (list.length) {
          setSelected(list[0]);
        }
      })
      .catch(() => setTypes([]));
  };

  const findItems = (typeId: string, nextPage = itemPage) => {
    listDictItems(typeId, { page: nextPage, page_size: 50, keyword, status: itemStatus })
      .then(result => {
        if (result.data.code !== 0) return;
        setItems(result.data.data?.list || []);
        setItemTotal(result.data.data?.total || 0);
        setItemPage(nextPage);
      })
      .catch(() => setItems([]));
  };

  useEffect(() => {
    findTypes(1);
  }, []);

  useEffect(() => {
    if (!selected?.id) {
      setItems([]);
      setItemTotal(0);
      return;
    }
    findItems(selected.id, 1);
  }, [selected?.id]);

  const confirmAction = (title: string, action: () => Promise<any>, after?: () => void) => {
    Modal.confirm({
      title: "提示",
      icon: <ExclamationCircleOutlined />,
      content: title,
      okText: "确定",
      cancelText: "取消",
      onOk: async () => {
        await action();
        message.success("操作成功");
        after ? after() : findTypes();
      }
    });
  };

  const typeColumns: any = [
    { title: "编码", dataIndex: "code", width: 140 },
    { title: "名称", dataIndex: "name" },
    {
      title: "条目数",
      dataIndex: "item_count",
      width: 80,
      responsive: ["md"]
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (value: string) => (value === "disabled" ? <Tag color="#f50">停用</Tag> : <Tag color="#2db7f5">启用</Tag>)
    },
    {
      title: "操作",
      width: 200,
      render: (item: any) => (
        <Space size={4} wrap onClick={e => e.stopPropagation()}>
          <Button size="small" type="primary" onClick={() => setDictType(item)}>
            编辑
          </Button>
          <Button
            size="small"
            onClick={() =>
              confirmAction(item.status === "enabled" ? "确认停用该类型？" : "确认启用该类型？", () =>
                setDictTypeStatus(item.id, item.status === "enabled" ? "disabled" : "enabled")
              )
            }>
            {item.status === "enabled" ? "停用" : "启用"}
          </Button>
          <Button size="small" danger onClick={() => confirmAction("确认删除该字典类型？其下条目将一并软删。", () => deleteDictType(item.id))}>
            删除
          </Button>
        </Space>
      )
    }
  ];

  const itemColumns: any = [
    {
      title: "值",
      dataIndex: "value",
      render: (text: string, row: any) => (
        <Space size={8}>
          {row.color ? (
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 2,
                background: row.color
              }}
            />
          ) : null}
          {text}
        </Space>
      )
    },
    { title: "显示名", dataIndex: "label" },
    {
      title: "排序",
      dataIndex: "sort",
      width: 70,
      responsive: ["md"]
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (value: string) => (value === "disabled" ? <Tag color="#f50">停用</Tag> : <Tag color="#2db7f5">启用</Tag>)
    },
    {
      title: "操作",
      width: 200,
      render: (item: any) => (
        <Space size={4} wrap>
          <Button size="small" type="primary" onClick={() => setDictItem(item)}>
            编辑
          </Button>
          <Button
            size="small"
            onClick={() =>
              confirmAction(
                item.status === "enabled" ? "确认停用该条目？" : "确认启用该条目？",
                () => setDictItemStatus(item.id, item.status === "enabled" ? "disabled" : "enabled"),
                () => findItems(selected.id)
              )
            }>
            {item.status === "enabled" ? "停用" : "启用"}
          </Button>
          <Button
            size="small"
            danger
            onClick={() =>
              confirmAction(
                "确认删除该字典项？",
                () => deleteDictItem(item.id),
                () => findItems(selected.id)
              )
            }>
            删除
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="admin-page">
      <PageIntroduction infos={infos} introduction="字典类型与条目可 CSV 导出导入。模板列：type_code,type_name,item_value,item_label,sort,status。" />
      <div className="admin-card">
        <div className="admin-toolbar">
          {canWrite ? (
            <Button type="primary" onClick={() => setDictType({})}>
              添加类型
            </Button>
          ) : null}
          <Input allowClear placeholder="按编码搜索" value={code} onChange={e => setCode(e.target.value)} style={{ width: 160 }} />
          <Input allowClear placeholder="按名称搜索" value={name} onChange={e => setName(e.target.value)} style={{ width: 160 }} />
          <Select
            allowClear
            placeholder="状态"
            value={status}
            onChange={value => setStatus(value)}
            style={{ width: 120 }}
            options={[
              { value: "enabled", label: "启用" },
              { value: "disabled", label: "停用" }
            ]}
          />
          <Button type="primary" onClick={() => findTypes(1)}>
            查询
          </Button>
          {canRead ? (
            <Button
              loading={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  await exportDictsCsv(`dicts-${dayjs().format("YYYYMMDD")}.csv`);
                } catch {
                  message.error("导出失败");
                } finally {
                  setExporting(false);
                }
              }}>
              导出 CSV
            </Button>
          ) : null}
          {canWrite ? <Button onClick={() => setImportOpen(true)}>导入 CSV</Button> : null}
        </div>
        <Table
          columns={typeColumns}
          dataSource={types}
          rowKey="id"
          size="middle"
          scroll={{ x: 900 }}
          rowClassName={row => (row.id === selected?.id ? "ant-table-row-selected" : "")}
          onRow={row => ({
            onClick: () => setSelected(row),
            style: { cursor: "pointer" }
          })}
          pagination={{
            current: typePage,
            total: typeTotal,
            pageSize: 20,
            onChange: next => findTypes(next)
          }}
        />
      </div>
      <CsvImportModal
        open={importOpen}
        title="导入字典"
        hint="模板列：type_code,type_name,item_value,item_label,sort,status。先预览再确认导入。"
        onClose={() => setImportOpen(false)}
        onDownloadTemplate={downloadDictImportTemplate}
        onPreview={previewDictImport}
        onCommit={commitDictImport}
        onDone={() => findTypes(1)}
      />

      {selected && (
        <div className="admin-card">
          <div className="admin-toolbar">
            <span>
              字典项：<Tag>{selected.code}</Tag>
              {selected.name}
            </span>
            <Button type="primary" onClick={() => setDictItem({})}>
              添加条目
            </Button>
            <Input allowClear placeholder="搜索 value / label" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 180 }} />
            <Select
              allowClear
              placeholder="状态"
              value={itemStatus}
              onChange={value => setItemStatus(value)}
              style={{ width: 120 }}
              options={[
                { value: "enabled", label: "启用" },
                { value: "disabled", label: "停用" }
              ]}
            />
            <Button type="primary" onClick={() => findItems(selected.id, 1)}>
              查询条目
            </Button>
          </div>
          <Table
            columns={itemColumns}
            dataSource={items}
            rowKey="id"
            size="middle"
            scroll={{ x: 800 }}
            pagination={{
              current: itemPage,
              total: itemTotal,
              pageSize: 50,
              onChange: next => findItems(selected.id, next)
            }}
          />
        </div>
      )}

      {dictType && (
        <OperationDictTypeModal
          dictType={dictType}
          onCancel={() => setDictType(null)}
          onOk={() => {
            setDictType(null);
            findTypes();
          }}
        />
      )}
      {dictItem && selected && (
        <OperationDictItemModal
          typeId={selected.id}
          item={dictItem}
          onCancel={() => setDictItem(null)}
          onOk={() => {
            setDictItem(null);
            findItems(selected.id);
            findTypes();
          }}
        />
      )}
    </div>
  );
};

export default DictAdmin;
