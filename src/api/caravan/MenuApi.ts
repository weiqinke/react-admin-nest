import { getPermissions } from "@/api/goadmin";
import { removedApi } from "@/api/removed";

export const getUserMenus = () => getPermissions();

export const addMenuItem = () => removedApi("菜单");

export const editMenuItem = () => removedApi("菜单");

export const delMenuItem = () => removedApi("菜单");

export const getAllMenus = () => getPermissions();
