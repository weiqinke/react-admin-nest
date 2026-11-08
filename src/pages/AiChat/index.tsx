import { streamAiChat } from "@/api/ai-stream";
import { getAiConversation, listAiConversations, listAiModelOptions } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import { themePalette } from "@/theme/palette";
import { canAccessMenuPath } from "@/utils/menuUtils";
import { Bubble, Conversations, Prompts, Sender, Welcome, type BubbleItemType, type BubbleListProps } from "@ant-design/x";
import { arePropsEqualIgnoringDomNode, XMarkdown, type ComponentProps } from "@ant-design/x-markdown";
import { App, Button, Drawer, Empty, Input, Select, Spin, theme } from "antd";
import dayjs from "dayjs";
import { type CSSProperties, type FC, memo, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router";

const infos = [{ title: "AI" }, { title: "对话" }];
const introduction = "向已启用的模型提问。只保留你自己最近的 50 条对话。模型在创建时选定，之后不能更换。";
const AI_ADMIN_PATH = "/management/aiadmin";
const NEAR_BOTTOM = 80;

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

function titleFromContent(content: string) {
  const chars = Array.from(content.trim());
  if (chars.length <= 40) return chars.join("");
  return chars.slice(0, 40).join("");
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

function bubbleText(content: string) {
  return <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{content}</div>;
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
        <span style={{ fontSize: 12, color: "var(--ant-color-text-secondary)" }}>{[language || "代码", lineCount ? `${lineCount} 行` : ""].filter(Boolean).join(" · ")}</span>
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

const MarkdownTable = memo(function MarkdownTable({ children, className, style }: ComponentProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", minWidth: 0, maxWidth: "100%", overflowX: "auto" }}>
      <table className={className} style={style}>
        {children}
      </table>
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

function AssistantBody({ content, streaming = false }: { content: string; streaming?: boolean }) {
  const failure = classifyAssistantFailure(content);
  if (failure.kind === "placeholder") return failureLine(content);
  if (failure.kind === "answer-with-failure") {
    return (
      <div>
        <div style={{ marginBottom: 8, color: "var(--ant-color-warning)" }}>调用失败</div>
        <AssistantMarkdown content={failure.answer} streaming={streaming} />
        {failureLine(content.slice(failure.answer.length).trim())}
      </div>
    );
  }
  return <AssistantMarkdown content={content} streaming={streaming} />;
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
  return (
    <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
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
      contentRender: content => bubbleText(typeof content === "string" ? content : "")
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
  const [canManageModels, setCanManageModels] = useState(() => canAccessMenuPath(AI_ADMIN_PATH));

  const draftSeq = useRef(1);
  const detailSeq = useRef(0);
  const pinBottom = useRef(true);
  const alignStart = useRef(false);
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
      return;
    }
    const seq = ++searchSeq.current;
    setSearchHits(null);
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
    if (alignStart.current && detailStatus === "ready" && !inflightRef.current) {
      alignStart.current = false;
      pinBottom.current = scrollToLastTurn(el);
      setShowJump(false);
      return;
    }
    if (!pinBottom.current) return;
    el.scrollTop = el.scrollHeight;
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
    alignStart.current = true;
    pinBottom.current = false;
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
      let candidates = list.filter(item => !flight.knownIds.has(item.id));
      const expected = titleFromContent(flight.content);
      const titled = candidates.filter(item => item.title === expected);
      if (titled.length) candidates = titled;
      const ordered = [...candidates].sort((left, right) => {
        const leftTime = dayjs(left.updated_at);
        const rightTime = dayjs(right.updated_at);
        return (rightTime.isValid() ? rightTime.valueOf() : 0) - (leftTime.isValid() ? leftTime.valueOf() : 0);
      });
      for (const candidate of ordered.slice(0, 5)) {
        try {
          const detailRes = await getAiConversation(candidate.id);
          const item = normalizeConversation(payloadOf(detailRes));
          if (!item || !hasWrittenUser(item.messages, flight)) continue;
          rememberMessages(item.id, item.messages);
          return item;
        } catch {
          continue;
        }
      }
      return null;
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
    const raw = Array.from(draft ?? textRef.current).slice(0, 8000).join("");
    const content = raw.trim();
    if (!content) return;
    const origin = viewRef.current;
    if (origin.kind === "chat" && !messageCacheRef.current.has(origin.id)) return;
    if (origin.kind === "chat" && modelStatusRef.current === "ready" && modelsRef.current.length > 0 && !modelsRef.current.some(item => item.id === modelIdRef.current)) return;
    if (origin.kind === "new" && listStatusRef.current !== "ready") return;
    if (origin.kind === "new" && !modelIdRef.current) {
      if (!(modelStatusRef.current === "ready" && modelsRef.current.length === 0)) message.warning("先选择一个模型");
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
    draftsRef.current.delete(viewKey(origin));
    updateText("");
    try {
      const path = origin.kind === "chat" ? `/api/ai/conversations/${encodeURIComponent(origin.id)}/messages` : "/api/ai/conversations";
      const body = origin.kind === "chat" ? { content } : { model_id: modelIdRef.current, content };
      const rawItem = await streamAiChat(path, body, {
        onMeta: event => {
          if (event.conversation_id) setStreamConversationId(event.conversation_id);
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
        parkDraft(origin, settled, raw, false, stayed);
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
    if (inflightRef.current) {
      pinBottom.current = true;
      el.scrollTop = el.scrollHeight;
      return;
    }
    pinBottom.current = scrollToLastTurn(el);
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
  const flightHere = Boolean(
    inflight && detailStatus !== "loading" && detailStatus !== "error" && (sameView(inflight.origin, view) || viewingStreamChat)
  );
  const showStream = Boolean(flightHere && streamText);
  const showWaiting = Boolean(flightHere && inflight?.phase === "waiting" && !streamText);
  const showOptimistic = Boolean(flightHere && inflight && !hasWrittenUser(messages, inflight));

  const bubbleRoles = makeBubbleRoles(token);
  const heading = view.kind === "chat" ? catalogRef.current.get(view.id)?.title || conversations.find(item => item.id === view.id)?.title || "对话" : "新对话";
  const sessionKeyword = sessionQuery.trim();
  const searching = sessionKeyword !== "";
  const conversationTitle = (item: AiConversation) => item.title || "未命名对话";
  const searchSource = searching ? (searchHits ?? []) : conversations;
  const activeId = view.kind === "chat" ? view.id : "";
  const activeSummary = activeId ? catalogRef.current.get(activeId) ?? conversations.find(item => item.id === activeId) : undefined;
  const pinnedOutside = Boolean(searching && activeSummary && !searchSource.some(item => item.id === activeSummary.id));
  const visibleConversations = pinnedOutside && activeSummary ? [...searchSource, activeSummary] : searchSource;
  const orderedConversations = conversationGroups.flatMap(group => visibleConversations.filter(item => conversationGroup(item.updated_at) === group));
  const conversationItems = orderedConversations.map(item => {
    const modelName = models.find(model => model.id === item.model_id)?.name || "";
    const when = formatUpdatedAt(item.updated_at);
    const replying =
      (streamConversationId !== "" && item.id === streamConversationId) || (inflight?.origin.kind === "chat" && inflight.origin.id === item.id);
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

  const conversationPane = () => (
    <div className="flex h-full min-h-0 flex-col">
      {listReady ? (
        <Input allowClear className="mb-2 shrink-0" placeholder="查找标题或内容" value={sessionQuery} onChange={event => setSessionQuery(event.target.value)} />
      ) : null}
      <Conversations
        className={listReady && !filterMiss ? "min-h-0 flex-1" : "shrink-0"}
        activeKey={view.kind === "chat" ? view.id : ""}
        items={listStatus === "ready" ? conversationItems : []}
        groupable={listReady && !filterMiss}
        creation={{ label: "新对话", onClick: () => startNew() }}
        styles={{ creation: { position: "sticky", top: 0, zIndex: 1, background: "#fff" } }}
        onActiveChange={value => openChat(value)}
      />
      {searching && searchStatus === "loading" ? (
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
      <div className="shrink-0 border-t border-neutral-200 px-3 py-2 text-xs text-neutral-500">仅显示最近 50 条</div>
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
      const body = item.role === "user" ? bubbleText(item.content) : <AssistantBody content={item.content} />;
      return {
        key: item.id,
        role: item.role,
        content: item.content,
        footer: messageFooter(item, copyMessage, reuseMessage),
        contentRender: markLast ? () => <div data-last-turn="">{body}</div> : undefined
      };
    });
    if (showOptimistic && inflight) {
      const pending: AiMessage = { id: "pending-user", role: "user", content: inflight.raw, created_at: "" };
      bubbleItems.push({
        key: pending.id,
        role: "user",
        content: pending.content,
        footer: messageFooter(pending, copyMessage)
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
    messageBody = (
      <Bubble.List
        autoScroll={false}
        items={bubbleItems}
        role={bubbleRoles}
        styles={{ scroll: { maxHeight: "none", overflowY: "visible" } }}
      />
    );
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
            <div className="shrink-0 truncate border-b border-neutral-200 px-1 py-2 text-sm" style={{ background: themePalette.light.accentSoft }} title={inflight.content}>
              {inflight.content}
            </div>
          ) : null}
          <div className="relative min-h-0 flex-1">
            <div ref={scroller} className="h-full min-h-0 overflow-auto py-3" onScroll={onMessagesScroll}>
              {messageBody}
            </div>
            {showJump ? (
              <Button size="small" autoInsertSpace={false} className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2" onClick={jumpToLatest}>
                回到最新
              </Button>
            ) : null}
          </div>
          <div ref={composer} className="shrink-0 border-t border-neutral-200 pt-3">
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
                    {sending ? "上一条消息仍在发送" : showUnavailable ? "当前模型已停用，请换模型新开" : view.kind === "new" && listStatus === "error" ? "会话列表加载失败，请先重试" : ""}
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
