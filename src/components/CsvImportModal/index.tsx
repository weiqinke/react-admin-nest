import { Button, Modal, Space, Table, Upload, message } from "antd";
import { FC, useEffect, useState } from "react";

type Preview = {
  headers?: string[];
  rows?: string[][];
  errors?: { line: number; message: string }[];
  valid?: number;
  invalid?: number;
};

type Props = {
  open: boolean;
  title: string;
  hint: string;
  onClose: () => void;
  onDownloadTemplate: () => Promise<void>;
  onPreview: (file: File) => Promise<any>;
  onCommit: (file: File) => Promise<any>;
  onDone: () => void;
};

const CsvImportModal: FC<Props> = ({ open, title, hint, onClose, onDownloadTemplate, onPreview, onCommit, onDone }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview(null);
    }
  }, [open]);

  const runPreview = async (next: File) => {
    setLoading(true);
    try {
      const res = await onPreview(next);
      setPreview(res.data?.data || null);
    } catch {
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const commit = async () => {
    if (!file) return;
    setCommitting(true);
    try {
      const res = await onCommit(file);
      const data = res.data?.data || {};
      message.success(`导入完成：新建 ${data.created || 0}，更新 ${data.updated || 0}，跳过 ${data.skipped || 0}`);
      onDone();
      onClose();
    } finally {
      setCommitting(false);
    }
  };

  const rows = preview?.rows || [];
  const columns =
    (preview?.headers || []).map((header, index) => ({
      title: header,
      ellipsis: true,
      render: (_: any, __: any, rowIndex: number) => rows[rowIndex]?.[index] || ""
    })) || [];

  const dataSource = rows.map((_, index) => ({ key: index }));

  return (
    <Modal
      open={open}
      title={title}
      width={860}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="commit" type="primary" disabled={!file || !preview || (preview.invalid || 0) > 0} loading={committing} onClick={commit}>
          确认导入
        </Button>
      ]}
      destroyOnHidden>
      <div className="mb-3 text-neutral-500">{hint}</div>
      <Space className="mb-3" wrap>
        <Button
          onClick={async () => {
            try {
              await onDownloadTemplate();
            } catch {
              message.error("模板下载失败");
            }
          }}>
          下载模板
        </Button>
        <Upload
          accept=".csv,text/csv"
          maxCount={1}
          beforeUpload={next => {
            setFile(next);
            runPreview(next);
            return false;
          }}
          onRemove={() => {
            setFile(null);
            setPreview(null);
          }}
          fileList={file ? [{ uid: "-1", name: file.name, status: "done" }] : []}>
          <Button type="primary" loading={loading}>
            选择 CSV
          </Button>
        </Upload>
      </Space>
      {preview ? (
        <>
          <div className="mb-2">
            有效 {preview.valid || 0} 行，无效 {preview.invalid || 0} 行
            {(preview.invalid || 0) > 0 ? "。请先修正错误再导入。" : "。"}
          </div>
          {(preview.errors || []).length ? (
            <div className="mb-3 max-h-28 overflow-auto text-red-500">
              {(preview.errors || []).map(item => (
                <div key={`${item.line}-${item.message}`}>
                  第 {item.line} 行：{item.message}
                </div>
              ))}
            </div>
          ) : null}
          <Table size="small" rowKey="key" pagination={false} scroll={{ x: true, y: 280 }} columns={columns as any} dataSource={dataSource} />
        </>
      ) : null}
    </Modal>
  );
};

export default CsvImportModal;
