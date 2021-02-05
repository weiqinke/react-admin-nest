// 缓动公式
const easeInOutQuad = (t: number, b: number, c: number, d: number): number => {
  let time = t;
  time /= d / 2;
  if (time < 1) {
    return (c / 2) * time * time + b;
  }
  time--;
  return (-c / 2) * (time * (time - 2) - 1) + b;
};

// 设置要滚动到的位置
const setTargetPosition = (element: Element | Window, target: number): void => {
  if (element === window) {
    document.body.scrollTop = target;
    document.documentElement.scrollTop = target;
  } else {
    (element as Element).scrollTop = target;
  }
};

// 获取当前已经滚动到的位置。
const getCurrentPosition = (element: Element | Window): number => {
  if (element === window) {
    return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
  }
  return (element as Element).scrollTop;
};

/**
 * 滚动
 * @param {Element | Window} element 要滚动的元素
 * @param {Number} end 要滚动到的最终位置
 * @param {Number} duration    滚动持续时间
 * @param { Function} callback  滚动完成后的回调函数
 */
const scrollTo = (element: Element | Window, end: number, duration: number = end / 10, callback?: () => void): void => {
  const start = getCurrentPosition(element);
  const distance = end - start;
  const increment = 20;
  let currentTime = 0;
  const animateScroll = () => {
    currentTime += increment;
    const target = easeInOutQuad(currentTime, start, distance, duration);
    setTargetPosition(element, target);
    if (currentTime < duration) {
      window.requestAnimationFrame(animateScroll);
    } else {
      if (callback && typeof callback === 'function') {
        callback();
      }
    }
  };
  animateScroll();
};

export default scrollTo;
