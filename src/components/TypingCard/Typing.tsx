class Typing {
  public opts;
  public source;
  public output;
  public delay: number;
  public chain;
  public element;
  public doneState: boolean;
  public timer;

  constructor(opts) {
    this.opts = opts || {};
    const element = document.createElement("div");
    element.innerHTML = opts.data;
    this.element = element;
    this.output = opts.output;
    this.delay = opts.delay || 120;
    this.chain = {
      parent: null,
      dom: this.output,
      val: []
    };
    this.doneState = false;
  }

  convert(dom, arr) {
    //将dom节点的子节点转换成数组，
    const children: HTMLElement[] = Array.from(dom.childNodes);
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.nodeType === 3) {
        arr = arr.concat(node.nodeValue.split("")); //将字符串转换成字符串数组，后面打印时才会一个一个的打印
      } else if (node.nodeType === 1) {
        let val = [];
        val = this.convert(node, val);
        arr.push({
          dom: node,
          val: val
        });
      }
    }
    return arr;
  }
  print(dom, val, callback) {
    clearTimeout(this.timer);
    this.timer = null;
    this.timer = setTimeout(function () {
      if (dom.current) {
        dom.current.appendChild(document.createTextNode(val));
      } else {
        if (!dom.appendChild) {
          return;
        }
        dom.appendChild(document.createTextNode(val));
      }
      callback();
    }, this.delay);
  }
  play(ele) {
    if (this.doneState) return;
    //当打印最后一个字符时，动画完毕，执行done
    if (!ele.val.length) {
      if (ele.parent) this.play(ele.parent);
      else this.done();
      return;
    }
    const current = ele.val.shift(); //获取第一个元素，同时删除数组中的第一个元素
    if (typeof current === "string") {
      this.print(ele.dom, current, () => {
        this.play(ele); //继续打印下一个字符
      });
    } else {
      const dom = current.dom.cloneNode(); //克隆节点，不克隆节点的子节点，所以不用加参数true
      if (ele.dom.current) {
        ele.dom.current.appendChild(dom);
      } else {
        ele.dom.appendChild(dom);
      }
      this.play({
        parent: ele,
        dom,
        val: current.val
      });
    }
  }
  start() {
    //初始化函数
    this.chain.val = this.convert(this.element, this.chain.val);
    clearTimeout(this.timer);
    this.timer = null;
    this.output.current.innerHTML = "";
    this.play(this.chain);
  }
  done() {
    this.doneState = true;
    clearTimeout(this.timer);
    this.timer = null;
  }
}

export default Typing;
