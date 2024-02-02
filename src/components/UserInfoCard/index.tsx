import { userinfo } from "@/api/microservice/user";
import avatarImg from "@/assets/user/defaultAvatar.jpg";
import AvatarData from "@/components/AvatarData";
import FineDay from "@/components/FineDay";
import StarrySky from "@/components/StarrySky";
import ProjectContext from "@/contexts/ProjectContext";
import { AntDesignOutlined, GithubOutlined, InstagramOutlined, MessageOutlined, MoreOutlined, QqOutlined, ShareAltOutlined, WechatOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Col, Divider, Flex, Image, List, Row, Segmented, Typography } from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import IconFont from "../IconFont";
import styles from "./index.module.scss";

const { Text, Title } = Typography;

const SocialData = [
  {
    title: (
      <Link to="https://github.com/weiqinke" target="_blank">
        weiqinke
      </Link>
    ),
    icon: <GithubOutlined style={{ fontSize: 24 }} />
  },
  {
    title: "Instagram",
    icon: <InstagramOutlined style={{ fontSize: 24 }} />
  },
  {
    title: "wechat",
    icon: <WechatOutlined style={{ fontSize: 24 }} />
  },
  {
    title: "qq",
    icon: <QqOutlined style={{ fontSize: 24 }} />
  }
];

const UserInfoCard = () => {
  const random = Math.floor(Math.random() * 100);
  const { value }: { value: any } = useContext(ProjectContext);
  const [info, setInfo] = useState({});
  const [tabActive, setTabActive] = useState("Profile");
  useEffect(() => {
    userinfo({ uid: value?.uid }).then(result => {
      if (result.data.code === 200) {
        const profile = result.data.data.profile;
        setInfo({
          ...profile
        });
      }
    });
  }, []);

  const UserFooter: React.FC<{ name: string; count: number }> = ({ name, count }) => (
    <div className="footer">
      <Text type="secondary">{name}</Text>
      <Title style={{ margin: 0 }} level={5}>
        {count}K
      </Title>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.cover}>
        {random % 2 === 1 ? <StarrySky /> : <FineDay />}
        <AvatarData info={info} />
      </div>
      <div className={styles.segm}>
        <div className={styles.right}>
          <Segmented
            size="large"
            onChange={(k: string) => setTabActive(k)}
            value={tabActive}
            options={[
              {
                label: "Profile",
                value: "Profile",
                icon: <IconFont type="icon-profile" size={24} style={{ color: "#000" }} />
              },
              {
                label: "Followers",
                value: "Followers",
                icon: <IconFont type="icon-dianzan" size={24} style={{ color: "#000" }} />
              },
              {
                label: "Friends",
                value: "Friends",
                icon: <IconFont type="icon-friend" size={24} style={{ color: "#000" }} />
              },
              {
                label: "Gallery",
                value: "Gallery",
                icon: <IconFont type="icon-gallery" size={24} style={{ color: "#000" }} />
              }
            ]}
          />
        </div>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={8} xl={8} xxl={8}>
          <Flex gap={16} vertical>
            <Card>
              <Flex align="middle" justify="space-evenly">
                <UserFooter name="Follower" count={12}></UserFooter>
                <Divider style={{ height: "auto" }} type="vertical" />
                <UserFooter name="Following" count={112}></UserFooter>
              </Flex>
            </Card>
            <Card title="关于我">
              <Text type="secondary">你爱的是春天，我爱的是秋季，我假如后退一步，你又跳一步向前，那，我们就一同住在，美丽的、热烈的夏天。</Text>
            </Card>
            <Card title="社交">
              <List
                itemLayout="horizontal"
                dataSource={SocialData}
                renderItem={(item, index) => (
                  <List.Item key={index}>
                    <List.Item.Meta avatar={item.icon} description={item.title} />
                  </List.Item>
                )}
              />
            </Card>
          </Flex>
        </Col>
        <Col xs={24} sm={24} md={24} lg={16} xl={16} xxl={16}>
          <Flex gap={24} vertical>
            <Card
              title={
                <Flex justify={"space-between"} align="center" gap={16}>
                  <List>
                    <List.Item key="1">
                      <List.Item.Meta avatar={<Avatar src={avatarImg} size={48} />} title={info?.nick} description={dayjs().format("YYYY/MM/DD")} />
                    </List.Item>
                  </List>
                  <Button shape="circle" type="text" icon={<MoreOutlined />}></Button>
                </Flex>
              }>
              <Flex gap={16} vertical>
                <Text>乱世评荐难再续，唯有荷香夜夜长。</Text>
                <Image className={styles["custom-image"]} width={"100%"} src={"https://www.freeimg.cn/i/2024/01/19/65aa5a2fa5422.png"} />
                <Flex justify="space-between" align="content-center">
                  <Flex align="center">
                    <Button size="small" type="text">
                      <IconFont type="icon-profile" size={24} style={{ color: "#000" }} /> 3
                    </Button>
                    <Avatar.Group maxCount={2} maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}>
                      <Avatar src="https://www.freeimg.cn/i/2024/01/13/65a29b436889b.jpg" />
                      <Avatar style={{ backgroundColor: "#f56a00" }}>K</Avatar>
                      <Avatar style={{ backgroundColor: "#1677ff" }} icon={<AntDesignOutlined />} />
                    </Avatar.Group>
                  </Flex>
                  <div>
                    <Button shape="circle" type="text" icon={<MessageOutlined />}></Button>
                    <Button shape="circle" type="text" icon={<ShareAltOutlined />}></Button>
                  </div>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </Col>
      </Row>
    </div>
  );
};

export default UserInfoCard;
