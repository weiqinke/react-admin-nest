import React, { FC, useEffect, useState } from 'react';
import { Button, Table, Tag } from 'antd';
import './Labels.less';
import LabelsEditModal from './LabelsEditModal';
import { getalllabelsbyuser } from 'api/nest-admin/Labels';
const Labels: FC = () => {
  const [userslist, setUserslist] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [id, setID] = useState(null);
  const [visible, setVisible] = useState(false);
  const [initLable, setInitLabel] = useState({});

  useEffect(() => {
    findAll();
  }, []);
  const findAll = () => {
    getalllabelsbyuser({}).then(result => {
      if (result.data.code === 200) {
        setUserslist(result.data.data || []);
      }
    });
  };
  const labelsEdit = (item: any) => {
    setInitLabel(item);
    setIsEdit(true);
    setVisible(true);
  };

  const columns: any = [
    {
      title: '标签名称',
      dataIndex: 'title'
    },
    {
      title: '备注',
      dataIndex: 'description',
      responsive: ['lg']
    },
    {
      title: '排序',
      dataIndex: 'sort',
      responsive: ['lg']
    },
    {
      title: '是否可见',
      dataIndex: 'visible',
      render: (item: any) => {
        if (item === '0') {
          return (
            <Tag color="#f50">
              <span>隐藏</span>
            </Tag>
          );
        }
        return (
          <Tag color="#2db7f5">
            <span>显示</span>
          </Tag>
        );
      }
    },
    {
      title: '操作',
      render: (item: any) => {
        return (
          <div>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                labelsEdit(item);
              }}
              style={{ marginRight: '10px' }}
            >
              编辑
            </Button>
          </div>
        );
      }
    }
  ];

  const addOneRole = () => {
    setVisible(true);
    setIsEdit(false);
    setID(null);
  };

  const usercallback = (flag: boolean) => {
    if (flag) {
      findAll();
    }
    setVisible(false);
  };

  return (
    <div className="users-list-page">
      <Button type="primary" onClick={addOneRole}>
        添加标签
      </Button>
      <Button type="primary" onClick={findAll}>
        查询标签
      </Button>
      <LabelsEditModal
        visible={visible}
        isEdit={isEdit}
        id={id}
        initLabelItem={initLable}
        pendingCallback={usercallback}
      />
      <Table columns={columns} dataSource={userslist} rowKey={(record: any) => record.id}></Table>
    </div>
  );
};

export default Labels;
