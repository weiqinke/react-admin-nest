import { streamAiChat } from "@/api/ai-stream";
import { getAiConversation, listAiConversations, listAiModelOptions } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import { themePalette } from "@/theme/palette";
import { canAccessMenuPath } from "@/utils/menuUtils";
import { Bubble, Conversations, Prompts, Sender, Welcome, type BubbleItemType, type BubbleListProps } from "@ant-design/x";
import { arePropsEqualIgnoringDomNode, XMarkdown, type ComponentProps } from "@ant-design/x-markdown";
import { App, Button, Drawer, Empty, Input, Select, Spin, theme } from "antd";
import dayjs from "dayjs";
import { Children, type CSSProperties, type FC, isValidElement, memo, type ReactElement, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router";

const infos = [{ title: "AI" }, { title: "对话" }];
const introduction = "向已启用的模型提问。只保留你自己最近的 50 条对话。模型在创建时选定，之后不能更换。";
const AI_ADMIN_PATH = "/management/aiadmin";
const NEAR_BOTTOM = 80;
const CONTINUE_PROMPT = "请接着写下一句，不要重复已经写过的内容。";

type LoadStatus = "loading" | "ready" | "error";
type DetailStatus = "idle" | "loading" | "ready" | "error";

type AiModelOption = {
  id: string;
  name: string;
  provider: string;
  model: string;
};

type AiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  token_usage?: number;
};

type AiConversation = {
  id: string;
  user_id: string;
  model_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: AiMessage[];
};

type ViewRef = { kind: "new"; key: number } | { kind: "chat"; id: string };

type Inflight = {
  origin: ViewRef;
  raw: string;
  content: string;
  baseMessages: AiMessage[];
  hasBaseline: boolean;
  knownIds: Set<string>;
  phase: "waiting" | "reconciling";
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function textOf(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function payloadOf(res: unknown) {
  return asRecord(asRecord(res)?.data)?.data;
}

function readRows(payload: unknown) {
  const list = asRecord(payload)?.list;
  return Array.isArray(list) ? list : [];
}

function normalizeModel(value: unknown): AiModelOption | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = textOf(row.id);
  if (!id) return null;
  return {
    id,
    name: textOf(row.name),
    provider: textOf(row.provider),
    model: textOf(row.model)
  };
}

function normalizeMessage(value: unknown): AiMessage | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = textOf(row.id);
  const role = row.role === "assistant" ? "assistant" : row.role === "user" ? "user" : null;
  if (!id || !role) return null;
  const usage = row.token_usage;
  return {
    id,
    role,
    content: textOf(row.content),
    created_at: textOf(row.created_at),
    token_usage: typeof usage === "number" && Number.isFinite(usage) ? usage : undefined
  };
}

function normalizeConversation(value: unknown): AiConversation | null {
  const row = asRecord(value);
  if (!row) return null;
  const id = textOf(row.id);
  if (!id) return null;
  const messages = Array.isArray(row.messages)
    ? row.messages.flatMap(item => {
        const message = normalizeMessage(item);
        return message ? [message] : [];
      })
    : [];
  return {
    id,
    user_id: textOf(row.user_id),
    model_id: textOf(row.model_id),
    title: textOf(row.title),
    created_at: textOf(row.created_at),
    updated_at: textOf(row.updated_at),
    messages
  };
}

function viewKey(view: ViewRef) {
  return view.kind === "new" ? `new:${view.key}` : `chat:${view.id}`;
}

function sameView(left: ViewRef, right: ViewRef) {
  return viewKey(left) === viewKey(right);
}

function formatUpdatedAt(value: string) {
  if (!value) return "";
  const parsed = dayjs(value);
  if (!parsed.isValid()) return value;
  if (parsed.isSame(dayjs(), "day")) {
    const minutes = dayjs().diff(parsed, "minute");
    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    return parsed.format("HH:mm");
  }
  if (!parsed.isSame(dayjs(), "year")) return parsed.format("YYYY-MM-DD HH:mm");
  return parsed.format("MM-DD HH:mm");
}

function tokenText(usage: number | undefined) {
  if (typeof usage !== "number" || !Number.isFinite(usage) || usage <= 0) return "";
  return `tokens ${usage}`;
}

function modelOptionLabel(item: AiModelOption) {
  return item.model ? `${item.name} · ${item.model}` : item.name;
}

function hasWrittenUser(messages: AiMessage[], flight: Inflight) {
  const baseIds = new Set(flight.baseMessages.map(item => item.id));
  return messages.some(item => item.role === "user" && item.content === flight.content && !baseIds.has(item.id));
}

function lastIsPendingUser(item: AiConversation, flight: Inflight) {
  const last = item.messages[item.messages.length - 1];
  if (!last || last.role !== "user" || last.content !== flight.content) return false;
  return !flight.baseMessages.some(message => message.id === last.id);
}

function oneLineExcerpt(content: string, limit: number) {
  const flat = content.replace(/\s+/g, " ").trim();
  const chars = Array.from(flat);
  if (chars.length <= limit) return chars.join("");
  return `${chars.slice(0, limit).join("")}…`;
}

function turnMark(content: string) {
  const failure = classifyAssistantFailure(content);
  if (failure.kind === "placeholder" && content === AI_STUB_REPLY) return "未接入";
  if (failure.kind === "placeholder" || failure.kind === "answer-with-failure") return "调用失败";
  return "";
}

function buildTurns(messages: AiMessage[]) {
  const turns: { id: string; n: number; excerpt: string; mark: string }[] = [];
  let n = 0;
  messages.forEach((item, index) => {
    if (item.role !== "user") return;
    n += 1;
    const next = messages[index + 1];
    turns.push({
      id: item.id,
      n,
      excerpt: oneLineExcerpt(item.content, 40),
      mark: next?.role === "assistant" ? turnMark(next.content) : ""
    });
  });
  return turns;
}

function UserBubble({ content, expanded = false }: { content: string; expanded?: boolean }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (expanded) setOpen(true);
  }, [expanded]);
  const long = content.split("\n").length > 4 || Array.from(content).length > 160;
  return (
    <div>
      <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: long && !open ? "6.8em" : undefined, overflow: long && !open ? "hidden" : undefined }}>
        {content}
      </div>
      {long ? (
        <Button type="link" size="small" autoInsertSpace={false} style={{ height: "auto", padding: 0 }} onClick={() => setOpen(value => !value)}>
          {open ? "收起" : "展开"}
        </Button>
      ) : null}
    </div>
  );
}

const assistantStreaming = {
  hasNextChunk: true,
  incremental: true,
  incompleteMarkdown: "complete" as const,
  tail: true
};

const AI_STUB_REPLY = "模型未接入，已记录本次调用。";
const FAIL_HEAD = "（调用失败：";
const FAIL_TAIL = "）";
const MAX_NOTE_CHARS = 120;

type AssistantFailure = { kind: "placeholder" } | { kind: "answer-with-failure"; answer: string } | { kind: "answer" };

