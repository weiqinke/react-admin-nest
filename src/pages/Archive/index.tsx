import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./index.module.scss";

type Section = "home" | "updates" | "research" | "shelf" | "fragments" | "about" | "map";
type CoverKind = "foucault" | "first" | "signal" | "sapiens";

type Post = {
  id: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  tags: string[];
  kind: "circuit" | "wave" | "notes";
  body: string[];
};

type Book = {
  id: string;
  title: string;
  author: string;
  status: string;
  cover: CoverKind;
  note: string;
};

type MapNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  place?: "left" | "right" | "top" | "bottom";
  hub?: boolean;
  blurb?: string;
};

const NAV: { id: Section; label: string }[] = [
  { id: "home", label: "首页" },
  { id: "research", label: "业界" },
  { id: "shelf", label: "事务" },
  { id: "fragments", label: "提交" },
  { id: "about", label: "关于" }
];

const POSTS: Post[] = [
  {
    id: "mistral-large-4",
    date: "10.29",
    category: "开源",
    title: "Mistral 公开 Large 4 的权重",
    excerpt: "Mistral Large 4 是约一万亿参数的多模态混合专家模型，上下文一百万 token。Mistral 称它是目前最强的开源权重编程模型。",
    tags: ["Mistral", "开源"],
    kind: "notes",
    body: [
      "10 月 29 日，Mistral 放出了改进后的 Mistral Large 4（Le Chonk）权重。它是多模态混合专家模型，总参数大约一万亿，上下文一百万 token，许可是 Mistral Ecosystem Open-Weight License。",
      "Mistral 自己把它称作目前最好的开源权重编程模型。这个判断来自发布方，还没有看成独立复现的结果。"
    ]
  },
  {
    id: "gemini-4-carbon",
    date: "10.28",
    category: "模型",
    title: "Gemini 4 Carbon 先给安全团队",
    excerpt: "Google 公布 Gemini 4 Carbon，先提供给一部分网络安全团队。开发者和公众什么时候能用，还没有日期。",
    tags: ["Google", "Gemini"],
    kind: "circuit",
    body: [
      "10 月 28 日，Google DeepMind 公布 Gemini 4 Carbon，距离 Gemini 4 Argon 大约两周。Google 说它更偏向网络安全和长程任务，并先给一部分安全防守团队使用。",
      "Artificial Analysis 的情报指数把它排在前面。模型还没有公开，多数人现在用不上。开发者、企业和消费者的开放时间，Google 只说了即将到来。"
    ]
  },
  {
    id: "genie-4",
    date: "10.27",
    category: "模型",
    title: "Genie 4 开始给受邀测试者",
    excerpt: "DeepMind 的世界模型 Genie 4 可以按自然语言改场景，并带原生音频。目前先给受邀测试者，接口还没放开。",
    tags: ["DeepMind", "世界模型"],
    kind: "wave",
    body: [
      "10 月 27 日，Google DeepMind 公布世界模型 Genie 4。场景可以按自然语言调整，生成时带原生音频，包括环境声和对话。",
      "它先给受邀测试者。Google AI Ultra 和 Gemini API 的早期入口还在后面，没有公开日期。"
    ]
  },
  {
    id: "gpt-6-1-terra",
    date: "10.26",
    category: "模型",
    title: "OpenAI 发布 GPT-6.1 Terra",
    excerpt: "Terra 按每百万 token 输入 1 美元、输出 5 美元计价，上下文约一百万。已进入 ChatGPT Work、Codex 和 API。",
    tags: ["OpenAI", "GPT"],
    kind: "circuit",
    body: [
      "10 月 26 日，OpenAI 发布 GPT-6.1 Terra。公开价格是每百万 token 输入 1 美元、输出 5 美元，上下文大约 105 万，用于计算机操作和视觉推理。",
      "它已经出现在 ChatGPT Work、Codex 和 API 里。发布时给出的评测数字是 OpenAI 自己的结果，还没有独立复现。"
    ]
  }
];

const BOOKS: Book[] = [
  {
    id: "tickets",
    title: "我的工单",
    author: "2 条未关闭",
    status: "处理中",
    cover: "foucault",
    note: "一条待分派，一条已经超过预计完成时间。"
  },
  {
    id: "placard",
    title: "必读公告",
    author: "1 条待确认",
    status: "未读",
    cover: "first",
    note: "确认之前，其他页面不会放行。"
  },
  {
    id: "changelog",
    title: "变更日志",
    author: "版本 3.0.0",
    status: "已发布",
    cover: "signal",
    note: "这一版把菜单改成按授权下发。"
  },
  {
    id: "ai",
    title: "AI 对话",
    author: "需 ai:use",
    status: "可用",
    cover: "sapiens",
    note: "模型已经启用。没有该权限时，这一项不会出现。"
  }
];

