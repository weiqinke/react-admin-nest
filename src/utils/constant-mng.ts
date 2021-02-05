// 系统常量管理
import { tupleStr } from 'utils/core';

interface IItem {
  id: number;
  name: string;
  [key: string]: any;
}

interface IData {
  [key: string]: IItem[];
}

// 角色
const Role: IItem[] = [
  {
    id: 1,
    name: '管理员'
  },
  {
    id: 2,
    name: '游客'
  },
  {
    id: 3,
    name: '客服'
  }
];

// 性别
const Gender: IItem[] = [
  {
    id: 1,
    name: '男'
  },
  {
    id: 2,
    name: '女'
  }
];

// 支付状态
const PayStatus: IItem[] = [
  {
    id: 1,
    name: '已支付'
  },
  {
    id: 2,
    name: '未支付'
  },
  {
    id: 3,
    name: '已退款'
  }
];

// 所有常量的分组
const constantGroup: IData = {
  gender: Gender,
  role: Role,
  payStatus: PayStatus
};

// 所有常量分组名称
const groupNames = tupleStr('gender', 'role', 'payStatus');

export type GroupName = typeof groupNames[number];

/* 系统常量管理 */
export class ConstantMng {
  private data: IData = {};

  constructor(data: IData) {
    this.data = data;
  }

  /**
   * 手动初始化
   * **可用于从后端获取数据后，进行追加**
   */
  public initGroup(data: object) {
    const newData = { ...this.data, ...data };
    this.data = newData;
  }

  /**
   * 获取某组常量
   * @param {GroupName} groupName  组名
   */
  public getGroup(groupName: GroupName) {
    const groupList = this.data[groupName];
    if (groupList) {
      return groupList;
    } else {
      return [
        {
          id: 9000,
          name: groupName + '.ID-1'
        },
        {
          id: 9001,
          name: groupName + '.ID-2'
        }
      ];
      // throw new Error(`表“${groupName}”不存在`);
    }
  }

  /**
   * 获取经过过滤之后的常量组
   * @param {GroupName} groupName  组名
   * @param {Array} ids 需要过滤掉的选项的id
   */
  public getFilterGroup(groupName: GroupName, ids: number[]) {
    const groupList = this.getGroup(groupName);
    return groupList.filter(item => !ids.includes(item.id));
  }

  /**
   * 获取某组常量的所有id
   * @param {GroupName} groupName 组名
   */
  public getIds(groupName: GroupName) {
    const groupList = this.getGroup(groupName);
    return groupList.map(item => item.id);
  }

  /**
   * 获取某组常量的所有name
   * @param {GroupName} groupName 组名
   */
  public getNames(groupName: GroupName) {
    const groupList = this.getGroup(groupName);
    return groupList.map(item => item.name);
  }

  /**
   * 获取某组常量中某一项的名称
   * @param {GroupName} groupName 组名
   * @param {Number} id
   */
  public getNameById(groupName: GroupName, id?: number) {
    const groupList = this.getGroup(groupName);
    if (!id && id !== 0) {
      return '';
    }
    const result = groupList.find(item => item.id === id);
    return result ? result.name : '';
  }

  /**
   * 根据id列表获取某组常量中的部分名称
   * @param {GroupName} groupName 组名
   * @param {Array} ids
   */
  public getNamesByIds(groupName: GroupName, ids: number[]) {
    const groupList = this.getGroup(groupName);
    const names: string[] = [];
    groupList.forEach(item => {
      if (ids.includes(item.id)) {
        names.push(item.name);
      }
    });
    return names;
  }

  /**
   * 格式化为指定的数据结构
   * ** 比如有的地方使用value,label **
   */
  public formatGroup(groupName: GroupName, idFiled: string, nameFiled: string) {
    const groupList = this.getGroup(groupName);
    return groupList.map(item => ({
      [idFiled]: item.id,
      [nameFiled]: item.name
    }));
  }
}

// 为什么需要存一份到本地？
// 用户在使用的时候可能会刷新页面，这个时候会去重新请求的数据，而数据有可能会在页面渲染完成之后才返回，这个时候页面中使用到了这些常量，就会出现表不存在的情况。
const storageConstant = JSON.parse(sessionStorage.getItem('constantGroup') || JSON.stringify([]));

export default new ConstantMng({ ...constantGroup, ...storageConstant });
