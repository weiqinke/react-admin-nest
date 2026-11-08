import { streamAiChat } from "@/api/ai-stream";
import { getAiConversation, listAiConversations, listAiModelOptions } from "@/api/platform";
import PageIntroduction from "@/components/PageIntroduction";
import { canAccessMenuPath } from "@/utils/menuUtils";
import { Bubble, Conversations, Sender, type BubbleItemType, type BubbleListProps } from "@ant-design/x";
import { App, Button, Drawer, Empty, Select, Spin } from "antd";
import dayjs from "dayjs";
import { type FC, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
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
  if (parsed.isSame(dayjs(), "day")) return parsed.format("HH:mm");
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

function bubbleText(content: string, caret = false) {
  return (
    <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
      {content}
      {caret ? <span className="ml-0.5 inline-block animate-pulse">▍</span> : null}
    </div>
  );
}

function messageFooter(item: AiMessage, onCopy: (content: string) => void) {
  const tokens = item.role === "assistant" ? tokenText(item.token_usage) : "";
  return (
    <span className="inline-flex items-center gap-2">
      <Button type="link" size="small" autoInsertSpace={false} style={{ height: "auto", padding: 0 }} onClick={() => onCopy(item.content)}>
        复制
      </Button>
      {tokens ? <span className="text-xs text-neutral-400">{tokens}</span> : null}
    </span>
  );
}

const bubbleRoles: BubbleListProps["role"] = {
  user: {
    placement: "end",
    variant: "filled",
    contentRender: content => bubbleText(typeof content === "string" ? content : "")
  },
  assistant: {
    placement: "start",
    variant: "filled",
    contentRender: content => bubbleText(typeof content === "string" ? content : "")
  }
};

const AiChatScreen: FC = () => {
  const { message } = App.useApp();
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
  const [canManageModels, setCanManageModels] = useState(() => canAccessMenuPath(AI_ADMIN_PATH));

  const draftSeq = useRef(1);
  const detailSeq = useRef(0);
  const pinBottom = useRef(true);
  const scroller = useRef<HTMLDivElement>(null);
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
  const messagesRef = useRef(messages);
  const messageCacheRef = useRef(new Map<string, AiMessage[]>());
  const loadModelsRef = useRef<() => Promise<void>>(async () => {});
  const loadConversationsRef = useRef<(options?: { silent?: boolean }) => Promise<void>>(async () => {});

  const copyMessage = (content: string) => {
    const write = navigator.clipboard?.writeText(content);
    if (!write) {
      message.error("复制失败");
      return;
    }
    write.then(
      () => message.success("已复制"),
      () => message.error("复制失败")
    );
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

  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el || !pinBottom.current) return;
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
    pinBottom.current = true;
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
    setDrawerOpen(false);
    setModelId(current => {
      const options = modelsRef.current;
      if (current && options.some(item => item.id === current)) return current;
      return options[0]?.id;
    });
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
    updateText("");
  };

  const send = async (draft?: string) => {
    if (sendingRef.current) return;
    const raw = Array.from(draft ?? textRef.current).slice(0, 8000).join("");
    const content = raw.trim();
    if (!content) return;
    const origin = viewRef.current;
    if (origin.kind === "chat" && !messageCacheRef.current.has(origin.id)) return;
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
      draftsRef.current.delete(viewKey(origin));
      if (item) applyConversation(origin, item);
      else if (sameView(viewRef.current, origin)) updateText("");
    } catch {
      const reconciling = { ...flight, phase: "reconciling" as const };
      inflightRef.current = reconciling;
      setInflight(reconciling);
      draftsRef.current.set(viewKey(origin), raw);
      const recovered = await recoverWritten(flight);
      if (recovered) {
        const settled = await settleConversation(recovered, flight);
        draftsRef.current.delete(viewKey(origin));
        applyConversation(origin, settled);
      } else if (sameView(viewRef.current, origin) && textRef.current === "") {
        updateText(raw);
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
    pinBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM;
  };

  const modelInList = Boolean(modelId && models.some(item => item.id === modelId));
  const showUnavailable = view.kind === "chat" && detailStatus === "ready" && !modelInList;
  const selectValue = modelInList && (view.kind === "new" || detailStatus === "ready") ? modelId : undefined;
  let modelPlaceholder: string | undefined;
  if (modelStatus === "error") modelPlaceholder = "模型列表加载失败";
  else if (modelStatus === "ready" && models.length === 0) modelPlaceholder = "没有可用模型";
  else if (showUnavailable) modelPlaceholder = "当前模型已停用或已变更";
  const selectDisabled = view.kind === "chat" || modelStatus !== "ready" || models.length === 0;
  const blockEmptyModels = view.kind === "new" && modelStatus === "ready" && models.length === 0;
  const blockUnreadChat = view.kind === "chat" && detailStatus !== "ready";
  const blockList = view.kind === "new" && listStatus !== "ready";
  const awaySending = Boolean(sending && inflight && !sameView(inflight.origin, view));
  const viewingStreamChat = Boolean(streamConversationId && view.kind === "chat" && view.id === streamConversationId);
  const flightHere = Boolean(
    inflight && detailStatus !== "loading" && detailStatus !== "error" && (sameView(inflight.origin, view) || viewingStreamChat)
  );
  const showStream = Boolean(flightHere && streamText);
  const showWaiting = Boolean(flightHere && inflight?.phase === "waiting" && !streamText);
  const showOptimistic = Boolean(flightHere && inflight && !hasWrittenUser(messages, inflight));

  const conversationItems = conversations.map(item => ({
    key: item.id,
    label: (
      <span className="block min-w-0">
        <span className="block truncate">{item.title || "未命名对话"}</span>
        <span className="block truncate text-xs text-neutral-500">{formatUpdatedAt(item.updated_at)}</span>
      </span>
    )
  }));
  const listReady = listStatus === "ready" && conversations.length > 0;

  const conversationPane = () => (
    <div className="flex h-full min-h-0 flex-col">
      <Conversations
        className={listReady ? "min-h-0 flex-1" : "shrink-0"}
        activeKey={view.kind === "chat" ? view.id : ""}
        items={listStatus === "ready" ? conversationItems : []}
        creation={{ label: "新对话", onClick: () => startNew() }}
        styles={{ creation: { position: "sticky", top: 0, zIndex: 1, background: "#fff" } }}
        onActiveChange={value => openChat(value)}
      />
      {listReady ? null : (
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
    const bubbleItems: BubbleItemType[] = messages.map(item => ({
      key: item.id,
      role: item.role,
      content: item.content,
      footer: messageFooter(item, copyMessage),
      footerPlacement: "outer-end"
    }));
    if (showOptimistic && inflight) {
      const pending: AiMessage = { id: "pending-user", role: "user", content: inflight.raw, created_at: "" };
      bubbleItems.push({
        key: pending.id,
        role: "user",
        content: pending.content,
        footer: messageFooter(pending, copyMessage),
        footerPlacement: "outer-end"
      });
    }
    if (showStream) {
      bubbleItems.push({
        key: "stream-assistant",
        role: "assistant",
        content: streamText,
        streaming: true,
        contentRender: content => bubbleText(typeof content === "string" ? content : "", true)
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
      <div className="flex h-full items-center justify-center">
        <Empty description="写一条消息开始" />
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
            <span className="shrink-0">模型</span>
            <Select
              className="min-w-0 flex-1"
              style={{ minWidth: 160 }}
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
          </div>
          <div ref={scroller} className="min-h-0 flex-1 overflow-auto py-3" onScroll={onMessagesScroll}>
            {messageBody}
          </div>
          <div className="shrink-0 border-t border-neutral-200 pt-3">
            <Sender
              value={text}
              disabled={sending || blockEmptyModels || blockUnreadChat || blockList}
              autoSize={{ minRows: 3, maxRows: 6 }}
              placeholder="输入内容，Enter 发送，Shift+Enter 换行"
              submitType="enter"
              onChange={value => updateText(Array.from(value).slice(0, 8000).join(""))}
              onSubmit={message => void send(message)}
              footer={
                <div className="flex items-center justify-between gap-3 text-sm text-neutral-500">
                  <span>
                    {awaySending ? "上一条消息仍在发送" : view.kind === "new" && listStatus === "error" ? "会话列表加载失败，请先重试" : ""}
                  </span>
                  <span>{Array.from(text).length} / 8000</span>
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
