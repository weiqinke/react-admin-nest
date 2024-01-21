import { RefObject, useEffect, useState } from "react";

/**根据父节点的ref和子元素的列数等数据，计算出子元素的宽度。用于响应式布局
 * @param fatherRef 父节点的ref
 * @param marginX 子元素的水平间距
 * @param cols 一行个数 （一行有几列）
 * @param callback 根据浏览器宽度自动计算大小后的回调函数，参数是计算好的子元素宽度
 * @returns 返回子元素宽度的响应式数据
 */
const useCalculativeWidth = (fatherRef: RefObject<HTMLDivElement>, marginX: number, cols: number, callback?: (nowWidth: number) => void) => {
  const [itemWidth, setItemWidth] = useState(50);
  useEffect(() => {
    /**计算单个子元素宽度，根据list的宽度计算 */
    const countWidth = () => {
      const width = fatherRef.current?.offsetWidth;
      if (width) {
        const _width = (width - marginX * (cols + 1)) / cols;
        setItemWidth(_width);
        callback && callback(_width);
      }
    };
    countWidth(); //先执行一次，后续再监听绑定
    window.addEventListener("resize", countWidth);
    return () => window.removeEventListener("resize", countWidth);
  }, []);
  return itemWidth;
};

export default useCalculativeWidth;
