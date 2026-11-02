import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router";
import "./index.scss";

const NICK = "在人群中等待";
const MUSIC_TITLE = "清明雨上 - 许嵩";

type Skin = "" | "skin-hei" | "skin-jun";

type Mood = {
  id: number;
  body: string;
  time: string;
  likes: number;
  comments: number;
  forwards: number;
};

type GuestbookItem = {
  id: number;
  av: string;
  name: string;
  time: string;
  text: string;
};

const INITIAL_MOODS: Mood[] = [
  {
    id: 1,
    body: "刚打完一局CF，残局1V3反杀！兄弟们谁懂这种感觉！！[强][强] 今晚继续开黑，缺狙缺雷来密。",
    time: "2008-11-02 22:18",
    likes: 256,
    comments: 48,
    forwards: 15
  },
  {
    id: 2,
    body: "耳机循环许嵩《清明雨上》——「窗半开，窗外芭蕉新绿」 雨天最适合听这首。[音乐]",
    time: "2008-11-01 23:45",
    likes: 132,
    comments: 27,
    forwards: 8
  },
  {
    id: 3,
    body: "下午篮球赛班队赢了！最后三秒压哨上篮，全场炸了。[得意] 明天继续练投篮，目标校队。",
    time: "2008-10-28 18:02",
    likes: 389,
    comments: 76,
    forwards: 22
  },
  {
    id: 4,
    body: "新皮肤换成酷蓝了，低调有内涵。兄弟们觉得怎么样？顶一下～[酷]",
    time: "2008-10-20 20:11",
    likes: 201,
    comments: 41,
    forwards: 11
  },
  {
    id: 5,
    body: "半夜还在刷DNF。装备差一点就能过深渊了…父母喊睡觉我装听不见。[睡觉] 男人就要拼。",
    time: "2008-10-15 03:06",
    likes: 477,
    comments: 93,
    forwards: 38
  }
];

const INITIAL_GB: GuestbookItem[] = [
  { id: 1, av: "🔫", name: "CF丶狙神", time: "2008-11-02 21:50", text: "沙发！！晚上开黑记得叫我，缺C位[强]" },
  { id: 2, av: "🏀", name: "篮球少年K", time: "2008-11-02 20:33", text: "板凳～上周那球绝了兄弟，下周再约球场" },
  { id: 3, av: "★", name: "★寂寞ゝ烟花", time: "2008-11-01 19:12", text: "空间挺酷的，皮肤换得有品味。加个好友？" },
  { id: 4, av: "♠", name: "↘黑色曼陀罗", time: "2008-10-30 22:08", text: "DNF一起刷深渊啊，我出无色装备了[酷]" },
  { id: 5, av: "✦", name: "夜行孤狼", time: "2008-10-28 16:40", text: "地板！第一次来踩，签名有感觉。常联系" },
  { id: 6, av: "♪", name: "听风的人", time: "2008-10-25 12:01", text: "清明雨上单曲循环中！许嵩粉路过顶一个+10086" }
];

const ALBUMS = [
  { label: "CF残局", cls: "album-cf" },
  { label: "DNF深渊", cls: "album-dnf" },
  { label: "跑跑漂移", cls: "album-kart" },
  { label: "CF爆破", cls: "album-cf2" },
  { label: "DNF天空之城", cls: "album-dnf2" },
  { label: "跑跑卡丁车", cls: "album-kart2" }
];

const GB_AVATARS = ["🔫", "🏀", "★", "♠", "✦", "♪", "☆", "⚡", "◆", "🎮"];

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function formatNow() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