const COMMITS: { hash: string; date: string; type: string; subject: string }[] = [
  { hash: "f5ec4b2", date: "10.31", type: "feat", subject: "让工作台展示个人事项，汇总数字留在数据看板" },
  { hash: "2d86ec0", date: "10.31", type: "docs", subject: "将版本号升级到 3.0.0" },
  { hash: "8ad7b43", date: "10.31", type: "style", subject: "用 Prettier 对齐 README 表格，通过 CI 格式检查" },
  { hash: "33b57e5", date: "10.31", type: "docs", subject: "将中英文 README 对齐当前管理端能力" },
  { hash: "5d98b0c", date: "10.31", type: "feat", subject: "适配配置回滚、公告催办、工单流转和消息置顶" },
  { hash: "4710af4", date: "10.31", type: "style", subject: "用 Prettier 修复 CI 格式检查失败的文件" },
  { hash: "f9368de", date: "10.31", type: "feat", subject: "适配变更日志、通知偏好、LDAP/OIDC 与登录态" },
  { hash: "a75d8a1", date: "10.31", type: "perf", subject: "拆分 ECharts 图种，减少后台重复请求" }
];

const MAP_NODES: MapNode[] = [
  { id: "hub", label: "账号与权限", x: 50, y: 46, hub: true },
  { id: "auth", label: "鉴权", x: 24, y: 30, place: "left", blurb: "登录、会话和二次确认都从这里进入。" },
  { id: "org", label: "组织", x: 40, y: 16, place: "top", blurb: "部门和岗位决定数据能看到哪一层。" },
  { id: "placard", label: "公告", x: 74, y: 14, place: "top", blurb: "必读公告会挡在其他操作前面。" },
  { id: "mail", label: "站内信", x: 82, y: 30, place: "left", blurb: "通知、消息和待办收在同一处。" },
  { id: "ticket", label: "工单", x: 84, y: 52, place: "left", blurb: "提交、分派和关闭都留在事务里。" },
  { id: "audit", label: "审计", x: 72, y: 74, place: "bottom", blurb: "写操作按数据范围留下记录。" },
  { id: "ops", label: "运维", x: 50, y: 80, place: "bottom", blurb: "参数、任务、Webhook 和功能开关。" },
  { id: "ai", label: "AI", x: 28, y: 72, place: "left", blurb: "只有拿到 ai:use 的账号能发起对话。" },
  { id: "menu", label: "菜单", x: 14, y: 50, place: "right", blurb: "侧栏只出现你被授予的那一部分。" }
];

