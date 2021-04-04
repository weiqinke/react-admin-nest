import React from 'react';
import { Form, Button } from 'antd';

const CustomField: React.FC = () => {
  const handleFinish = () => {};

  return (
    <div>
      <p>展示自定义的表单控件的使用</p>
      <Form onFinish={handleFinish}>
        <Form.Item>
          <Button htmlType="submit">提交</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CustomField;
