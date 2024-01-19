import qs from "qs";

const SYSTEM_TOKEN = "token";

export const getUserState = () => {
  const token = window.localStorage.getItem(SYSTEM_TOKEN);
  if (!token) return {};
  return JSON.parse(
    decodeURIComponent(encodeURIComponent(window.atob(token.split(".")[1])))
  );
};

/**
 * 计算百分比
 * @example
 * totalPercentage(8589934592, 225492992)  // => 98
 */
export const totalPercentage = (totalmem: number, freemem: number) => {
  return Math.floor(((totalmem - freemem) / totalmem) * 100);
};

/**
 * 生成指定区间的随机整数
 * @param {Number} min 最小数
 * @param {Number} max 最大数
 * @return {Number}
 */
export const randomNum = (min: number, max: number): number =>
  Math.floor(min + Math.random() * (max - min + 1));

/**
 * 生成guid
 */
export const guid = (): string => {
  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
};

/**
 * 生成number类型的id
 */
let _guidCount = 1;
export const guidNumber = (): number => {
  const loadTime = new Date().getTime();
  return loadTime + _guidCount++;
};

/**
 * 获取url中的查询字符串参数
 */
export const getURLParams = (url: string): any => {
  const search = url.split("?")[1];
  if (!search) {
    return {};
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"') +
      '"}'
  );
};

/**
 * 序列化请求参数
 */

export function paramsSerializer(params = {}) {
  return qs.stringify(params, { arrayFormat: "repeat" });
}

/**
 * 判断数据类型
 */
export const getType = (value: any): any => {
  return value === undefined
    ? "undefined"
    : value === null
    ? "null"
    : value.constructor.name.toLowerCase();
};

/**
 * 深克隆
 */
export const deepClone = (source: any) => {
  if (typeof source !== "object" || source === null) {
    return source;
  }
  const target: any = Array.isArray(source) ? [] : {};
  for (const [key, value] of Object.entries(source)) {
    target[key] = deepClone(value);
  }
  return target;
};

/**
 * 加载第三方脚本
 */
export const loadScript = (
  src: string,
  callback: (err: any, res: any) => void
) => {
  const existScript = document.getElementById(src);
  if (existScript) {
    callback(null, existScript);
  } else {
    const script = document.createElement("script");
    script.src = src;
    script.id = src;
    document.body.appendChild(script);
    script.onload = () => {
      callback(null, script);
    };
    script.onerror = () => {
      callback(new Error(`“${src}”加载失败`), script);
    };
  }
};

/**
 * 将数值使用逗号隔开，一般用于金额的输入
 */
export const getCommaNumber = (value: any) => {
  const list = value.toString().split(".");
  const prefix = list[0].charAt(0) === "-" ? "-" : "";
  let num = prefix ? list[0].slice(1) : list[0];
  let result = "";
  while (num.length > 3) {
    result = `,${num.slice(-3)}${result}`;
    num = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  const listSecond = list[1] ? "." + list[1] : "";
  return `${prefix}${result}${listSecond}`;
};

// 方便生成联合类型
export const tupleStr = <T extends string[]>(...args: T) => args;

export const tupleNum = <T extends number[]>(...args: T) => args;

/**
 * 延迟执行async函数的一部分, 将其放入休眠状态, 返回Promise。
 * @param {Number} interval  阻塞的时间 ms
 * @example
```
async function test() {
  console.log('Hello')
  await sleep(1000)
  console.log('world!')
}
```
 */
export const sleep = (interval: number) =>
  new Promise((resolve) => setTimeout(resolve, interval));

/**
 * 十六进制颜色值转换为rgb
 * @example
```
hexToRgb('#27ae60') //'rgb(39, 174, 96,1)'
hexToRgb('#acd', 0.5) // 'rgb(170, 204, 221, 0.5)'
```
 */
export const hexToRgb = (hex: string, opacity: number = 1) => {
  const extendHex = (shortHex: string) =>
    "#" +
    shortHex
      .slice(shortHex.startsWith("#") ? 1 : 0)
      .split("")
      .map((x) => x + x)
      .join("");
  const extendedHex =
    hex.slice(hex.startsWith("#") ? 1 : 0).length === 3 ? extendHex(hex) : hex;
  return `rgb(${parseInt(extendedHex.slice(1), 16) >> 16}, ${
    (parseInt(extendedHex.slice(1), 16) & 0x00ff00) >> 8
  }, ${parseInt(extendedHex.slice(1), 16) & 0x0000ff}, ${opacity})`;
};

/**
 * 等待页面加载完成后执行
 * @param {*} fn
 */
export const documentReady = (
  fn: (ev?: Event) => any,
  waitLoaded: boolean = false
) => {
  if (document.readyState !== "loading") {
    fn();
  } else if (waitLoaded) {
    window.addEventListener("load", fn);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
};

/**
 * 百度坐标转高德（传入经度、纬度）
 * @example
 * bd_decrypt(8589934592, 225492992)  // => {lng lat}
 */
//
export const bd_decrypt = (bd_lng: string = "0", bd_lat: string = "0") => {
  const X_PI = (Math.PI * 3000.0) / 180.0;
  const x = parseFloat(bd_lng) - 0.0065;
  const y = parseFloat(bd_lat) - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * X_PI);
  const gg_lng = z * Math.cos(theta);
  const gg_lat = z * Math.sin(theta);
  return { lng: gg_lng, lat: gg_lat };
};
/**
 * 高德坐标转百度（传入经度、纬度）
 * @example
 * bd_decrypt(8589934592, 225492992)  // => {lng lat}
 */
//
export const bd_encrypt = (gg_lng: string = "0", gg_lat: string = "0") => {
  const X_PI = (Math.PI * 3000.0) / 180.0;
  const x: any = gg_lng,
    y: any = gg_lat;
  const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * X_PI);
  const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * X_PI);
  const bd_lng = z * Math.cos(theta) + 0.0065;
  const bd_lat = z * Math.sin(theta) + 0.006;
  return {
    bd_lat: bd_lat,
    bd_lng: bd_lng,
  };
};

export const isTagVisible = (v: string) => v === "0";