function includes(text: string, query: string) {
  return text.toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

function currentNav(section: Section) {
  if (section === "research" || section === "shelf" || section === "fragments" || section === "about") return section;
  return "home";
}

function IconFrame({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

function Compass({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <path d="M16 4.2 18.1 16 16 13.4 13.9 16Z" fill="currentColor" />
      <path d="M16 27.8 13.9 16 16 18.6 18.1 16Z" fill="none" stroke="currentColor" strokeWidth="0.8" />
      <path d="M4.2 16h4.2M23.6 16H27.8M16 8.2V11M16 21v2.8" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="16" cy="16" r="1.3" fill="currentColor" />
    </svg>
  );
}

function Orbit() {
  return (
    <svg className={styles.orbit} viewBox="0 0 440 300" aria-hidden="true">
      <g fill="none" stroke="#d4c8b4" strokeWidth="0.8">
        <circle cx="268" cy="150" r="22" />
        <circle cx="268" cy="150" r="48" />
        <circle cx="268" cy="150" r="78" />
        <circle cx="268" cy="150" r="112" />
        <ellipse cx="268" cy="150" rx="146" ry="58" transform="rotate(-22 268 150)" />
        <ellipse cx="268" cy="150" rx="146" ry="58" transform="rotate(30 268 150)" />
        <path d="M268 28v244M150 150h236" stroke="#e3d9c8" />
      </g>
      <g fill="#c4b79e">
        <circle cx="268" cy="72" r="2.3" />
        <circle cx="344" cy="112" r="2.3" />
        <circle cx="338" cy="206" r="2.2" />
        <circle cx="196" cy="206" r="2.2" />
        <circle cx="190" cy="104" r="2.2" />
        <circle cx="380" cy="150" r="1.7" />
        <circle cx="156" cy="150" r="1.7" />
      </g>
      <g transform="translate(246 128)" stroke="#b7aa94" fill="none" strokeWidth="0.8">
        <circle cx="22" cy="22" r="20" />
        <path d="M22 4.5 24.6 22 22 17.2 19.4 22Z" fill="#b7aa94" stroke="none" />
        <path d="M22 39.5 19.4 22 22 26.8 24.6 22Z" />
        <path d="M5 22h5.5M33.5 22H39M22 10v3.2M22 30.8V34" />
        <circle cx="22" cy="22" r="1.5" fill="#b7aa94" stroke="none" />
      </g>
    </svg>
  );
}

function Thumb({ kind }: { kind: Post["kind"] }) {
  return (
    <svg className={styles.thumb} viewBox="0 0 160 108" aria-hidden="true">
      <g fill="none" stroke="#b7ad9b" strokeWidth="1.2">
        {kind === "circuit" ? (
          <>
            <rect x="18" y="30" width="34" height="22" />
            <rect x="74" y="24" width="30" height="34" />
            <rect x="122" y="36" width="22" height="16" />
            <path d="M52 41h22M104 41h18M35 52v28h96V52" />
            <circle cx="35" cy="41" r="2" fill="#b7ad9b" stroke="none" />
          </>
        ) : null}
        {kind === "wave" ? (
          <>
            <path d="M8 54c18 0 18-30 36-30s18 60 36 60 18-44 36-44 18 28 36 28" />
            <path d="M8 54h148" strokeDasharray="2 3" />
          </>
        ) : null}
        {kind === "notes" ? (
          <>
            <path d="M28 24h104M28 40h92M28 56h104M28 72h70" />
            <path d="M22 18v74" />
          </>
        ) : null}
      </g>
    </svg>
  );
}

function Cover({ kind, title }: { kind: CoverKind; title: string }) {
  const coverClass = {
    foucault: styles.coverFoucault,
    first: styles.coverFirst,
    signal: styles.coverSignal,
    sapiens: styles.coverSapiens
  }[kind];
  return (
    <span className={`${styles.cover} ${coverClass}`}>
      <svg className={styles.coverArt} viewBox="0 0 96 132" aria-hidden="true">
        {kind === "foucault" ? (
          <g fill="none" stroke="#c9c2b4" strokeWidth="0.9">
            <rect x="28" y="28" width="40" height="52" />
            <path d="M36 42h24M36 52h24M36 62h16" />
          </g>
        ) : null}
        {kind === "first" ? (
          <g fill="none" stroke="#8d6a45" strokeWidth="0.9">
            <path d="M30 36h36M30 48h36M30 60h28M30 72h32" />
            <circle cx="68" cy="28" r="4" />
          </g>
        ) : null}
        {kind === "signal" ? (
          <g fill="none" stroke="#f3f1ea" strokeWidth="0.9">
            <path d="M30 40h36M30 52h28M30 64h32" />
            <path d="M26 28h44v58H26z" />
          </g>
        ) : null}
        {kind === "sapiens" ? (
          <g fill="none" stroke="#a24b3a" strokeWidth="0.9">
            <circle cx="40" cy="48" r="10" />
            <circle cx="58" cy="56" r="10" />
            <path d="M46 44c4 4 8 8 8 8" />
          </g>
        ) : null}
      </svg>
      <span className={styles.coverLabel}>{title}</span>
    </span>
  );
}

function KnowledgeMap({ tall = false }: { tall?: boolean }) {
  return (
    <div className={tall ? styles.mapStageTall : styles.mapStage}>
      <svg className={styles.watermark} viewBox="0 0 400 320" aria-hidden="true">
        <g fill="none" stroke="#e4ddd2" strokeWidth="1">
          <path d="M36 36h150v96h170v130H36Z" />
          <path d="M186 36v96H78v78h108" />
          <path d="M78 78h86M250 176h92M250 204h70" />
          <circle cx="300" cy="78" r="16" />
        </g>
      </svg>
      <svg className={styles.mapLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {MAP_NODES.filter(node => !node.hub).map(node => (
          <line key={node.id} x1="50" y1="46" x2={node.x} y2={node.y} />
        ))}
      </svg>
      {MAP_NODES.map(node =>
        node.hub ? (
          <div key={node.id} className={styles.hub} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            {node.label}
          </div>
        ) : (
          <div key={node.id} className={styles.node} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            <span className={styles.dot} />
            <span className={styles.nodeLabel} data-place={node.place || "right"}>
              {node.label}
            </span>
          </div>
        )
      )}
      <p className={styles.mapCaption}>… 相关模块</p>
    </div>
  );
}

function PostList({ items, onOpen }: { items: Post[]; onOpen: (id: string) => void }) {
  return (
    <div>
      {items.map(post => (
        <button key={post.id} type="button" className={styles.post} onClick={() => onOpen(post.id)}>
          <span>
            <span className={styles.metaDate}>{post.date}</span>
            <span className={styles.metaCat}>{post.category}</span>
          </span>
          <Thumb kind={post.kind} />
          <span>
            <span className={styles.postTitle}>{post.title}</span>
            <span className={styles.excerpt}>{post.excerpt}</span>
            <span className={styles.tags}>
              {post.tags.map(tag => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function BookGrid({ items, onOpen }: { items: Book[]; onOpen: (id: string) => void }) {
  return (
    <div className={styles.books}>
      {items.map(book => (
        <button key={book.id} type="button" className={styles.book} onClick={() => onOpen(book.id)}>
          <Cover kind={book.cover} title={book.title} />
          <span className={styles.bookTitle}>{book.title}</span>
          <span className={styles.bookAuthor}>{book.author}</span>
          <span className={styles.badge}>{book.status}</span>
        </button>
      ))}
    </div>
  );
}

export default function ArchivePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [section, setSection] = useState<Section>("home");
  const [postId, setPostId] = useState<string | null>(null);
  const [bookId, setBookId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [clockOpen, setClockOpen] = useState(false);
  const [footNote, setFootNote] = useState("");

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSearchOpen(false);
      setQuery("");
      setClockOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scrollTop = () => pageRef.current?.scrollTo({ top: 0 });

  const go = (next: Section) => {
    setSection(next);
    setPostId(null);
    setBookId(null);
    setQuery("");
    setSearchOpen(false);
    setClockOpen(false);
    setFootNote("");
    scrollTop();
  };

  const openPost = (id: string) => {
    setPostId(id);
    setBookId(null);
    setQuery("");
    setSearchOpen(false);
    setClockOpen(false);
    scrollTop();
  };

  const openBook = (id: string) => {
    setSection("shelf");
    setBookId(id);
    setPostId(null);
    setQuery("");
    setSearchOpen(false);
    setClockOpen(false);
    scrollTop();
  };

  const active = currentNav(section);
  const needle = query.trim();
  const post = POSTS.find(item => item.id === postId);
  const book = BOOKS.find(item => item.id === bookId);

  const renderResults = () => {
    const posts = POSTS.filter(item => includes([item.title, item.excerpt, item.category, ...item.tags].join(" "), needle));
    const books = BOOKS.filter(item => includes([item.title, item.author, item.status].join(" "), needle));
    const fragments = COMMITS.filter(item => includes([item.hash, item.subject, item.type].join(" "), needle));
    const total = posts.length + books.length + fragments.length;
    if (!total) return <p className={styles.empty}>没有找到相关记录。</p>;
    return (
      <div className={styles.sub}>
        <h1 className={styles.subTitle}>搜索</h1>
        <p className={styles.lede}>{total} 条记录</p>
        {posts.length ? (
          <>
            <h2 className={styles.resultLabel}>业界</h2>
            <PostList items={posts} onOpen={openPost} />
          </>
        ) : null}
        {books.length ? (
          <>
            <h2 className={styles.resultLabel}>事务</h2>
            <BookGrid items={books} onOpen={openBook} />
          </>
        ) : null}
        {fragments.length ? (
          <>
            <h2 className={styles.resultLabel}>提交</h2>
            {fragments.map(item => (
              <button key={item.hash} type="button" className={styles.frag} onClick={() => go("fragments")}>
                <span className={styles.fragText}>{item.subject}</span>
                <span className={styles.fragNote}>
                  {item.date} {item.hash} {item.type}
                </span>
              </button>
            ))}
          </>
        ) : null}
      </div>
    );
  };

  const renderBody = () => {
    if (needle) return renderResults();
    if (post) {
      return (
        <article className={styles.article}>
          <button type="button" className={styles.back} onClick={() => setPostId(null)}>
            返回
          </button>
          <p className={styles.kicker}>
            <span>{post.date}</span>
            <span>{post.category}</span>
          </p>
          <h1 className={styles.articleTitle}>{post.title}</h1>
          {post.body.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <span className={styles.tags}>
            {post.tags.map(tag => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </span>
        </article>
      );
    }
    if (book) {
      return (
        <div className={styles.sub}>
          <button type="button" className={styles.back} onClick={() => setBookId(null)}>
            返回事务
          </button>
          <div className={styles.bookDetail}>
            <Cover kind={book.cover} title={book.title} />
            <div className={styles.bookCopy}>
              <h1 className={styles.bookTitle}>{book.title}</h1>
              <span className={styles.bookAuthor}>{book.author}</span>
              <span className={styles.badge}>{book.status}</span>
              <p>{book.note}</p>
            </div>
          </div>
        </div>
      );
    }
    if (section === "home") {
      return (
        <>
          <section className={styles.hero}>
            <div className={styles.intro}>
              <h1 className={styles.heroTitle}>这里记录系统如何运行。</h1>
              <p className={styles.manifesto}>
                不从菜单开始。
                <br />
                先看清谁在用、什么变了、
                <br />
                哪些事务还开着。
              </p>
              <div className={styles.rule} />
            </div>
            <div className={styles.doingCol}>
              <div className={styles.doing}>
                <div className={styles.doingHead}>
                  <h2 className={styles.doingTitle}>最近提交</h2>
                  <span className={styles.doingTime}>截至 10.31</span>
                </div>
                <div className={styles.doingList}>
                  {COMMITS.slice(0, 4).map(item => (
                    <button key={item.hash} type="button" className={styles.doingRow} onClick={() => go("fragments")}>
                      <span className={styles.commitHash}>{item.hash}</span>
                      <span className={styles.commitSubject}>{item.subject}</span>
                    </button>
                  ))}
                </div>
                <div className={styles.doingFoot}>
                  <button type="button" className={styles.more} onClick={() => go("fragments")}>
                    查看全部 →
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.orbitCol}>
              <Orbit />
            </div>
          </section>
          <section className={styles.split}>
            <div className={styles.updates}>
              <div className={styles.sectionHead}>
                <h2>业界动态</h2>
                <button type="button" className={styles.more} onClick={() => go("research")}>
                  查看全部 →
                </button>
              </div>
              <PostList items={POSTS.slice(0, 3)} onOpen={openPost} />
            </div>
            <div className={styles.mapWrap}>
              <div className={styles.sectionHead}>
                <h2>系统结构</h2>
                <button type="button" className={styles.more} onClick={() => go("map")}>
                  查看全部 →
                </button>
              </div>
              <KnowledgeMap />
            </div>
          </section>
          <section className={styles.bottom}>
            <div className={styles.shelf}>
              <div className={styles.sectionHead}>
                <h2>进行中</h2>
                <button type="button" className={styles.more} onClick={() => go("shelf")}>
                  查看全部 →
                </button>
              </div>
              <BookGrid items={BOOKS} onOpen={openBook} />
            </div>
            <div className={styles.about}>
              <div className={styles.aboutText}>
                <h2 className={styles.serif}>关于本站</h2>
                <p className={styles.aboutLead}>
                  Nest Admin 管理账号、权限、组织和事务。
                  <br />
                  侧栏只出现你被授予的菜单。
                </p>
                <button type="button" className={styles.more} onClick={() => go("about")}>
                  进入工作台 →
                </button>
              </div>
              <svg className={styles.aboutSketch} viewBox="0 0 260 200" aria-hidden="true">
                <g fill="none" stroke="#ddd4c6" strokeWidth="1.1" strokeLinejoin="round">
                  <path d="M18 156h224" />
                  <path d="M34 156V118h86v38" />
                  <path d="M48 118V94h58v24" />
                  <path d="M68 94V74h22v20" />
                  <circle cx="176" cy="118" r="24" />
                  <ellipse cx="176" cy="118" rx="10" ry="24" />
                  <path d="M152 118h48M176 94v48" />
                  <path d="M204 156V96h28v60" />
                  <path d="M210 108h16M210 120h16M210 132h16" />
                  <path d="M28 70H14v86M14 86h14" />
                </g>
              </svg>
            </div>
          </section>
        </>
      );
    }

    return (
      <section className={styles.sub}>
        {section === "updates" || section === "research" ? (
          <>
            <h1 className={styles.subTitle}>业界动态</h1>
            <p className={styles.lede}>10 月 26 日到 29 日已经公开的模型变动。</p>
            <PostList items={POSTS} onOpen={openPost} />
          </>
        ) : null}
        {section === "shelf" ? (
          <>
            <h1 className={styles.subTitle}>事务</h1>
            <p className={styles.lede}>还开着的事。没有权限的那一项不会出现。</p>
            <BookGrid items={BOOKS} onOpen={openBook} />
          </>
        ) : null}
        {section === "fragments" ? (
          <>
            <h1 className={styles.subTitle}>最近提交</h1>
            <p className={styles.lede}>本仓库最近 8 次提交，都落在 10 月 31 日。</p>
            {COMMITS.map(item => (
              <div key={item.hash} className={styles.frag}>
                <span className={styles.fragText}>{item.subject}</span>
                <span className={styles.fragNote}>
                  {item.date} {item.hash} {item.type}
                </span>
              </div>
            ))}
          </>
        ) : null}
        {section === "about" ? (
          <>
            <h1 className={styles.subTitle}>关于</h1>
            <p className={styles.lede}>Nest Admin 管理账号、权限、组织和事务。</p>
            <div className={styles.prose}>
              <p>菜单来自当前账号的授权。没有授予的功能，不会出现在侧栏里。</p>
              <p>变更、工单和公告留在这页，是为了先看见系统此刻的状态。</p>
            </div>
          </>
        ) : null}
        {section === "map" ? (
          <>
            <h1 className={styles.subTitle}>系统结构</h1>
            <p className={styles.lede}>以账号与权限为中心，记下旁边这些模块怎么接上。</p>
            <KnowledgeMap tall />
            <ul className={styles.linkList}>
              {MAP_NODES.filter(node => !node.hub).map(node => (
                <li key={node.id}>
                  <span className={styles.linkName}>{node.label}</span>
                  <span className={styles.linkBlurb}>{node.blurb}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
    );
  };

  return (
    <div className={styles.page} ref={pageRef}>
      <div className={styles.frame}>
        <header className={styles.header}>
          <button type="button" className={styles.brand} onClick={() => go("home")}>
            <Compass className={styles.mark} />
            <span>
              <span className={styles.brandName}>Nest Admin</span>
              <span className={styles.brandSub}>账号、权限与事务的运行记录</span>
            </span>
          </button>
          <nav className={styles.nav} aria-label="档案">
            {NAV.map(item => (
              <button key={item.id} type="button" className={styles.navBtn} aria-current={active === item.id ? "page" : undefined} onClick={() => go(item.id)}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className={styles.tools}>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="搜索"
              aria-expanded={searchOpen}
              onClick={() => {
                setClockOpen(false);
                setQuery("");
                setSearchOpen(open => !open);
              }}>
              <IconFrame>
                <circle cx="11" cy="11" r="6" />
                <path d="m16 16 4 4" />
              </IconFrame>
            </button>
            <button
              type="button"
              className={styles.iconBtn}
              aria-label="最近更新时间"
              aria-expanded={clockOpen}
              onClick={() => {
                setSearchOpen(false);
                setClockOpen(open => !open);
              }}>
              <IconFrame>
                <circle cx="12" cy="12" r="8" />
                <path d="M12 8v5l3 2" />
              </IconFrame>
            </button>
            {clockOpen ? (
              <div className={styles.clockPop} role="status">
                仓库最近提交于 10.31
              </div>
            ) : null}
          </div>
        </header>
        {searchOpen ? (
          <form className={styles.searchBar} role="search" onSubmit={event => event.preventDefault()}>
            <label className={styles.srOnly} htmlFor="archive-search">
              搜索记录
            </label>
            <input
              id="archive-search"
              ref={searchRef}
              className={styles.searchInput}
              value={query}
              placeholder="搜索提交、模型或事务"
              onChange={event => setQuery(event.target.value)}
            />
            <p className={styles.searchHint}>输入后在当前记录里筛选。按 Esc 关闭。</p>
          </form>
        ) : null}
        {renderBody()}
        <footer className={styles.footer}>
          <div>
            <span>© 2024 Nest Admin. All rights reserved.</span>
            {footNote ? <span className={styles.footNote}>{footNote}</span> : null}
          </div>
          <div className={styles.footLinks}>
            <button type="button" onClick={() => setFootNote("RSS 还没接上。")}>
              RSS
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={() => setFootNote("github.com/weiqinke/react-admin-nest")}>
              Github
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
