import { createAiConversation, getAiConversation, listAiConversations, listAiModelOptions, sendAiMessage } from "@/api/platform";
import { Button, Empty, Input, List, Select, Spin, message } from "antd";
import { FC, useEffect, useRef, useState } from "react";

const AiChat: FC = () => {
  const [models, setModels] = useState<any[]>([]);
  const [modelId, setModelId] = useState<string>();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);

  const loadConversations = () =>
    listAiConversations()
      .then(res => setConversations(res.data?.data?.list || []))
      .catch(() => setConversations([]));

  useEffect(() => {
    Promise.all([
      listAiModelOptions()
        .then(res => {
          const options = res.data?.data?.list || [];
          setModels(options);
          if (options[0]) setModelId(String(options[0].id));
        })
        .catch(() => setModels([])),
      loadConversations()
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, sending]);

  const openConversation = (id: string) => {
    setCurrentId(id);
    getAiConversation(id)
      .then(res => {
        const item = res.data?.data;
        setMessages(item?.messages || []);
        if (item?.model_id) setModelId(String(item.model_id));
      })
      .catch(() => setMessages([]));
  };

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    if (!currentId && !modelId) {
      message.warning("先选择一个模型");
      return;
    }
    setSending(true);
    setText("");
    try {
      const res = currentId ? await sendAiMessage(currentId, content) : await createAiConversation({ model_id: modelId as string, content });
      const item = res.data?.data;
      if (item?.id) setCurrentId(String(item.id));
      setMessages(item?.messages || []);
      await loadConversations();
    } catch {
      setText(content);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)] min-h-[480px] gap-3 p-3">
      <aside className="flex w-64 shrink-0 flex-col bg-white">
        <div className="border-b border-neutral-200 p-3">
          <Button
            block
            type="primary"
            onClick={() => {
              setCurrentId("");
              setMessages([]);
            }}>
            新对话
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">
          <List
            dataSource={conversations}
            locale={{ emptyText: "还没有对话" }}
            renderItem={item => (
              <List.Item
                className="cursor-pointer px-3"
                style={{ background: String(item.id) === currentId ? "rgba(22,119,255,0.08)" : undefined }}
                onClick={() => openConversation(String(item.id))}>
                <div className="min-w-0">
                  <div className="truncate">{item.title || "未命名对话"}</div>
                  <div className="truncate text-xs text-neutral-500">{item.updated_at}</div>
                </div>
              </List.Item>
            )}
          />
        </div>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col bg-white">
        <div className="flex items-center gap-3 border-b border-neutral-200 p-3">
          <span className="shrink-0">模型</span>
          <Select
            className="min-w-0 flex-1"
            placeholder={models.length ? "选择模型" : "没有可用模型"}
            value={modelId}
            disabled={Boolean(currentId) || !models.length}
            options={models.map(item => ({
              value: String(item.id),
              label: item.model ? `${item.name} · ${item.model}` : item.name
            }))}
            onChange={value => setModelId(value)}
          />
        </div>
        <div ref={scroller} className="min-h-0 flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Spin />
            </div>
          ) : messages.length ? (
            <div className="flex flex-col gap-3">
              {messages.map(item => {
                const mine = item.role === "user";
                const tokens = item.token_usage;
                return (
                  <div key={item.id} className={mine ? "flex justify-end" : "flex justify-start"}>
                    <div className={`max-w-[75%] ${mine ? "bg-blue-50" : "bg-neutral-100"} px-3 py-2`}>
                      <div className="whitespace-pre-wrap">{item.content}</div>
                      {!mine && tokens != null && Number(tokens) > 0 ? (
                        <div className="mt-1 text-right text-xs text-neutral-400">tokens {tokens}</div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty description={models.length ? "写一条消息开始" : "请先在模型管理里启用一个模型"} />
          )}
        </div>
        <div className="border-t border-neutral-200 p-3">
          <Input.TextArea
            value={text}
            rows={3}
            maxLength={8000}
            placeholder="输入内容，Enter 发送，Shift+Enter 换行"
            onChange={event => setText(event.target.value)}
            onPressEnter={event => {
              if (!event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
          />
          <div className="mt-2 flex justify-end">
            <Button type="primary" loading={sending} onClick={send}>
              发送
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AiChat;
