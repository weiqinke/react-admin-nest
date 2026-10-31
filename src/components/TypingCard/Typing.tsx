/** 将纯文本拆成打字单元：中文按字，英文/数字标识符按词 */
function tokenizeText(text: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    const code = text.codePointAt(i)!;
    const ch = String.fromCodePoint(code);
    const unitLen = ch.length;

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

function tokenDelay(base: number, token: string): number {
  if (!token || /^\s+$/.test(token)) return Math.max(12, Math.floor(base * 0.25));
  if (/^[A-Za-z0-9._-]+$/.test(token)) {
    return base + Math.min(token.length * 6, 48);
  }
  if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(token)) return base + 8;
  return base;
}

/** 去掉可能残留的标签，只保留纯文本 */
function toPlainText(data: string): string {
  if (!data) return "";
  if (!/[<>]/.test(data)) return data;
  const el = document.createElement("div");
  el.innerHTML = data;
  return el.textContent || "";
}

class Typing {
  public delay: number;
  public doneState = false;
  public timer: ReturnType<typeof setTimeout> | null = null;

  private output: { current: HTMLElement | null };
  private tokens: string[] = [];
  private index = 0;
  private shown = "";
  private textNode: Text | null = null;

  constructor(opts: { data?: string; output: { current: HTMLElement | null }; delay?: number }) {
    this.output = opts.output;
    this.delay = opts.delay || 120;
    this.tokens = tokenizeText(toPlainText(opts.data || "").replace(/\s+/g, " ").trim());
  }

  start() {
    const root = this.output.current;
    if (!root) return;

    this.doneState = false;
    this.index = 0;
    this.shown = "";
    if (this.timer != null) clearTimeout(this.timer);
    this.timer = null;

    root.replaceChildren();
    this.textNode = document.createTextNode("");
    root.appendChild(this.textNode);
    this.scheduleNext();
  }

  private scheduleNext = () => {
    if (this.doneState) return;
    if (this.index >= this.tokens.length) {
      this.done();
      return;
    }

    const token = this.tokens[this.index]!;
    this.timer = setTimeout(() => {
      if (this.doneState) return;
      this.index += 1;
      this.shown += token;
      if (this.textNode) this.textNode.nodeValue = this.shown;
      this.scheduleNext();
    }, tokenDelay(this.delay, token));
  };

  done() {
    this.doneState = true;
    if (this.timer != null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export default Typing;