function failureNoteBody(content: string, headAt: number) {
  if (!content.endsWith(FAIL_TAIL)) return null;
  const body = content.slice(headAt + FAIL_HEAD.length, -FAIL_TAIL.length);
  if ([...body].length > MAX_NOTE_CHARS) return null;
  return body;
}

function classifyAssistantFailure(content: string): AssistantFailure {
  if (content === AI_STUB_REPLY) return { kind: "placeholder" };
  if (content.startsWith(AI_STUB_REPLY + FAIL_HEAD) && failureNoteBody(content, AI_STUB_REPLY.length) !== null) return { kind: "placeholder" };
  const marker = "\n\n" + FAIL_HEAD;
  const at = content.lastIndexOf(marker);
  if (at > 0 && failureNoteBody(content, at + "\n\n".length) !== null) {
    const answer = content.slice(0, at);
    if (answer.trim() !== "") return { kind: "answer-with-failure", answer };
  }
  return { kind: "answer" };
}

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  return "";
}

function copyPlainText(text: string, notify: { success: (content: string) => void; error: (content: string) => void }) {
  const finish = () => notify.success("已复制");
  const fail = () => notify.error("复制失败");
  const fallback = () => {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "true");
      area.style.position = "fixed";
      area.style.top = "0";
      area.style.left = "0";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.focus();
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      if (ok) finish();
      else fail();
    } catch {
      fail();
    }
  };
  const write = navigator.clipboard?.writeText(text);
  if (!write) {
    fallback();
    return;
  }
  let settled = false;
  const timer = window.setTimeout(() => {
    if (settled) return;
    settled = true;
    fallback();
  }, 400);
  write.then(
    () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      finish();
    },
    () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      fallback();
    }
  );
}

function fenceLanguage(className: string | undefined) {
  const matched = /language-([\w+-]+)/.exec(className ?? "");
  return matched?.[1] ?? "";
}

const fenceScroll: CSSProperties = {
  margin: 0,
  maxWidth: "100%",
  minWidth: 0,
  overflowX: "auto",
  whiteSpace: "pre",
  wordBreak: "normal",
  overflowWrap: "normal"
};

const FENCE_PREVIEW_LINES = 14;

const MarkdownCode = memo(function MarkdownCode({ children, className, block, streamStatus }: ComponentProps) {
  const { message } = App.useApp();
  const [open, setOpen] = useState(false);
  if (!block) return <code className={className}>{children}</code>;
  const text = nodeText(children).replace(/\n$/, "");
  const lineCount = text ? text.split("\n").length : 0;
  const long = lineCount > FENCE_PREVIEW_LINES;
  const collapsed = streamStatus === "done" && long && !open;
  const language = fenceLanguage(className);
  return (
    <div style={{ minWidth: 0, maxWidth: "100%", border: "1px solid var(--ant-color-border-secondary)", borderRadius: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, paddingLeft: 8 }}>
        <span style={{ fontSize: 12, color: "var(--ant-color-text-secondary)" }}>
          {[language || "代码", lineCount ? `${lineCount} 行` : ""].filter(Boolean).join(" · ")}
        </span>
        <span>
          {streamStatus === "done" && long ? (
            <Button type="link" size="small" autoInsertSpace={false} onClick={() => setOpen(current => !current)}>
              {open ? "收起" : "展开"}
            </Button>
          ) : null}
          <Button type="link" size="small" autoInsertSpace={false} disabled={streamStatus !== "done"} onClick={() => copyPlainText(text, message)}>
            复制
          </Button>
        </span>
      </div>
      <pre style={{ ...fenceScroll, maxHeight: collapsed ? "23.8em" : undefined, overflowY: collapsed ? "hidden" : "visible" }}>
        <code className={className} style={fenceScroll}>
          {children}
        </code>
      </pre>
    </div>
  );
}, arePropsEqualIgnoringDomNode);

const MarkdownPre = memo(function MarkdownPre({ children }: ComponentProps) {
  return <>{children}</>;
}, arePropsEqualIgnoringDomNode);

function rowElements(node: ReactNode): ReactElement[] {
  const rows: ReactElement[] = [];
  for (const child of Children.toArray(node)) {
    if (!isValidElement(child)) continue;
    if (typeof child.type === "string" && child.type === "tr") {
      rows.push(child);
      continue;
    }
    const nested = rowElements((child.props as { children?: ReactNode }).children);
    if (nested.length) rows.push(...nested);
  }
  return rows;
}

const MarkdownTable = memo(function MarkdownTable({ children, className, style }: ComponentProps) {
  const [open, setOpen] = useState(false);
  const rows = rowElements(children);
  const dataRows = Math.max(rows.length - 1, 0);
  const long = dataRows > 8;
  const shown = rows.length && long && !open ? rows.slice(0, 9) : rows;
  return (
    <div style={{ minWidth: 0, maxWidth: "100%" }}>
      {long ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span style={{ fontSize: 12, color: "var(--ant-color-text-secondary)" }}>{`表格 · ${dataRows} 行`}</span>
          <Button type="link" size="small" autoInsertSpace={false} onClick={() => setOpen(value => !value)}>
            {open ? "收起" : "展开"}
          </Button>
        </div>
      ) : null}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", minWidth: 0, maxWidth: "100%", overflowX: "auto" }}>
        <table className={className} style={style}>
          {shown.length ? <tbody>{shown}</tbody> : children}
        </table>
      </div>
    </div>
  );
}, arePropsEqualIgnoringDomNode);

const markdownComponents = { code: MarkdownCode, pre: MarkdownPre, table: MarkdownTable };

function AssistantMarkdown({ content, streaming = false }: { content: string; streaming?: boolean }) {
  return (
    <XMarkdown
      content={content}
      streaming={streaming ? assistantStreaming : false}
      components={markdownComponents}
      escapeRawHtml
      openLinksInNewTab
      style={{ overflowWrap: "anywhere", minWidth: 0, maxWidth: "100%" }}
    />
  );
}

function failureLine(text: string) {
  return <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: "var(--ant-color-warning)" }}>{text}</div>;
}

function markdownHeadings(content: string) {
  const titles: string[] = [];
  let fence = false;
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      fence = !fence;
      continue;
    }
    if (fence) continue;
    const matched = /^(#{1,3})\s+(.+?)\s*#*$/.exec(trimmed);
    if (matched?.[2]) titles.push(matched[2].trim());
  }
  return titles;
}

function scrollToHeading(origin: HTMLElement, index: number) {
  const root = origin.parentElement?.parentElement;
  const scroller = origin.closest("[data-chat-scroll]");
  const heading = root?.querySelectorAll("h1, h2, h3")[index];
  if (!(scroller instanceof HTMLElement) || !(heading instanceof HTMLElement)) return;
  const top = heading.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop;
  scroller.scrollTop = Math.max(0, top);
}

function headingLabel(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .trim();
}

