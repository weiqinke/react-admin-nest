/** 将纯文本拆成打字单元：中文按字，英文/数字标识符按词，避免中英混排时逐字母跳动 */
function tokenizeText(text: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    const code = text.codePointAt(i)!;
    const ch = String.fromCodePoint(code);
    const unitLen = ch.length;

    // 拉丁标识 / 数字串（含 mail.enabled、department_code、40305）
    if (/[A-Za-z0-9]/.test(ch)) {
      let j = i + unitLen;
      while (j < text.length) {
        const next = text.codePointAt(j)!;
        const nextCh = String.fromCodePoint(next);
        if (/[A-Za-z0-9._-]/.test(nextCh)) {
          j += nextCh.length;
          continue;
        }
        break;
      }
      tokens.push(text.slice(i, j));
      i = j;
      continue;
    }

    // 连续空白合并为一次输出，避免空格闪烁
    if (/\s/.test(ch)) {
      let j = i + unitLen;
      while (j < text.length && /\s/.test(text[j]!)) j += 1;
      tokens.push(text.slice(i, j));
      i = j;
      continue;
    }

    tokens.push(ch);
    i += unitLen;
  }
  return tokens;
}

/** 按单元视觉权重给延迟：中文稍慢，英文词整段出现且略加长一拍 */
function tokenDelay(base: number, token: string): number {
  if (!token || /^\s+$/.test(token)) return Math.max(12, Math.floor(base * 0.25));
  if (/^[A-Za-z0-9._-]+$/.test(token)) {
    // 整词一次打出，延迟随长度略增但封顶，避免长标识符停顿过久
    return base + Math.min(token.length * 6, 48);
  }
  // CJK / 标点：单字节奏
  if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(token)) return base + 8;
  return base;
}

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
    const children: HTMLElement[] = Array.from(dom.childNodes);
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      if (node.nodeType === 3) {
        arr = arr.concat(tokenizeText(node.nodeValue || ""));
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
    const wait = tokenDelay(this.delay, val);
    this.timer = setTimeout(() => {
      if (this.doneState) return;
      if (dom.current) {
        dom.current.appendChild(document.createTextNode(val));
      } else {
        if (!dom.appendChild) {
          return;
        }
        dom.appendChild(document.createTextNode(val));
      }
      callback();
    }, wait);
  }

  play(ele) {
    if (this.doneState) return;
    if (!ele.val.length) {
      if (ele.parent) this.play(ele.parent);
      else this.done();
      return;
    }
    const current = ele.val.shift();
    if (typeof current === "string") {
      this.print(ele.dom, current, () => {
        this.play(ele);
      });
    } else {
      const dom = current.dom.cloneNode();
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