const QqZone = () => {
  const [skin, setSkin] = useState<Skin>("");
  const [moods, setMoods] = useState(INITIAL_MOODS);
  const [guestbook, setGuestbook] = useState(INITIAL_GB);
  const [gbNick, setGbNick] = useState("路过の陌生人");
  const [gbText, setGbText] = useState("");
  const [playing, setPlaying] = useState(false);
  const [musicMin, setMusicMin] = useState(false);
  const [visitNum] = useState(() => 128560 + Math.floor(Math.random() * 3) + 1);
  const [petals, setPetals] = useState<{ id: number; glyph: string; left: string; size: string; dur: string; delay: string }[]>([]);

  const glyphs = useMemo(() => {
    if (skin === "skin-hei") return ["★", "✦", "✧", "♠", "◆"];
    if (skin === "skin-jun") return ["★", "▲", "◆", "✦", "✚"];
    return ["★", "✦", "◆", "⚡", "♠"];
  }, [skin]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let id = 0;
    const spawn = () => {
      const next = {
        id: ++id,
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)],
        left: `${Math.random() * 100}vw`,
        size: `${10 + Math.random() * 14}px`,
        dur: `${6 + Math.random() * 10}s`,
        delay: `${Math.random() * 2}s`
      };
      setPetals(prev => [...prev.slice(-24), next]);
      window.setTimeout(() => {
        setPetals(prev => prev.filter(p => p.id !== next.id));
      }, 18000);
    };

    const starters = Array.from({ length: 18 }, (_, i) => window.setTimeout(spawn, i * 400));
    const timer = window.setInterval(spawn, 900);
    return () => {
      starters.forEach(clearTimeout);
      clearInterval(timer);
    };
  }, [glyphs]);

  const onLike = (id: number) => {
    setMoods(prev => prev.map(m => (m.id === id ? { ...m, likes: m.likes + 1 } : m)));
  };

  const onGuestbook = (e: FormEvent) => {
    e.preventDefault();
    const text = gbText.trim();
    if (!text) return;
    setGuestbook(prev => [
      {
        id: Date.now(),
        av: GB_AVATARS[Math.floor(Math.random() * GB_AVATARS.length)],
        name: gbNick.trim() || "匿名访客",
        time: formatNow(),
        text
      },
      ...prev
    ]);
    setGbText("");
  };

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className={`qqzone-page ${skin}`.trim()}>
      <div className="petals" aria-hidden="true">
        {petals.map(p => (
          <span
            key={p.id}
            className="petal"
            style={{
              left: p.left,
              fontSize: p.size,
              animationDuration: p.dur,
              animationDelay: p.delay
            }}>
            {p.glyph}
          </span>
        ))}
      </div>

      <div className="wrap">
        <div className="topbar">
          <div className="brand">★ QQ空间 ★</div>
          <nav className="topnav">
            <Link to="/login">主页</Link>
            <a href="#shuoshuo">说说</a>
            <a href="#xiangce">相册</a>
            <a href="#liuyan">留言板</a>
            <a href="#shuoshuo">日志</a>
            <a href="#xiangce">分享</a>
            <Link to="/login">个人中心</Link>
          </nav>
          <div className="skins">
            <span>换肤：</span>
            {(
              [
                ["", "酷蓝"],
                ["skin-hei", "黑金"],
                ["skin-jun", "迷彩"]
              ] as const
            ).map(([value, label]) => (
              <button
                key={label}
                type="button"
                className={skin === value ? "active" : undefined}
                onClick={() => setSkin(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <header className="banner">
          <div className="nick">{NICK}</div>
          <div className="vip-row">
            <span className="vip">黄钻Lv.8</span>
            <span>空间等级 Lv.22 · 人气爆棚 · 今日心情：战斗</span>
          </div>
          <div className="sign-box">
            <div className="sign">
              ♪ 在人群中等待　｜　不求轰轰烈烈　只求平平淡淡过完一生　｜　CF / DNF / 跑跑开黑来密　｜　路过的兄弟留个言☆
            </div>
          </div>
        </header>

        <div className="layout">
          <aside>
            <div className="mod">
              <div className="mod-h">
                <span className="flash-title">☆ 主人资料 ☆</span>
              </div>
              <div className="avatar-wrap">
                <div className="avatar" title="头像">
                  <div className="face" />
                  <div className="eyes">◆◆</div>
                  <div className="mouth">—</div>
                </div>
                <div className="online">● 当前在线</div>
              </div>
              <div className="mod-b">
                <ul className="info-list">
                  <li>
                    <b>QQ：</b>95279527
                  </li>
                  <li>
                    <b>性别：</b>男
                  </li>
                  <li>
                    <b>年龄：</b>17
                  </li>
                  <li>
                    <b>星座：</b>狮子座
                  </li>
                  <li>
                    <b>现居：</b>地球·战斗区
                  </li>
                  <li>
                    <b>血型：</b>O型
                  </li>
                </ul>
              </div>
            </div>

            <div className="mod">
              <div className="mod-h">好友印象</div>
              <div className="mod-b">
                <div className="tags">
                  {["开黑大神", "篮球", "夜猫子", "听歌", "兄弟够义气", "酷", "低调", "技术流"].map(t => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mod">
              <div className="mod-h">最近访客</div>
              <div className="mod-b">
                <div style={{ lineHeight: 1.8 }}>
                  <div>
                    ◆ <a href="#liuyan">★寂寞ゝ烟花</a>{" "}
                    <span style={{ float: "right", color: "#999", fontSize: 11 }}>刚刚</span>
                  </div>
                  <div>
                    ◆ <a href="#liuyan">↘黑色曼陀罗</a>{" "}
                    <span style={{ float: "right", color: "#999", fontSize: 11 }}>3分钟前</span>
                  </div>
                  <div>
                    ◆ <a href="#liuyan">CF丶狙神</a>{" "}
                    <span style={{ float: "right", color: "#999", fontSize: 11 }}>1小时前</span>
                  </div>
                  <div>
                    ◆ <a href="#liuyan">篮球少年K</a>{" "}
                    <span style={{ float: "right", color: "#999", fontSize: 11 }}>昨天</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main>
            <div className="mod" id="shuoshuo">
              <div className="mod-h">
                <span>今日心情 / 说说</span>
                <a className="more" href="#shuoshuo">
                  更多&gt;&gt;
                </a>
              </div>
              <div className="mod-b">
                {moods.map(m => (
                  <div className="mood" key={m.id}>
                    <div className="who">{NICK}</div>
                    <div className="body">{m.body}</div>
                    <div className="meta">
                      <span>{m.time}</span>
                      <span>来自 QQ空间</span>
                      <span className="acts">
                        <button type="button" onClick={() => onLike(m.id)}>
                          赞(<b>{m.likes}</b>)
                        </button>
                        <button type="button">评论({m.comments})</button>
                        <button type="button">转发({m.forwards})</button>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mod" id="xiangce">
              <div className="mod-h">
                <span>相册 · 游戏截图</span>
                <a className="more" href="#xiangce">
                  全部相册&gt;&gt;
                </a>
              </div>
              <div className="mod-b">
                <div className="album-grid">
                  {ALBUMS.map(item => (
                    <div className={`album-item ${item.cls}`} key={item.label}>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mod" id="liuyan">
              <div className="mod-h">
                <span>留言板</span>
                <span className="more">
                  共 <b>{guestbook.length}</b> 条留言
                </span>
              </div>
              <div className="mod-b">
                <div>
                  {guestbook.map(item => (
                    <div className="gb-item" key={item.id}>
                      <div className="gb-av">{item.av}</div>
                      <div style={{ flex: 1 }}>
                        <div>
                          <span className="gb-name">{item.name}</span>
                          <span className="gb-time">{item.time}</span>
                        </div>
                        <div>{item.text}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <form className="gb-form" onSubmit={onGuestbook}>
                  <textarea
                    value={gbText}
                    onChange={e => setGbText(e.target.value)}
                    placeholder="来说两句吧…（支持纯文字，刷新后留言会消失哦）"
                    required
                  />
                  <div className="row">
                    <label>
                      昵称：
                      <input type="text" value={gbNick} onChange={e => setGbNick(e.target.value)} maxLength={16} />
                    </label>
                    <button className="btn" type="submit">
                      发表留言
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </main>

          <aside>
            <div className="mod">
              <div className="mod-h">空间人气</div>
              <div className="mod-b">
                <div className="stat-num">{visitNum}</div>
                <div className="stat-label">累计访问</div>
                <div className="stat-num" style={{ fontSize: 18 }}>
                  236
                </div>
                <div className="stat-label">今日访客</div>
              </div>
            </div>

            <div className="mod">
              <div className="mod-h">音乐盒</div>
              <div className="mod-b">
                <div className="music-title">{MUSIC_TITLE}</div>
                <div className="music-artist">正在循环播放中…</div>
                <div className="bar">
                  <div className={`fill${playing ? " playing" : ""}`} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <button className="btn" type="button" onClick={() => setPlaying(p => !p)}>
                    {playing ? "⏸ 暂停" : "▶ 播放"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mod">
              <div className="mod-h">应用</div>
              <div className="mod-b">
                <div className="apps">
                  <div className="app">
                    <span className="ico">📝</span>日志
                  </div>
                  <div className="app">
                    <span className="ico">📷</span>相册
                  </div>
                  <div className="app">
                    <span className="ico">💬</span>说说
                  </div>
                  <div className="app">
                    <span className="ico">🎁</span>礼物
                  </div>
                  <div className="app">
                    <span className="ico">🎮</span>应用
                  </div>
                  <div className="app">
                    <span className="ico">⭐</span>收藏
                  </div>
                </div>
              </div>
            </div>

            <div className="mod">
              <div className="mod-h">特别关心</div>
              <div className="mod-b" style={{ lineHeight: 1.9 }}>
                <div>
                  ★ <a href="#liuyan">CF丶狙神</a>
                </div>
                <div>
                  ★ <a href="#liuyan">篮球少年K</a>
                </div>
                <div>
                  ★ <a href="#liuyan">↘黑色曼陀罗</a>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="footer">
          <div>
            <a href="#shuoshuo">腾讯网</a> | <a href="#shuoshuo">QQ</a> | <a href="#shuoshuo">QQ空间</a> |{" "}
            <a href="#shuoshuo">隐私政策</a> |{" "}
            <a
              href="#top"
              onClick={e => {
                e.preventDefault();
                scrollTop();
              }}>
              返回顶部
            </a>
          </div>
          <div style={{ marginTop: 6 }}>Copyright © 1998 - 2008 Tencent. All Rights Reserved.　（复刻纪念页 · 非官方）</div>
          <div>粤B2-20090059-x　ICP证：粤B2-20090059</div>
        </footer>
      </div>

      <div className="music-box">
        <div className="mh">
          <span>♪ 正在播放</span>
          <button
            type="button"
            onClick={() => setMusicMin(m => !m)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--title)", fontSize: 12 }}
            title={musicMin ? "展开" : "收起"}>
            {musicMin ? "□" : "─"}
          </button>
        </div>
        {!musicMin && (
          <div className="mb">
            <div className="music-title">{MUSIC_TITLE}</div>
            <div className="music-artist">2008经典循环 · 无真实音频</div>
            <div className="bar">
              <div className={`fill${playing ? " playing" : ""}`} />
            </div>
            <div className="music-ctrls">
              <button type="button" onClick={() => setPlaying(true)}>
                ⏮
              </button>
              <button type="button" onClick={() => setPlaying(p => !p)}>
                {playing ? "⏸ 暂停" : "▶ 播放"}
              </button>
              <button type="button" onClick={() => setPlaying(true)}>
                ⏭
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QqZone;
