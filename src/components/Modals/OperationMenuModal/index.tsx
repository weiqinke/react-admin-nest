import { message, Modal, Tree } from "antd";
import React, { FC, useEffect, useState } from "react";
import { giveRoleMenus } from "@/api/caravan/Rbac";

const OperationMenuModal: FC<any> = (props: any) => {
  const { title, pendingCallback, changeMenu, allMenu, okText, cancelText, roleCode } = props;
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState<boolean>(true);
  const [, setexpandedKeysValue] = useState<any>(true);
  const onOkSubmit = async () => {
    //分配人员
    const payload = { roleCode, menus: checkedKeys };
    const result: any = await giveRoleMenus(payload);
    if (result.data.code === 200) {
      message.info("操作成功");
      pendingCallback(true);
      return;
    }
    message.error("操作失败");
  };
  const CancelSubmit = () => {
    pendingCallback(false);
  };
  useEffect(() => {
    setCheckedKeys(changeMenu);
  }, [changeMenu]);
  const onExpand = (expandedKeysValue: React.Key[]) => {
    setexpandedKeysValue(expandedKeysValue);
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
  };
  const [, setinfo] = useState(null);

  const onSelect = (selectedKeysValue: React.Key[]) => {
    setSelectedKeys(selectedKeysValue);
  };
  const onCheck = (checkedKeys: any, info: any) => {
    setinfo(info);
    const checkedKey = checkedKeys.concat(info.halfCheckedKeys);
    setCheckedKeys(checkedKey);
  };

  return (
    <Modal
      visible
      title={title || "提示"}
      onOk={onOkSubmit}
      onCancel={CancelSubmit}
      okText={okText || "确认"}
      cancelText={cancelText || "取消"}
      width={800}
    >
      <div>
        <Tree
          checkable
          multiple
          onExpand={onExpand}
          expandedKeys={expandedKeys}
          autoExpandParent={autoExpandParent}
          checkedKeys={checkedKeys}
          onSelect={onSelect}
          onCheck={onCheck}
          selectedKeys={selectedKeys}
          treeData={allMenu}
        />
      </div>
    </Modal>
  );
};

export default OperationMenuModal;
