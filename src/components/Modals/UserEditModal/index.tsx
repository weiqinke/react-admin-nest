import { hasPermission } from "@/api/announcement";
import { listDepts, setUserDepartment, toDeptTree } from "@/api/platform";
import { createUser, updateUser } from "@/api/user";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Col, Form, Input, Modal, Radio, Row, TreeSelect, Upload, message } from "antd";
import axios from "axios";
import type { FC } from "react";
import { useEffect, useState } from "react";

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};

const UserEditModal: FC<any> = (props: any) => {
  const { onCancel, onOk, initUser = {} } = props;
  const initialValues = { ...initUser, ...initUser.profile };
  const title = initUser?.uid ? "编辑" : "添加";
  const [form] = Form.useForm();
  const [type, setType] = useState("text");
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatar || "");
  const [fileList, setfileList] = useState<any[]>([]);
  const [uploading, setuploading] = useState(false);
  const [deptTree, setDeptTree] = useState<any[]>([]);
  const [departmentId, setDepartmentId] = useState(initUser?.profile?.department_id || "");
  const canAssignDept = hasPermission("user:write") && hasPermission("dept:read");
  const getBase64 = async (img: any, callback: any) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };
  const handleUpload = async () => {
    if (fileList.length <= 0) return;
    const formData = new FormData();
    fileList.forEach(file => {
      formData.append("files", file);
    });
    if (uploading) return;
    setuploading(true);
    const avatar = await axios
      .post(
        "https://freeimg.cn/api/v1/upload",
        {
          file: fileList[0]
        },
        {
          headers: {
            Authorization: "Bearer 391|UOekGM7OekO9sFl6g6WNl7PlFn20b4Al1UCIji6W",
            "Content-Type": "multipart/form-data"
          }
        }
      )
      .then(result => {
        setAvatarUrl("");
        message.info(`头像上传${result?.data?.status ? "成功" : "失败"}`);
        return result?.data?.data?.links?.url;
      })
      .catch(() => {
        setAvatarUrl("");
        message.info("头像修改失败");
        return "";
      });
    return avatar;
  };

  const UpLoadProps = {
    beforeUpload: (file: any) => {
      if (file.size >= 1024 * 1024) {
        message.error(`${file.name} 文件太大了`);
        return false;
      }
      if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") {
        message.error(`${file.name} 不是图片`);
        return false;
      }
      setuploading(false);
      setfileList([file]);
      getBase64(file, (imageUrl: any) => setAvatarUrl(imageUrl));
      return false;
    },
    fileList
  };

  const handleSubmit = () => {};
  const creatRoleSubmit = async () => {
    const data = await form.validateFields();
    let result: any = null;
    const avatar = await handleUpload();
    const { username, nick, title, mobile, email, sex, password, address } = data;
    const payload: any = {
      uid: initUser.uid,
      username,
      mobile,
      email,
      profile: {
        nick,
        title,
        sex,
        address,
        avatar
      }
    };
    if (password) payload.password = String(password).trim();
    if (!initUser?.uid && departmentId) payload.department_id = departmentId;
    if (initUser?.uid) {
      result = await updateUser(payload);
      const previous = initUser?.profile?.department_id || "";
      if (result.data.code === 0 && canAssignDept && String(departmentId || "") !== String(previous)) {
        result = await setUserDepartment(String(initUser.uid), departmentId || "");
      }
    } else {
      result = await createUser(payload);
    }

    if (result.data.code !== 0) {
      message.info("操作失败");
      return;
    }
    message.info("操作成功");
    setuploading(false);
    onOk();
  };

  const setInputType = () => {
    setType("password");
  };

  useEffect(() => {
    if (!canAssignDept) return;
    listDepts()
      .then(res => setDeptTree(res.data?.data?.list || []))
      .catch(() => setDeptTree([]));
  }, [canAssignDept]);

  useEffect(() => {
    if (initUser) {
      setAvatarUrl(initUser?.profile?.avatar || "");
      setDepartmentId(initUser?.profile?.department_id || "");
    }
    if (!initUser?.id) {
      form.setFieldsValue({ sex: "1" });
    }
    return () => {
      setType("text");
    };
  }, [initUser, form]);

  return (
    <Modal open title={`${title}用户`} width={800} onCancel={onCancel} onOk={creatRoleSubmit} okText="确定" cancelText="取消" maskClosable={false}>
      <Row>
        <Col span={24}>
          <div className="mx-auto rounded-full py-2.5 text-center">
            <Upload {...UpLoadProps}>
              <Avatar icon={<UserOutlined />} size={100} src={avatarUrl || undefined} />
            </Upload>
          </div>
        </Col>
      </Row>
      <Form form={form} initialValues={initialValues} onFinish={handleSubmit} {...layout}>
        <Row>
          <Col span={20}>
            <Form.Item label="用户编号" name="id" rules={[{ required: false }]} hidden>
              <Input readOnly autoComplete="off" placeholder="自动生成" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="账号" name="username" rules={[{ required: true }]}>
              <Input autoComplete="off" placeholder="请输入账号" readOnly={initUser?.uid} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="密码" name="password" rules={[{ required: !initUser?.uid }]}>
              <Input placeholder="请输入密码" type={type} onChange={setInputType} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="昵称" name="nick" rules={[{ required: true }]}>
              <Input autoComplete="off" placeholder="请输入昵称" />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="性别" name="sex" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio value="1">男</Radio>
                <Radio value="2">女</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="联系电话" name="mobile" rules={[{ required: true }]}>
              <Input maxLength={11} />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="电子邮箱" name="email" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="联系地址" name="address" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="职称" name="title" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={20}>
            <Form.Item label="部门" extra="部门名称只读。调整归属走单独接口，不会随资料一起保存。">
              <Input value={initUser?.profile?.department || "未归属"} disabled />
            </Form.Item>
          </Col>
          {canAssignDept ? (
            <Col span={20}>
              <Form.Item label="调整部门">
                <TreeSelect
                  allowClear
                  showSearch
                  treeDefaultExpandAll
                  treeNodeFilterProp="title"
                  placeholder="选择部门，清空则取消归属"
                  value={departmentId || undefined}
                  treeData={toDeptTree(deptTree, { disableOff: true, keepId: departmentId })}
                  onChange={value => setDepartmentId(value || "")}
                />
              </Form.Item>
            </Col>
          ) : null}
        </Row>
      </Form>
    </Modal>
  );
};

export default UserEditModal;
