import { Button, Col, Form, Input, message, Row, Select } from 'antd';
import { onearticle } from 'api/nest-admin/Articles';
import React, { useState, useEffect, FC, useRef } from 'react';
import { useAppState } from 'stores';
import E from 'wangeditor';
import './wangeditor.less';
const { Option } = Select;
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 }
};
const tailLayout = {
  wrapperCol: { offset: 8, span: 5 }
};
const WangeditorPage: FC = () => {
  const [bodyCode, setBodyCode] = useState('');
  const [initFormValues] = useState({});
  var SysEditor: any = useRef();
  const [form] = Form.useForm();
  const { nick } = useAppState(state => state.user);
  useEffect(() => {
    SysEditor.current = new E('#ArticleDomOne');
    SysEditor.current.config.showFullScreen = false;
    SysEditor.current.config.zIndex = 1;
    SysEditor.current.config.onchange = (newHtml: any) => {
      setBodyCode(newHtml);
    };
    /**一定要创建 */
    SysEditor.current.create();
    myusecode();
    return () => {
      if (SysEditor.current) {
        SysEditor.current.destroy();
      }
    };
  }, []);
  const myusecode = () => {
    if (SysEditor.current.txt.html()) {
      if (SysEditor.current.txt.text()) {
        return;
      }
    }
  };
  const handleSubmit = () => {};
  const onGenderChange = (value: string) => {
    form.setFieldsValue({ type: value });
  };
  const fabuwenzhang = async () => {
    const values = await form.getFieldsValue();
    const { title, label, description } = values;
    const body = SysEditor.current.txt.text();
    const author = nick;
    const payload = { title, label, description, body, bodycode: bodyCode, author };
    const result = await onearticle(payload);
    if (result.data.code === 200) {
      message.info('发布成功');
    }
  };

  /**
   * 获取我的分类
   */
  useEffect(() => {
    return () => {};
  }, []);

  useEffect(() => {
    return () => {};
  }, []);
  return (
    <div>
      <Form form={form} onFinish={handleSubmit} initialValues={initFormValues} {...layout} autoComplete="off">
        <Row>
          <Col span={20}>
            <Form.Item name="title" label="文章标题" rules={[{ required: true }]}>
              <Input placeholder="请输入文章标题" autoComplete="off" />
            </Form.Item>
          </Col>

          <Col span={20} style={{ zIndex: 3000 }}>
            <Form.Item name="label" label="文章分类" rules={[{ required: true }]} initialValue="default">
              <Select placeholder="请选择文章分类" onChange={onGenderChange}>
                <Option value="default">目前只有一种分类</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item name="description" label="关键字" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20} style={{ zIndex: 1 }}>
            <Form.Item name="body" label="文章内容" rules={[{ required: false }]}>
              <div id="ArticleDomOne"></div>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item {...tailLayout}>
              <Button type="primary" className="baocun" onClick={fabuwenzhang}>
                保存
              </Button>
              <Button type="primary" onClick={fabuwenzhang}>
                发布
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default WangeditorPage;
