import useCalculativeWidth from "@/hooks/useCalculativeWidth";
import { ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { throttle } from "@/utils/throttle";

/**瀑布流的元素，必须含有这个scale数据 （可以自己改个名）*/
export interface waterfallItem {
  /**高:宽的大致比例，用于每一轮获取数据时的估计高度 */
  scale: number;
}
/**瀑布流组件的props */
export interface waterfallProps<T> {
  /**本组件的外层的ref。用于监听元素的滚动（谁滚动就填谁） */
  scrollRef: RefObject<HTMLDivElement>;
  /**一行个数（要多少列）默认5*/
  cols?: number;
  /**每列之间的间距，默认30 */
  marginX?: number;
  /**下拉触底、组件初次渲染时，触发的函数。用来获取新一轮的数据，需要return出新列表 */
  getList: () => Promise<T[]>;
  /**元素的渲染函数 */
  itemRender: (item: T, i: number) => ReactNode;
  imgMinWidth: number;
}

function placeIntoColumns<T>(prev: T[][], incoming: T[], cols: number) {
  const _colList = structuredClone(prev);
  const colHeightObject: Record<string, number | string> = { minValue: 1, minIndex: "0" };
  for (let index = 0; index < cols; index++) {
    colHeightObject[index] = 0;
  }
  for (let i = 0; i < incoming.length; i++) {
    for (let m = cols; m >= 0; m--) {
      const minValue = colHeightObject.minValue as number;
      const value = colHeightObject[m] as number;
      if (value <= minValue) {
        colHeightObject.minIndex = String(m);
        colHeightObject.minValue = value;
      }
    }
    const min = colHeightObject.minIndex as string;
    _colList[Number(min)].push(incoming[i]);
    colHeightObject[min] = (colHeightObject[min] as number) + 330;
    colHeightObject.minValue = colHeightObject[min] as number;
  }
  return _colList;
}

/**展示瀑布流的组件  */
const Waterfall = <T extends waterfallItem>(props: waterfallProps<T>) => {
  const { scrollRef, cols = 5, marginX = 30, getList, itemRender } = props;
  /**瀑布流最外层的ref */
  const listRef = useRef<HTMLDivElement>(null);
  /**每一列的ref。是个数组 */
  const colRef = useRef<(HTMLDivElement | null)[]>([]);
  /**瀑布流每个模块的宽度。随着窗口大小变化而变化 */
  const imgWidth = useCalculativeWidth(listRef, marginX, cols);
  console.log("imgWidth: ", imgWidth);

  const [colList, setColList] = useState(Array.from({ length: cols }, () => new Array<T>())); //要展示的图片列表，二维数组
  const [colHeight, setColHeight] = useState(new Array<number>(cols).fill(0)); //当前每一列的高度
  console.log("colHeight: ", colHeight);

  /**获取列表数据，拿到后直接分列，不再经一份 list state 中转 */
  const _getList = async () => {
    const res = await getList();
    if (!res?.length) return;
    setColList(prev => placeIntoColumns(prev, res, cols));
  };

  //初始化列表
  useEffect(() => {
    _getList();
  }, []);

  //监听滚动事件，绑定触底加载函数
  useEffect(() => {
    //这里的this是 scrollRef.current 。 scrollRef是props中传递过来的
    const handler = function (this: HTMLElement) {
      //scrollHeight是可滚动区域的总高度， innerHeight是可视窗口的高度， scrollTop是盒子可视窗口的最顶部，到盒子可滚动上限的距离
      // 还有一个可以性能优化的点， this.scrollHeight 在没有获取新数据时，是固定的，可以存起来成一个变量，获取新数据再更新，减少重排重绘
      if (this.scrollHeight - window.innerHeight - this.scrollTop < 10) {
        console.log("触底了");
        _getList();
      }
    };
    /**利用节流函数，避免频繁的获取元素导致重排重绘，且可以防止触底瞬间多次调用请求函数 */
    const throttleHandler = throttle(handler, 500);
    scrollRef.current?.addEventListener("scroll", throttleHandler);
    return () => scrollRef.current?.removeEventListener("scroll", throttleHandler);
  }, []);

  useLayoutEffect(() => {
    if (colRef.current) {
      const newHeight = colRef.current.map(k => k?.offsetHeight || 0);
      setColHeight(newHeight);
    }
  }, [colList]);

  return (
    <div style={{ display: "flex", alignItems: "start", justifyContent: "space-evenly", textAlign: "center" }} ref={listRef} key={cols}>
      {colList.map((list, listI) => {
        return (
          <div key={listI} ref={r => (colRef.current[listI] = r)} style={{ width: 280 }}>
            {list.map((k, i) => {
              return itemRender(k, i);
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Waterfall;