function HeadingBar({ titles }: { titles: string[] }) {
  if (titles.length < 2) return null;
  return (
    <div className="mb-2 flex gap-2 overflow-x-auto">
      {titles.map((title, index) => {
        const label = headingLabel(title);
        return (
          <Button key={`${index}-${label}`} size="small" autoInsertSpace={false} title={label} onClick={event => scrollToHeading(event.currentTarget, index)}>
            {oneLineExcerpt(label, 24)}
          </Button>
        );
      })}
    </div>
  );
}

function AssistantBody({ content, streaming = false }: { content: string; streaming?: boolean }) {
  const { message } = App.useApp();
  const failure = classifyAssistantFailure(content);
  if (failure.kind === "placeholder") return failureLine(content);
  if (failure.kind === "answer-with-failure") {
    const note = content.slice(failure.answer.length).trim();
    const reason = failureNoteBody(content, failure.answer.length + "\n\n".length);
    return (
      <div>
        <div style={{ marginBottom: 8, color: "var(--ant-color-warning)" }}>{reason ? `调用失败：${reason}` : "调用失败"}</div>
        {streaming ? null : <HeadingBar titles={markdownHeadings(failure.answer)} />}
        <AssistantMarkdown content={failure.answer} streaming={streaming} />
        <div className="mt-2">
          {failureLine(note)}
          <Button type="link" size="small" autoInsertSpace={false} style={{ height: "auto", padding: 0 }} onClick={() => copyPlainText(note, message)}>
            复制说明
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div>
      {streaming ? null : <HeadingBar titles={markdownHeadings(content)} />}
      <AssistantMarkdown content={content} streaming={streaming} />
    </div>
  );
}

function copyableContent(item: AiMessage) {
  if (item.role !== "assistant") return item.content;
  const failure = classifyAssistantFailure(item.content);
  if (failure.kind === "answer-with-failure") return failure.answer;
  return item.content;
}

function retryableFailure(content: string) {
  const failure = classifyAssistantFailure(content);
  if (failure.kind === "answer-with-failure") return true;
  return failure.kind === "placeholder" && content !== AI_STUB_REPLY;
}

function scrollToMark(el: HTMLElement, id: string) {
  const mark = el.querySelector(`[data-mark="${CSS.escape(id)}"]`);
  if (!(mark instanceof HTMLElement)) return false;
  const top = mark.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
  el.scrollTop = Math.max(0, top);
  return true;
}

function matchingMessageIds(messages: AiMessage[], keyword: string) {
  const needle = keyword.trim().toLocaleLowerCase();
  if (!needle) return [];
  return messages.filter(item => item.content.toLocaleLowerCase().includes(needle)).map(item => item.id);
}

function scrollToLastTurn(el: HTMLElement) {
  const mark = el.querySelector("[data-last-turn]");
  if (!(mark instanceof HTMLElement) || mark.offsetHeight <= el.clientHeight) {
    el.scrollTop = el.scrollHeight;
    return true;
  }
  const top = mark.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
  el.scrollTop = Math.max(0, top);
  return false;
}

const conversationGroups = ["今天", "昨天", "近 7 天", "更早"] as const;

function conversationGroup(updatedAt: string) {
  const parsed = dayjs(updatedAt);
  if (!parsed.isValid()) return "更早";
  const now = dayjs();
  if (parsed.isSame(now, "day")) return "今天";
  if (parsed.isSame(now.subtract(1, "day"), "day")) return "昨天";
  if (parsed.isBefore(now) && now.startOf("day").diff(parsed.startOf("day"), "day") < 7) return "近 7 天";
  return "更早";
}

function messageFooter(item: AiMessage, onCopy: (content: string) => void, onReuse?: (content: string) => void) {
  const tokens = item.role === "assistant" ? tokenText(item.token_usage) : "";
  const time = formatUpdatedAt(item.created_at);
  const mark = item.role === "assistant" ? turnMark(item.content) : "";
  return (
    <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
      {mark ? <span style={{ color: "var(--ant-color-warning)" }}>{mark}</span> : null}
      {time ? <span>{time}</span> : null}
      <Button type="link" size="small" autoInsertSpace={false} style={{ height: "auto", padding: 0 }} onClick={() => onCopy(copyableContent(item))}>
        复制
      </Button>
      {item.role === "user" && onReuse ? (
        <Button type="link" size="small" autoInsertSpace={false} style={{ height: "auto", padding: 0 }} onClick={() => onReuse(item.content)}>
          填入输入框
        </Button>
      ) : null}
      {tokens ? <span>{tokens}</span> : null}
    </span>
  );
}

const STARTERS = [
  { key: "ability", label: "说明能做什么", text: "用三句话说明你能帮我处理什么，每句单独一行。" },
  { key: "notice", label: "起草公告", text: "起草一则系统维护公告，包含时间、影响和联系方式。" },
  { key: "steps", label: "整理步骤", text: "把一次接口超时的排查过程写成可执行的步骤。" }
];

function makeBubbleRoles(token: { colorText: string; colorBgContainer: string }): BubbleListProps["role"] {
  return {
    user: {
      placement: "end",
      variant: "filled",
      shape: "corner",
      footerPlacement: "outer-end",
      styles: { content: { maxWidth: "40rem", lineHeight: 1.7, background: themePalette.light.accentSoft, color: token.colorText } },
      contentRender: content => <UserBubble content={typeof content === "string" ? content : ""} />
    },
    assistant: {
      placement: "start",
      variant: "outlined",
      footerPlacement: "outer-start",
      styles: { content: { maxWidth: "40rem", minWidth: 0, lineHeight: 1.7, background: token.colorBgContainer, color: token.colorText } },
      contentRender: content => <AssistantBody content={typeof content === "string" ? content : ""} />
    }
  };
}

const AiChatScreen: FC = () => {
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const [models, setModels] = useState<AiModelOption[]>([]);
  const [modelStatus, setModelStatus] = useState<LoadStatus>("loading");
  const [modelId, setModelId] = useState<string>();
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [listStatus, setListStatus] = useState<LoadStatus>("loading");
  const [view, setView] = useState<ViewRef>({ kind: "new", key: 1 });
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [detailStatus, setDetailStatus] = useState<DetailStatus>("idle");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [inflight, setInflight] = useState<Inflight | null>(null);
  const [streamText, setStreamText] = useState("");
  const [streamConversationId, setStreamConversationId] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [sessionQuery, setSessionQuery] = useState("");
  const [searchHits, setSearchHits] = useState<AiConversation[] | null>(null);
  const [searchStatus, setSearchStatus] = useState<LoadStatus | "idle">("idle");
  const [searchNonce, setSearchNonce] = useState(0);
  const [locateQuery, setLocateQuery] = useState("");
  const [hitCursor, setHitCursor] = useState(-1);
  const [canManageModels, setCanManageModels] = useState(() => canAccessMenuPath(AI_ADMIN_PATH));

  const draftSeq = useRef(1);
  const detailSeq = useRef(0);
  const pinBottom = useRef(true);
  const scroller = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLDivElement>(null);
  const viewRef = useRef<ViewRef>(view);
  const textRef = useRef(text);
  const sendingRef = useRef(false);
  const inflightRef = useRef<Inflight | null>(null);
  const draftsRef = useRef(new Map<string, string>());
  const modelsRef = useRef(models);
  const listStatusRef = useRef<LoadStatus>("loading");
  const modelIdRef = useRef("");
  const modelStatusRef = useRef<LoadStatus>(modelStatus);
  const conversationsRef = useRef(conversations);
  const catalogRef = useRef(new Map<string, AiConversation>());
  const searchSeq = useRef(0);
  const streamMetaRef = useRef<{ conversationId: string; userMessageId: string } | null>(null);
  const locateQueryRef = useRef("");
  const locatePending = useRef(false);
  const messagesRef = useRef(messages);
  const messageCacheRef = useRef(new Map<string, AiMessage[]>());
  const loadModelsRef = useRef<() => Promise<void>>(async () => {});
  const loadConversationsRef = useRef<(options?: { silent?: boolean }) => Promise<void>>(async () => {});

  const copyMessage = (content: string) => {
    copyPlainText(content, message);
  };

  viewRef.current = view;
  textRef.current = text;
  modelsRef.current = models;
  modelIdRef.current = modelId || "";
  modelStatusRef.current = modelStatus;
  listStatusRef.current = listStatus;
  conversationsRef.current = conversations;
  messagesRef.current = messages;

  const updateText = (value: string) => {
    textRef.current = value;
    setText(value);
  };

  const reuseMessage = (content: string) => {
    const current = textRef.current;
    const next = current.trim() ? `${current.replace(/\s+$/, "")}\n\n${content}` : content;
    updateText(Array.from(next).slice(0, 8000).join(""));
    composer.current?.querySelector("textarea")?.focus();
  };

  const rememberMessages = (id: string, list: AiMessage[]) => {
    if (id) messageCacheRef.current.set(id, list);
  };

  const loadModels = async () => {
    setModelStatus("loading");
    try {
      const res = await listAiModelOptions();
      const list = readRows(payloadOf(res)).flatMap(row => {
        const item = normalizeModel(row);
        return item ? [item] : [];
      });
      modelsRef.current = list;
      setModels(list);
      setModelStatus("ready");
      setModelId(current => {
        if (viewRef.current.kind === "chat") return current;
        if (current && list.some(item => item.id === current)) return current;
        return list[0]?.id;
      });
    } catch {
      modelsRef.current = [];
      setModels([]);
      setModelStatus("error");
    }
  };

  const loadConversations = async (options?: { silent?: boolean }) => {
    if (!options?.silent) setListStatus("loading");
    try {
      const res = await listAiConversations();
      const list = readRows(payloadOf(res)).flatMap(row => {
        const item = normalizeConversation(row);
        return item ? [item] : [];
      });
      conversationsRef.current = list;
      for (const item of list) catalogRef.current.set(item.id, item);
      setConversations(list);
      setListStatus("ready");
    } catch {
      if (!options?.silent) setListStatus("error");
    }
  };

  loadModelsRef.current = loadModels;
  loadConversationsRef.current = loadConversations;

  useEffect(() => {
    void loadModelsRef.current();
    void loadConversationsRef.current();
  }, []);

  useEffect(() => {
    const refresh = () => setCanManageModels(canAccessMenuPath(AI_ADMIN_PATH));
    refresh();
    window.addEventListener("menus:refresh", refresh);
    return () => window.removeEventListener("menus:refresh", refresh);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      if (media.matches) setDrawerOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const keyword = Array.from(sessionQuery.trim()).slice(0, 64).join("");
    if (!keyword) {
      setSearchHits(null);
      setSearchStatus("idle");
      setLocateQuery("");
      locateQueryRef.current = "";
      locatePending.current = false;
      setHitCursor(-1);
      return;
    }
    const seq = ++searchSeq.current;
    setSearchStatus("loading");
    const timer = window.setTimeout(() => {
      listAiConversations(keyword)
        .then(res => {
          if (seq !== searchSeq.current) return;
          const list = readRows(payloadOf(res)).flatMap(row => {
            const item = normalizeConversation(row);
            return item ? [item] : [];
          });
          for (const item of list) catalogRef.current.set(item.id, item);
          setSearchHits(list);
          setSearchStatus("ready");
        })
        .catch(() => {
          if (seq !== searchSeq.current) return;
          setSearchHits([]);
          setSearchStatus("error");
        });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [sessionQuery, searchNonce]);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (pinBottom.current) el.scrollTop = el.scrollHeight;
    if (!locatePending.current || detailStatus !== "ready" || inflightRef.current) return;
    locatePending.current = false;
    const ids = matchingMessageIds(messages, locateQueryRef.current);
    if (!ids.length) return;
    pinBottom.current = false;
    scrollToMark(el, ids[ids.length - 1]);
    setShowJump(true);
    setHitCursor(ids.length - 1);
  }, [messages, inflight, detailStatus, view, streamText]);

  const persistDraft = (target: ViewRef) => {
    const key = viewKey(target);
    const value = textRef.current;
    if (value) draftsRef.current.set(key, value);
    else if (!sendingRef.current) draftsRef.current.delete(key);
  };

  const moveDraft = (next: ViewRef) => {
    const prev = viewRef.current;
    if (sameView(prev, next)) return;
    persistDraft(prev);
    updateText(draftsRef.current.get(viewKey(next)) ?? "");
  };

  const openChat = (id: string) => {
    const next: ViewRef = { kind: "chat", id };
    moveDraft(next);
    const seq = ++detailSeq.current;
    viewRef.current = next;
    setView(next);
    setMessages([]);
    setDetailStatus("loading");
    pinBottom.current = true;
    setShowJump(false);
    setDrawerOpen(false);
    getAiConversation(id)
      .then(res => {
        if (seq !== detailSeq.current || !sameView(viewRef.current, next)) return;
        const item = normalizeConversation(payloadOf(res));
        if (!item) {
          setMessages([]);
          setDetailStatus("error");
          return;
        }
        rememberMessages(item.id, item.messages);
        setMessages(item.messages);
        if (item.model_id) setModelId(item.model_id);
        setDetailStatus("ready");
      })
      .catch(() => {
        if (seq !== detailSeq.current || !sameView(viewRef.current, next)) return;
        setMessages([]);
        setDetailStatus("error");
      });
  };

  const savedNewView = (): ViewRef | null => {
    const currentKey = viewKey(viewRef.current);
    const saved = [...draftsRef.current.keys()].find(key => key.startsWith("new:") && key !== currentKey);
    if (!saved) return null;
    const key = Number(saved.slice(4));
    if (!Number.isFinite(key)) return null;
    return { kind: "new", key };
  };

  const startNew = () => {
    const flight = inflightRef.current;
    const onSendingNew = Boolean(flight && flight.origin.kind === "new" && sameView(flight.origin, viewRef.current));
    const parkedNew = savedNewView();
    let next: ViewRef;
    if (onSendingNew) next = { kind: "new", key: ++draftSeq.current };
    else if (viewRef.current.kind === "new") next = parkedNew && !textRef.current ? parkedNew : viewRef.current;
    else next = parkedNew ?? { kind: "new", key: ++draftSeq.current };
    moveDraft(next);
    detailSeq.current += 1;
    viewRef.current = next;
    setView(next);
    setMessages([]);
    setDetailStatus("idle");
    pinBottom.current = true;
    setShowJump(false);
    setDrawerOpen(false);
    setSessionQuery("");
    setLocateQuery("");
    locateQueryRef.current = "";
    locatePending.current = false;
    setHitCursor(-1);
    setModelId(current => {
      const options = modelsRef.current;
      if (current && options.some(item => item.id === current)) return current;
      return options[0]?.id;
    });
  };

  const moveToFreshModel = () => {
    const typed = textRef.current.trim();
    const lastUser = [...messagesRef.current].reverse().find(item => item.role === "user");
    const carried = typed ? textRef.current : (lastUser?.content ?? "");
    startNew();
    const next = Array.from(carried).slice(0, 8000).join("");
    updateText(next);
    if (next) draftsRef.current.set(viewKey(viewRef.current), next);
  };

  const settleConversation = async (item: AiConversation, flight: Inflight) => {
    let current = item;
    for (let attempt = 0; attempt < 4 && lastIsPendingUser(current, flight); attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, 2000));
      try {
        const res = await getAiConversation(current.id);
        const next = normalizeConversation(payloadOf(res));
        if (!next) break;
        current = next;
      } catch {
        break;
      }
    }
    rememberMessages(current.id, current.messages);
    return current;
  };

  const recoverWritten = async (flight: Inflight) => {
    const meta = streamMetaRef.current;
    if (meta?.conversationId && (flight.origin.kind === "new" || meta.conversationId === flight.origin.id)) {
      try {
        const res = await getAiConversation(meta.conversationId);
        const item = normalizeConversation(payloadOf(res));
        const wroteThis = meta.userMessageId ? item?.messages.some(message => message.id === meta.userMessageId) : item ? hasWrittenUser(item.messages, flight) : false;
        if (!item || !wroteThis) return null;
        rememberMessages(item.id, item.messages);
        await loadConversations({ silent: true });
        return item;
      } catch {
        return null;
      }
    }
    if (flight.origin.kind === "chat") {
      if (!flight.hasBaseline) return null;
      try {
        const res = await getAiConversation(flight.origin.id);
        const item = normalizeConversation(payloadOf(res));
        if (!item || !hasWrittenUser(item.messages, flight)) return null;
        rememberMessages(item.id, item.messages);
        await loadConversations({ silent: true });
        return item;
      } catch {
        return null;
      }
    }
    try {
      const res = await listAiConversations();
      const list = readRows(payloadOf(res)).flatMap(row => {
        const item = normalizeConversation(row);
        return item ? [item] : [];
      });
      conversationsRef.current = list;
      for (const item of list) catalogRef.current.set(item.id, item);
      setConversations(list);
      setListStatus("ready");
      const candidates = list.filter(item => !flight.knownIds.has(item.id));
      const ordered = [...candidates].sort((left, right) => {
        const leftTime = dayjs(left.updated_at);
        const rightTime = dayjs(right.updated_at);
        return (rightTime.isValid() ? rightTime.valueOf() : 0) - (leftTime.isValid() ? leftTime.valueOf() : 0);
      });
      const matched: AiConversation[] = [];
      for (const candidate of ordered.slice(0, 5)) {
        try {
          const detailRes = await getAiConversation(candidate.id);
          const item = normalizeConversation(payloadOf(detailRes));
          const lastUser = item ? [...item.messages].reverse().find(message => message.role === "user") : undefined;
          if (!item || lastUser?.content !== flight.content) continue;
          rememberMessages(item.id, item.messages);
          matched.push(item);
        } catch {
          continue;
        }
      }
      return matched.length === 1 ? matched[0] : null;
    } catch {
      setListStatus("error");
      return null;
    }
  };

  const applyConversation = (origin: ViewRef, item: AiConversation) => {
    const here = viewRef.current;
    const openedThis = here.kind === "chat" && here.id === item.id;
    if (!sameView(here, origin) && !openedThis) return;
    detailSeq.current += 1;
    const next: ViewRef = { kind: "chat", id: item.id };
    viewRef.current = next;
    setView(next);
    rememberMessages(item.id, item.messages);
    setMessages(item.messages);
    setDetailStatus("ready");
    if (item.model_id) setModelId(item.model_id);
  };

  const parkDraft = (origin: ViewRef, item: AiConversation | null, fallback: string, restoreFailure: boolean, stayed: boolean) => {
    const carried = stayed ? textRef.current : (draftsRef.current.get(viewKey(origin)) ?? "");
    const nextKey = item ? viewKey({ kind: "chat", id: item.id }) : viewKey(origin);
    let stored = carried;
    if (!stored && restoreFailure && item) {
      const last = item.messages[item.messages.length - 1];
      if (last?.role === "assistant" && retryableFailure(last.content)) stored = fallback;
    }
    if (!stored && !item) stored = fallback;
    if (stored) {
      draftsRef.current.set(nextKey, stored);
      if (stayed) updateText(stored);
    }
    if (viewKey(origin) !== nextKey) draftsRef.current.delete(viewKey(origin));
  };

  const send = async (draft?: string) => {
    if (sendingRef.current) return;
    const raw = Array.from(draft ?? textRef.current)
      .slice(0, 8000)
      .join("");
    const content = raw.trim();
    if (!content) return;
    const origin = viewRef.current;
    if (origin.kind === "chat" && !messageCacheRef.current.has(origin.id)) return;
    if (origin.kind === "chat" && modelStatusRef.current === "ready" && modelsRef.current.length > 0 && !modelsRef.current.some(item => item.id === modelIdRef.current)) {
      message.warning("当前模型已停用，请换模型新开");
      return;
    }
    if (origin.kind === "new" && listStatusRef.current !== "ready") return;
    if (origin.kind === "new" && modelStatusRef.current === "ready") {
      const picked = modelsRef.current.some(item => item.id === modelIdRef.current);
      if (!picked) {
        if (modelsRef.current.length > 0) message.warning("先选择一个模型");
        return;
      }
    } else if (origin.kind === "new" && !modelIdRef.current) {
      message.warning("先选择一个模型");
      return;
    }
    const el = scroller.current;
    if (el) pinBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM;
    const baseMessages = origin.kind === "chat" ? (messageCacheRef.current.get(origin.id) ?? []) : [];
    const flight: Inflight = {
      origin,
      raw,
      content,
      baseMessages,
      hasBaseline: origin.kind === "chat" && messageCacheRef.current.has(origin.id),
      knownIds: new Set(conversationsRef.current.map(item => item.id)),
      phase: "waiting"
    };
    sendingRef.current = true;
    inflightRef.current = flight;
    setSending(true);
    setInflight(flight);
    setStreamText("");
    setStreamConversationId("");
    streamMetaRef.current = null;
    draftsRef.current.delete(viewKey(origin));
    updateText("");
    try {
      const path = origin.kind === "chat" ? `/api/ai/conversations/${encodeURIComponent(origin.id)}/messages` : "/api/ai/conversations";
      const body = origin.kind === "chat" ? { content } : { model_id: modelIdRef.current, content };
      const rawItem = await streamAiChat(path, body, {
        onMeta: event => {
          const id = event.conversation_id ?? "";
          if (id && (origin.kind === "new" || id === origin.id)) {
            streamMetaRef.current = { conversationId: id, userMessageId: event.user_message_id ?? "" };
            setStreamConversationId(id);
          }
          void loadConversationsRef.current({ silent: true });
        },
        onDelta: piece => {
          setStreamText(current => current + piece);
        }
      });
      const parsed = normalizeConversation(rawItem);
      const item = parsed ? await settleConversation(parsed, flight) : null;
      await loadConversations({ silent: true });
      if (item) {
        const stayed = sameView(viewRef.current, origin);
        applyConversation(origin, item);
        parkDraft(origin, item, flight.content, true, stayed);
      }
    } catch {
      const reconciling = { ...flight, phase: "reconciling" as const };
      inflightRef.current = reconciling;
      setInflight(reconciling);
      const recovered = await recoverWritten(flight);
      if (recovered) {
        const stayed = sameView(viewRef.current, origin);
        const settled = await settleConversation(recovered, flight);
        applyConversation(origin, settled);
        parkDraft(origin, settled, raw, true, stayed);
      } else {
        parkDraft(origin, null, raw, false, sameView(viewRef.current, origin));
      }
    } finally {
      inflightRef.current = null;
      setInflight(null);
      setStreamText("");
      setStreamConversationId("");
      sendingRef.current = false;
      setSending(false);
    }
  };

  const onMessagesScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const pinned = el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM;
    pinBottom.current = pinned;
    setShowJump(current => (current === !pinned ? current : !pinned));
  };

  const jumpToLatest = () => {
    const el = scroller.current;
    setShowJump(false);
    if (!el) return;
    pinBottom.current = true;
    el.scrollTop = el.scrollHeight;
  };

  const scrollToTurn = (id: string) => {
    const el = scroller.current;
    const mark = el?.querySelector(`[data-turn="${CSS.escape(id)}"]`);
    if (!el || !(mark instanceof HTMLElement)) return;
    const top = mark.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
    el.scrollTop = Math.max(0, top);
    pinBottom.current = false;
    setShowJump(true);
  };

  const lookAtTurnStart = () => {
    const el = scroller.current;
    if (!el) return;
    pinBottom.current = scrollToLastTurn(el);
    setShowJump(!pinBottom.current);
  };

  const modelInList = Boolean(modelId && models.some(item => item.id === modelId));
  const showUnavailable = view.kind === "chat" && detailStatus === "ready" && modelStatus === "ready" && models.length > 0 && !modelInList;
  const selectValue = modelInList && (view.kind === "new" || detailStatus === "ready") ? modelId : undefined;
  let modelPlaceholder: string | undefined;
  if (modelStatus === "error") modelPlaceholder = "模型列表加载失败";
  else if (modelStatus === "ready" && models.length === 0) modelPlaceholder = "没有可用模型";
  else if (showUnavailable) modelPlaceholder = "当前模型已停用或已变更";
  const selectDisabled = view.kind === "chat" || modelStatus !== "ready" || models.length === 0;
  const blockEmptyModels = view.kind === "new" && modelStatus === "ready" && models.length === 0;
  const blockUnreadChat = view.kind === "chat" && detailStatus !== "ready";
  const blockList = view.kind === "new" && listStatus !== "ready";
  const viewingStreamChat = Boolean(streamConversationId && view.kind === "chat" && view.id === streamConversationId);
  const flightHere = Boolean(inflight && detailStatus !== "loading" && detailStatus !== "error" && (sameView(inflight.origin, view) || viewingStreamChat));
  const showStream = Boolean(flightHere && streamText);
  const showWaiting = Boolean(flightHere && inflight?.phase === "waiting" && !streamText);
  const showOptimistic = Boolean(flightHere && inflight && !hasWrittenUser(messages, inflight));
  const turns = buildTurns(messages);
  const lastSaved = messages[messages.length - 1];
  const previousQuestion = [...messages].reverse().find(item => item.role === "user");
  const showPreviousQuestion = view.kind === "chat" && detailStatus === "ready" && !flightHere && lastSaved?.role === "assistant" && Boolean(previousQuestion);
  const showTurnStart = view.kind === "chat" && detailStatus === "ready" && !flightHere && !showJump && lastSaved?.role === "assistant";
  const showContinue =
    view.kind === "chat" &&
    detailStatus === "ready" &&
    !sending &&
    !flightHere &&
    !text.trim() &&
    lastSaved?.role === "assistant" &&
    classifyAssistantFailure(lastSaved.content).kind === "answer";
  const hitIds = matchingMessageIds(messages, locateQuery);
  const activeHitId = hitCursor >= 0 && hitCursor < hitIds.length ? hitIds[hitCursor] : "";

  const continueWriting = () => {
    if (textRef.current.trim()) return;
    updateText(CONTINUE_PROMPT);
    composer.current?.querySelector("textarea")?.focus();
  };

  const moveHit = (step: number) => {
    const next = hitCursor + step;
    const id = hitIds[next];
    const el = scroller.current;
    if (!id || !el) return;
    setHitCursor(next);
    if (scrollToMark(el, id)) {
      pinBottom.current = false;
      setShowJump(true);
    }
  };

  useEffect(() => {
    if (view.kind !== "chat" || detailStatus !== "ready" || showUnavailable) return;
    composer.current?.querySelector("textarea")?.focus();
  }, [view, detailStatus, showUnavailable]);

  const bubbleRoles = makeBubbleRoles(token);
  const heading = view.kind === "chat" ? catalogRef.current.get(view.id)?.title || conversations.find(item => item.id === view.id)?.title || "对话" : "新对话";
  const sessionKeyword = sessionQuery.trim();
  const searching = sessionKeyword !== "";
  const conversationTitle = (item: AiConversation) => item.title || "未命名对话";
  const searchSource = searching ? (searchHits ?? []) : conversations;
  const activeId = view.kind === "chat" ? view.id : "";
  const activeSummary = activeId ? (catalogRef.current.get(activeId) ?? conversations.find(item => item.id === activeId)) : undefined;
  const pinnedOutside = Boolean(searching && activeSummary && !searchSource.some(item => item.id === activeSummary.id));
  const visibleConversations = pinnedOutside && activeSummary ? [...searchSource, activeSummary] : searchSource;
  const orderedConversations = conversationGroups.flatMap(group => visibleConversations.filter(item => conversationGroup(item.updated_at) === group));
  const conversationItems = orderedConversations.map(item => {
    const modelName = models.find(model => model.id === item.model_id)?.name || "";
    const when = formatUpdatedAt(item.updated_at);
    const replying = (streamConversationId !== "" && item.id === streamConversationId) || (inflight?.origin.kind === "chat" && inflight.origin.id === item.id);
    const kept = pinnedOutside && item.id === activeId;
    return {
      key: item.id,
      group: conversationGroup(item.updated_at),
      label: (
        <span className="block min-w-0">
          <span className="block truncate">{conversationTitle(item)}</span>
          <span className="block truncate text-xs text-neutral-500">
            {[kept ? "不在筛选里" : "", modelName, when, replying ? "正在回复" : ""].filter(Boolean).join(" ")}
          </span>
        </span>
      )
    };
  });
  const listReady = listStatus === "ready" && conversations.length > 0;
  const filterMiss = listReady && searching && searchStatus === "ready" && searchSource.length === 0 && !pinnedOutside;
  const listFoot = searching
    ? searchStatus === "ready"
      ? (searchHits?.length ?? 0) === 0
        ? ""
        : (searchHits?.length ?? 0) >= 50
          ? "只列出最近更新的 50 条匹配，更早的不会出现"
          : `找到 ${searchHits?.length ?? 0} 条`
      : ""
    : listReady
      ? "仅显示最近 50 条"
      : "";

  const conversationPane = () => (
    <div className="flex h-full min-h-0 flex-col">
      {listReady ? (
        <div className="mb-2 shrink-0">
          <Input allowClear placeholder="查找标题或内容" value={sessionQuery} onChange={event => setSessionQuery(event.target.value)} />
          {searching && searchStatus === "loading" && searchHits !== null ? <div className="mt-1 text-xs text-neutral-500">正在查找…</div> : null}
        </div>
      ) : null}
      <Conversations
        className={listReady && !filterMiss ? "min-h-0 flex-1" : "shrink-0"}
        activeKey={view.kind === "chat" ? view.id : ""}
        items={listStatus === "ready" ? conversationItems : []}
        groupable={listReady && !filterMiss}
        creation={{ label: "新对话", onClick: () => startNew() }}
        styles={{ creation: { position: "sticky", top: 0, zIndex: 1, background: "#fff" } }}
        onActiveChange={value => {
          const query = searching && searchStatus === "ready" ? Array.from(sessionKeyword).slice(0, 64).join("") : "";
          locateQueryRef.current = query;
          locatePending.current = query !== "";
          setLocateQuery(query);
          setHitCursor(-1);
          openChat(value);
        }}
      />
      {searching && searchStatus === "loading" && searchHits === null ? (
        <div className="flex min-h-24 flex-1 items-center justify-center">
          <Spin />
        </div>
      ) : searching && searchStatus === "error" ? (
        <div className="flex min-h-24 flex-1 items-center justify-center">
          <Empty
            description={
              <div>
                <div>查找失败</div>
                <Button type="link" autoInsertSpace={false} onClick={() => setSearchNonce(current => current + 1)}>
                  重试
                </Button>
              </div>
            }
          />
        </div>
      ) : filterMiss ? (
        <div className="flex min-h-24 flex-1 items-center justify-center">
          <Empty description="没有匹配的会话" />
        </div>
      ) : listReady ? null : (
        <div className="flex min-h-24 flex-1 items-center justify-center">
          {listStatus === "loading" ? (
            <Spin />
          ) : listStatus === "error" ? (
            <Empty
              description={
                <div>
                  <div>会话列表加载失败</div>
                  <Button type="link" autoInsertSpace={false} onClick={() => void loadConversations()}>
                    重试
                  </Button>
                </div>
              }
            />
          ) : (
            <Empty description="还没有对话" />
          )}
        </div>
      )}
      {listFoot ? <div className="shrink-0 border-t border-neutral-200 px-3 py-2 text-xs text-neutral-500">{listFoot}</div> : null}
    </div>
  );

  let messageBody: ReactNode;
  if (view.kind === "chat" && detailStatus === "loading") {
    messageBody = (
      <div className="flex h-full items-center justify-center">
        <Spin />
      </div>
    );
  } else if (view.kind === "chat" && detailStatus === "error") {
    messageBody = (
      <div className="flex h-full items-center justify-center">
        <Empty
          description={
            <div>
              <div>对话加载失败</div>
              <Button type="link" autoInsertSpace={false} onClick={() => openChat(view.id)}>
                重试
              </Button>
            </div>
          }
        />
      </div>
    );
  } else if (messages.length || showOptimistic || showWaiting || showStream) {
    const bubbleItems: BubbleItemType[] = messages.map((item, index) => {
      const markLast = index === messages.length - 1 && !showStream && !showWaiting;
      return {
        key: item.id,
        role: item.role,
        content: item.content,
        footer: messageFooter(item, copyMessage, reuseMessage),
        contentRender: () => (
          <div
            data-mark={item.id}
            data-turn={item.role === "user" ? item.id : undefined}
            data-last-turn={markLast ? "" : undefined}
            style={item.id === activeHitId ? { background: themePalette.light.accentSoft, borderRadius: 8 } : undefined}>
            {item.role === "user" ? <UserBubble content={item.content} expanded={hitIds.includes(item.id)} /> : <AssistantBody content={item.content} />}
          </div>
        )
      };
    });
    if (showOptimistic && inflight) {
      const pending: AiMessage = { id: "pending-user", role: "user", content: inflight.raw, created_at: "" };
      bubbleItems.push({
        key: pending.id,
        role: "user",
        content: pending.content,
        footer: messageFooter(pending, copyMessage),
        contentRender: () => (
          <div data-turn={pending.id}>
            <UserBubble content={pending.content} />
          </div>
        )
      });
    }
    if (showStream) {
      bubbleItems.push({
        key: "stream-assistant",
        role: "assistant",
        content: streamText,
        streaming: true,
        contentRender: content => <AssistantBody content={typeof content === "string" ? content : ""} streaming />
      });
    } else if (showWaiting) {
      bubbleItems.push({
        key: "pending-assistant",
        role: "assistant",
        content: "",
        loading: true,
        loadingRender: () => <span className="text-sm text-neutral-500">正在等待回复…</span>
      });
    }
    messageBody = <Bubble.List autoScroll={false} items={bubbleItems} role={bubbleRoles} styles={{ scroll: { maxHeight: "none", overflowY: "visible" } }} />;
  } else if (modelStatus === "loading") {
    messageBody = (
      <div className="flex h-full items-center justify-center">
        <Spin />
      </div>
    );
  } else if (modelStatus === "error") {
    messageBody = (
      <div className="flex h-full items-center justify-center">
        <Empty description="模型列表加载失败" />
      </div>
    );
  } else if (models.length === 0) {
    messageBody = (
      <div className="flex h-full items-center justify-center">
        <Empty
          description={
            <div>
              <div>还没有可用模型</div>
              {canManageModels ? <Link to={AI_ADMIN_PATH}>去模型管理</Link> : <div>请联系管理员启用模型</div>}
            </div>
          }
        />
      </div>
    );
  } else {
    messageBody = (
      <div className="flex h-full flex-col justify-center gap-6 px-6">
        <Welcome variant="borderless" title="从一句提问开始" description="模型在创建时选定。点一条开头，或自己输入。" styles={{ root: { textAlign: "center" } }} />
        <Prompts
          wrap
          styles={{ list: { justifyContent: "center" }, item: { width: 220, textAlign: "left" } }}
          items={STARTERS.map(item => ({ key: item.key, label: item.label, description: item.text }))}
          onItemClick={({ data }) => {
            const starter = STARTERS.find(item => item.key === data.key);
            if (starter && !textRef.current.trim()) updateText(starter.text);
          }}
        />
      </div>
    );
  }

  return (
    <div className="admin-page flex h-[calc(100vh-108px)] flex-col overflow-hidden">
      <div className="shrink-0">
        <PageIntroduction infos={infos} introduction={introduction} />
      </div>
      <div className="mt-3 flex min-h-0 flex-1 gap-3">
        <aside className="admin-card hidden h-full min-h-0 w-64 shrink-0 flex-col overflow-hidden md:flex" style={{ marginTop: 0 }}>
          {conversationPane()}
        </aside>
        <section className="admin-card flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden" style={{ marginTop: 0 }}>
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-neutral-200 pb-3">
            <div className="md:hidden">
              <Button autoInsertSpace={false} onClick={() => setDrawerOpen(true)}>
                会话
              </Button>
            </div>
            <div className="min-w-0 flex-1 truncate">{heading}</div>
            <span className="shrink-0">模型</span>
            <Select
              style={{ width: 240 }}
              disabled={selectDisabled}
              placeholder={modelPlaceholder}
              value={selectValue ?? null}
              options={models.map(item => ({ value: item.id, label: modelOptionLabel(item) }))}
              onChange={value => {
                if (typeof value === "string" || typeof value === "number") setModelId(String(value));
              }}
            />
            {modelStatus === "error" ? (
              <Button type="link" autoInsertSpace={false} onClick={() => void loadModels()}>
                重试
              </Button>
            ) : null}
            {showUnavailable ? (
              <Button autoInsertSpace={false} onClick={moveToFreshModel}>
                换模型新开
              </Button>
            ) : null}
          </div>
          {flightHere && inflight ? (
            <div
              className="shrink-0 truncate border-b border-neutral-200 px-1 py-2 text-sm"
              style={{ background: themePalette.light.accentSoft }}
              title={inflight.content}>
              {inflight.content}
            </div>
          ) : null}
          {hitIds.length > 1 ? (
            <div className="flex shrink-0 gap-2 border-b border-neutral-200 py-2">
              <Button size="small" autoInsertSpace={false} disabled={hitCursor <= 0} onClick={() => moveHit(-1)}>
                上一处
              </Button>
              <Button size="small" autoInsertSpace={false} disabled={hitCursor >= hitIds.length - 1} onClick={() => moveHit(1)}>
                下一处
              </Button>
            </div>
          ) : null}
          {turns.length >= 2 ? (
            <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-neutral-200 py-2">
              {turns.map(turn => (
                <Button key={turn.id} size="small" autoInsertSpace={false} title={turn.excerpt} onClick={() => scrollToTurn(turn.id)}>
                  {`第 ${turn.n} 问 ${turn.excerpt}`}
                  {turn.mark ? ` ${turn.mark}` : ""}
                </Button>
              ))}
            </div>
          ) : null}
          <div className="relative min-h-0 flex-1">
            <div ref={scroller} data-chat-scroll className="h-full min-h-0 overflow-auto py-3" onScroll={onMessagesScroll}>
              {messageBody}
            </div>
            {showJump ? (
              <Button size="small" autoInsertSpace={false} className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2" onClick={jumpToLatest}>
                回到最新
              </Button>
            ) : null}
            {showTurnStart ? (
              <Button size="small" autoInsertSpace={false} className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2" onClick={lookAtTurnStart}>
                看本轮开头
              </Button>
            ) : null}
          </div>
          <div ref={composer} className="shrink-0 border-t border-neutral-200 pt-3">
            {showPreviousQuestion || showContinue ? (
              <div className="mb-2 flex items-center gap-3">
                {showPreviousQuestion && previousQuestion ? (
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left text-sm text-neutral-500"
                    title={previousQuestion.content}
                    onClick={() => scrollToTurn(previousQuestion.id)}>
                    {`上次提问：${oneLineExcerpt(previousQuestion.content, 80)}`}
                  </button>
                ) : (
                  <span className="flex-1" />
                )}
                {showContinue ? (
                  <Button type="link" size="small" autoInsertSpace={false} className="shrink-0" style={{ height: "auto", padding: 0 }} onClick={continueWriting}>
                    接着写
                  </Button>
                ) : null}
              </div>
            ) : null}
            <Sender
              value={text}
              disabled={blockEmptyModels || blockUnreadChat || blockList}
              autoSize={{ minRows: 3, maxRows: 6 }}
              placeholder="输入内容，Enter 发送，Shift+Enter 换行"
              submitType="enter"
              onChange={value => updateText(Array.from(value).slice(0, 8000).join(""))}
              onSubmit={message => void send(message)}
              footer={
                <div className="flex items-center justify-between gap-3 text-sm text-neutral-500">
                  <span>
                    {sending
                      ? text.trim()
                        ? "下一句先留在这里，回复结束后再按 Enter"
                        : "上一条消息仍在发送"
                      : showUnavailable
                        ? "当前模型已停用，请换模型新开"
                        : view.kind === "new" && listStatus === "error"
                          ? "会话列表加载失败，请先重试"
                          : ""}
                  </span>
                  <span style={Array.from(text).length >= 7600 ? { color: "var(--ant-color-warning)" } : undefined}>{Array.from(text).length} / 8000</span>
                </div>
              }
            />
          </div>
        </section>
      </div>
      <Drawer
        title="会话"
        placement="left"
        open={drawerOpen}
        size={300}
        destroyOnHidden
        styles={{ body: { display: "flex", flex: 1, flexDirection: "column", minHeight: 0, overflow: "hidden", padding: 12 } }}
        onClose={() => setDrawerOpen(false)}>
        {conversationPane()}
      </Drawer>
    </div>
  );
};

const AiChat: FC = () => (
  <App component={false}>
    <AiChatScreen />
  </App>
);

export default AiChat;
