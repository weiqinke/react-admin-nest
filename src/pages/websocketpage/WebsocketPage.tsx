import React, { FC, useEffect, useRef, useState } from 'react';
import { Form, Input, Button, Select, List, Avatar } from 'antd';
import './WebsocketPage.less';
import { webSocketManager } from 'utils/websocket';
const { Option } = Select;
const { TextArea } = Input;
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 }
};
const tailLayout = {
  wrapperCol: { offset: 4, span: 16 }
};

type DropChildProps = Partial<{ provided: any } & any> & React.HTMLAttributes<HTMLDivElement>;

export const DropChild = React.forwardRef<HTMLDivElement, DropChildProps>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));

interface MessageItem {
  note: string;
  sender: string;
}
const WebsocketPage: FC = () => {
  const [form] = Form.useForm();
  const [userlist, setUserList] = useState<any[]>([]);
  const [, setBodyText] = useState('');
  const [, setReceiveUserID] = useState('');
  const listref = useRef();
  const [messagelist, setMessageList] = useState<MessageItem[]>([]);
  const onGenderChange = (value: string) => {
    setReceiveUserID(value);
  };
  const onChangeBody = (e: any) => {
    setBodyText(e.target.value);
  };
  const onFinish = (values: any) => {
    webSocketManager.postMessage({
      name: 'qkstartCar',
      type: 'Handle_CAR_WEBSOCKET_SENDMESSAGE_TO_ID',
      message: '发送消息',
      data: values
    });
  };
  useEffect(() => {
    webSocketManager.postMessage({
      name: 'qkstartCar',
      type: 'WEBSOCKET_GET_CHAT',
      message: '获取聊天记录',
      data: {
        firstIndex: -20,
        lastIndex: -0
      }
    });

    webSocketManager.postMessage({
      name: 'qkstartCar',
      type: 'Handle_CAR_WEBSOCKET_GET_ONLINT_USERS',
      message: '获取在线人',
      data: {}
    });
    const removeHandler = webSocketManager.addEventHandler(payload => {
      const { name, data } = payload;
      console.log('name: ', name);
      if (name === 'WEBSOCKET_CHAT_SERVER_ONLINE') {
        const { users } = data;
        setUserList(users);
      }
      if (name === 'WEBSOCKET_CHAT_GET_HISTORY') {
        const { chartHistory } = data;
        setMessageList(olddata => {
          return [...olddata, ...chartHistory];
        });
      }
      if (name === 'WEBSOCKET_CHAT_SENDER_TO_RECEIVER') {
        const { note, sender } = data;
        if (sender) {
          setMessageList(olddata => {
            return [...olddata, { note, sender }];
          });
        }
      }
    });
    return removeHandler;
  }, []);

  useEffect(() => {
    return () => {};
  }, []);
  return (
    <div>
      <div className="liaotian" ref={listref.current}>
        <List
          itemLayout="horizontal"
          dataSource={messagelist}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                title={<a href="https://ant.design">{item.sender}</a>}
                description={item.note}
              />
            </List.Item>
          )}
        />
      </div>

      <Form {...layout} form={form} name="control-hooks" onFinish={onFinish}>
        <Form.Item name="receiver" label="接收人" rules={[{ required: true }]}>
          <Select placeholder="选择一个接收你消息的人" onChange={onGenderChange} allowClear>
            {userlist.map(item => {
              return (
                <Option value={item.id} key={item.id}>
                  {item.name}
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.gender !== currentValues.gender}>
          {({ getFieldValue }) =>
            getFieldValue('gender') === 'other' ? (
              <Form.Item name="customizeGender" label="Customize Gender" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            ) : null
          }
        </Form.Item>
        <Form.Item name="note" label="消息内容" rules={[{ required: true }]}>
          <TextArea showCount maxLength={100} onChange={onChangeBody} />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Button type="primary" htmlType="submit">
            发送
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default WebsocketPage;
