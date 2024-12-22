import { useState } from "react";
import styles from "./index.module.scss";
import { useEffect } from "react";
import { Card, message } from "antd";
import MusicItem from "./musicItem";
const MusicChart = () => {
  const [musicList, setMusicList] = useState([]);

  const getMusic = () => {
    const data = [
      "信仰",
      "趁早",
      "至少还有你",
      "K歌之王",
      "龙卷风",
      "因为爱所以爱",
      "一个人的精彩",
      "开始懂了",
      "灰姑娘",
      "少女的祈祷",
      "天涯",
      "勇气",
      "重遇（不太熟）",
      "冷酷到底",
      "简单爱",
      "或者Viva",
      "蔷薇",
      "天黑黑",
      "末班车",
      "比我幸福",
      "死不了",
      "如果有一天",
      "温柔",
      "彩虹",
      "可爱女人",
      "伤心1999",
      "花花宇宙",
      "我要的幸福",
      "出卖",
      "寂寞的恋人啊（不太熟）",
      "春天花会开",
      "爱你不是两三天",
      "下沙",
      "海浪",
      "黑色幽默",
      "全日爱",
      "不如跳舞",
      "难得一见",
      "踏浪",
      "盛夏的果实",
      "月光爱人",
      "故乡",
      "我",
      "还是会寂寞",
      "伊斯坦堡",
      "越夜越有机",
      "分飞",
      "超快感",
      "动起来",
      "龙的传人",
      "真情人",
      "无愧于心",
      "只要有你",
      "我欲成仙（不太熟悉）",
      "相思",
      "好春光（不太熟悉）",
      "飘摇",
      "一个人生活",
      "我要找到你",
      "你爱我像谁",
      "那么骄傲",
      "笑忘书",
      "太委屈",
      "美丽世界的孤儿",
      "我这个你不爱的人",
      "女人的选择",
      "到不了",
      "男人哭吧不是罪",
      "后来",
      "黄昏",
      "浪花一朵朵",
      "眉飞色舞",
      "星晴",
      "我欲成仙",
      "通天大道宽又阔",
      "好春光",
      "越来越好",
      "兄弟",
      "流着泪的你的脸",
      "活着VIVA",
      "反方向的钟",
      "花火",
      "一辈子一场梦",
      "橘子香水",
      "单眼皮女生",
      "大家一起来",
      "不值得",
      "祝君好",
      "十指紧扣",
      "离家的孩子",
      "寂寞的恋人啊",
      "卷睫盼",
      "小雪",
      "那一年",
      "当我遇上你",
      "花样年华",
      "爱我你怕了吗",
      "游乐场",
      "天仙子",
      "家和万事兴",
      "再见中国海",
      "晚婚",
      "假如真的再有约会",
      "苍狼大地",
      "会过去的",
      "立秋",
      "心酸的浪漫",
      "你是幸福的我是快乐的",
      "八百里洞庭我的家",
      "太平",
      "乱了",
      "冰河",
      "坦白",
      "温柔--五月天",
      "281公里",
      "Na Na Na",
      "新年快乐",
      "醉凡尘",
      "当阳光变冷",
      "我的名字",
      "放爱一条生路",
      "天使也一样",
      "我都在乎",
      "或者AIVA",
      "怎么Happy",
      "走走走",
      "永远到底有多远",
      "相思--毛阿敏",
      "爱在2000",
      "团员",
      "独家试唱",
      "HAPPY2000",
      "爱不后悔",
      "Ti Amo",
      "第三天",
      "值得一辈子去爱",
      "我不后悔",
      "爱我，你怕了吗",
      "好想好好爱你",
      "相遇太早",
      "你不会了解",
      "天凉好个秋",
      "给自己的情书",
      "我不够爱你",
      "呢喃",
      "一条龙",
      "流着的泪你的脸",
      "活着"
    ];
    const dataSource = data.map(v => {
      return {
        name: v,
        year: 2000,
        singer: "",
        src: ""
      };
    });

    const list = [
      {
        year: "2000",
        dataSource: dataSource
      }
    ];
    setMusicList(list);
  };

  useEffect(() => {
    getMusic();
  }, []);

  const onClick = (item, source) => {
    const title = `播放 ${item.name}, 这是来自 ${source.year} 年发表的 `;
    message.success(title);
  };
  const gridStyle = {
    width: "20%",
    textAlign: "center"
  };

  return (
    <div className={styles.MusicChart}>
      <h1>音乐排行榜</h1>
      <h2>目前的思路就是做一个2000-2015年的 music 排行榜</h2>
      <h2>平均每段 music 只有 10s ，仅展示有特点的那段。</h2>
      <h3>每个歌曲都要加上演唱者、歌词、点赞统计、月度排行(来自哪个平台排行统计呢)、年度排行(来自哪个平台排行统计呢)</h3>
      {musicList.map((music, index) => {
        return (
          <div key={index} className={styles.musicContainer}>
            <Card
              title={
                <div>
                  <h2>
                    {music.year} 年 1月 1日 一 {music.year} 年 12月 31日
                  </h2>
                </div>
              }>
              {music.dataSource.map((musicItem, k) => {
                return (
                  <Card.Grid hoverable={false} key={k} style={gridStyle} onClick={() => onClick(musicItem, music)} className={styles.musicItem}>
                    <div>
                      <MusicItem data={musicItem} />
                    </div>
                  </Card.Grid>
                );
              })}
            </Card>
          </div>
        );
      })}
    </div>
  );
};

export default MusicChart;
