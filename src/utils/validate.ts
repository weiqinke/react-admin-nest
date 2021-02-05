import { tupleStr } from 'utils/core';

const Types = tupleStr('mobile', 'email', 'IDCard');

type Type = typeof Types[number];

interface IValidator {
  message: string;
  value: any;
  limit: any;
  strategy: string;
}

interface IRule {
  // 错误提示信息
  message: string;
  // 策略类型
  type?: Type;
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
}

// interface IRules {
//   [key: string]: IRule[]
// }

// 策略对象，封装校验规则
const strategies: any = {
  // 手机号
  mobile(value: string) {
    return /(^1[345789]\d{9}$)/.test(value);
  },
  // 电子邮箱
  email(value: string) {
    return /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value);
  },
  // 身份证号
  IDCard(value: string) {
    return /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/.test(value);
  },
  // 最少长度
  min(value: string, limit: number) {
    return value.length >= limit;
  },
  // 最大长度
  max(value: string, limit: number) {
    return value.length <= limit;
  },
  // 是否必填
  required(value: any, limit: boolean) {
    if (!limit) {
      return true;
    }
    return value ? true : false;
  },
  // 自定义正则表达式校验
  pattern(value: string, limit: RegExp) {
    return limit.test(value);
  }
};

// 存储校验器对象
let validators: IValidator[] = [];

/**
 * 添加校验器
 * @param value{any}   要校验的值
 * @param rules{Array} 校验的规则。
 *
 */
function addValidator(value: any, rules: IRule[]) {
  rules.forEach((rule: any) => {
    const message = rule.message;
    delete rule.message;
    let strategy: string | undefined = Object.keys(rule)[0];

    if (strategy === 'type') {
      strategy = rule.type;
    }

    if (!strategy) {
      throw new Error('缺少校验类型');
    }

    if (!Object.keys(strategies).includes(strategy)) {
      throw new Error(`校验器无法校验${strategy}类型`);
    }

    validators.push({
      strategy,
      value,
      message,
      limit: rule[strategy]
    });
  });
}

/**
 * 校验器
 * @param {object} data   要校验的数据
 * @param {IRules} rules  校验的规则。
 * @example
 * ```tsx
  const rules = {
    username: [
      {
        required: true,
        message: '用户名不能为空'
      }
    ],
    password: [
      {
        required: true,
        message: '密码不能为空'
      },
      {
        min: 6,
        message: '密码长度不能少于6位'
      }
    ],
    email: [
      {
        required: true,
        message: '请填写电子邮箱'
      },
      {
        type: 'email',
        message: '邮箱格式不正确'
      }
    ],
    id: [
      {
        required: true,
        message: '请填写身份证号码'
      },
      {
        pattern: /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/,
        message: '身份证号码格式不正确'
      },
      {
        aaa: 3,
        message: '身份证号码格式不正确'
      }
    ]
  }
  const data = {
    username: 'admin',
    password: '123456',
    email: '121@qq.com',
    id: '123456197201012121'
  }
  function login() {
    const msg = validate(data, rules)
    if (msg) {
      alert(msg)
    } else {
      alert('成功')
    }
  }
 * ```
 */
function validate(data: any, rules: object) {
  for (const [key, value] of Object.entries(rules)) {
    addValidator(data[key], value);
  }
  let errorMsg = '';
  validators.some(validator => {
    const { strategy, value, message, limit } = validator;
    const result = strategies[strategy](value, limit);
    if (!result) {
      errorMsg = message;
      return true;
    } else {
      return false;
    }
  });
  validators = [];
  return errorMsg;
}

export default validate;
