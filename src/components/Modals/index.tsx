/**
 * 弹窗改为同步导出。
 * 若继续用 React.lazy，首次打开会 suspend 到布局层 Suspense，
 * 表现为整页闪一下「加载中」像路由刷新，第二次才正常出弹窗。
 */
export { default as MenuEditModal } from "./MenuEditModal";
export { default as MessageModal } from "./MessageModal";
export { default as UserEditModal } from "./UserEditModal";
export { default as OperationRoleModal } from "./OperationRoleModal";
export { default as PlacardEditModal } from "./PlacardEditModal";
export { default as OperationMenuModal } from "./OperationMenuModal";
export { default as OperationLabelModal } from "./OperationLabelModal";
export { default as OperationDictTypeModal } from "./OperationDictTypeModal";
export { default as OperationDictItemModal } from "./OperationDictItemModal";
export { default as RoleAllocationUserModal } from "./RoleAllocationUserModal";
export { default as RoleAllocationPermModal } from "./RoleAllocationPermModal";
/** @deprecated 角色不再挂菜单，请用 RoleAllocationPermModal */
export { default as RoleAllocationMenuModal } from "./RoleAllocationPermModal";
export { default as PermissionEditModal } from "./PermissionEditModal";
export { default as MetaDescModal } from "./MetaDescModal";
