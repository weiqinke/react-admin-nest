import React, { FC, useEffect, useState } from 'react';
import { Button, Table, Modal, message } from 'antd';
import { changeUserStatus } from 'api/nest-admin/User';
import ModalMessage from 'pages/commponents/modalmessage/ModalMessage';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { findallarticle, onearticlebody } from 'api/nest-admin/Articles';
import './ArticleList.less';
import { ArticleInfo } from '../ArticleInterface';
const { confirm } = Modal;
const ArticleList: FC = () => {
  const [articlesList, setArticlesList] = useState([]);
  //提示框的属性
  const [tipvisible] = useState(false);
  const [tipContent] = useState('是否删除');
  const tipcallback = () => {};
  useEffect(() => {
    findAllArticle();
  }, []);
  const findAllArticle = () => {
    setArticlesList([]);
    findallarticle({}).then(result => {
      if (result.data.code === 200) {
        setArticlesList(result.data.data || []);
      }
    });
  };

  const deleteAtricle = (item: any) => {
    confirm({
      title: '提示',
      icon: <ExclamationCircleOutlined />,
      content: (
        <p className="waringtext">
          是否删除<span className="red">{`${item.title}`}</span>？
        </p>
      ),
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const result = await changeUserStatus(item);
        if (result.data.code === 200) {
          message.info('操作成功');
          findAllArticle();
          return;
        }
        message.info('操作失败');
      },
      onCancel() {}
    });
  };
  const columns: any = [
    {
      title: '标题',
      dataIndex: 'title'
    },
    {
      title: '关键字',
      dataIndex: 'description'
    },
    {
      title: '详情',
      dataIndex: 'body',
      render: (item: any) => {
        return <span>{item.slice(0, 100)}</span>;
      }
    },
    {
      title: '标签',
      dataIndex: 'label',
      responsive: ['xxl', 'xl', 'lg', 'md']
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
                seeArticle(item);
              }}
              style={{ marginRight: '10px' }}
            >
              查看
            </Button>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                deleteAtricle(item);
              }}
            >
              删除
            </Button>
          </div>
        );
      }
    }
  ];

  const seeArticle = async (record: ArticleInfo) => {
    const result = await onearticlebody({
      id: record.id
    });
    if (result.data.code !== 200) {
      message.warning(result.data.message);
      return;
    }
    // navigate('/article/detail:123');
  };
  return (
    <div className="users-list-page">
      <Button type="primary" className="btns" onClick={findAllArticle}>
        查询文章
      </Button>
      <Table columns={columns} dataSource={articlesList} rowKey={(record: any) => record.id} />;
      <ModalMessage visible={tipvisible} pendingCallback={tipcallback} content={tipContent} />
    </div>
  );
};

export default ArticleList;
