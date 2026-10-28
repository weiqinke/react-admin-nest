import { userinfo } from "@/api/microservice/user";
import avatarImg from "@/assets/user/defaultAvatar.jpg";
import AvatarData from "@/components/AvatarData";
import FineDay from "@/components/FineDay";
import StarrySky from "@/components/StarrySky";
import ProjectContext from "@/contexts/ProjectContext";
import { AntDesignOutlined, GithubOutlined, InstagramOutlined, MessageOutlined, MoreOutlined, QqOutlined, ShareAltOutlined, WechatOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Col, Divider, Flex, Image, Listy, Row, Segmented, Typography } from "antd";
import dayjs from "dayjs";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import IconFont from "../IconFont";
import styles from "./index.module.scss";

const { Text, Title } = Typography;

const SocialData = [
  {
    key: "github",
    title: (
      <Link to="https://github.com/weiqinke" target="_blank">
        weiqinke
      </Link>
    ),
    icon: <GithubOutlined style={{ fontSize: 24 }} />
  },
  {
    key: "instagram",
    title: "Instagram",
    icon: <InstagramOutlined style={{ fontSize: 24 }} />
  },
  {
    key: "wechat",
    title: "wechat",
    icon: <WechatOutlined style={{ fontSize: 24 }} />
  },
  {
    key: "qq",
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
      if (result.data.code === 0) {
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
                <Divider style={{ height: "auto" }} orientation="vertical" />
                <UserFooter name="Following" count={112}></UserFooter>
              </Flex>
            </Card>
            <Card title="关于我">
              <Text type="secondary">你爱的是春天，我爱的是秋季，我假如后退一步，你又跳一步向前，那，我们就一同住在，美丽的、热烈的夏天。</Text>
            </Card>
            <Card title="社交">
              <Listy
                items={SocialData}
                rowKey="key"
                itemRender={item => (
                  <Flex align="center" gap={16}>
                    {item.icon}
                    <Text type="secondary">{item.title}</Text>
                  </Flex>
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
                  <Flex align="center" gap={12}>
                    <Avatar src={avatarImg} size={48} />
                    <Flex vertical>
                      <Text>{info?.nick}</Text>
                      <Text type="secondary">{dayjs().format("YYYY/MM/DD")}</Text>
                    </Flex>
                  </Flex>
                  <Button shape="circle" type="text" icon={<MoreOutlined />}></Button>
                </Flex>
              }>
              <Flex gap={16} vertical>
                <Text>乱世评荐难再续，唯有荷香夜夜长。</Text>
                <Image className={styles["custom-image"]} width={"100%"} src={"https://dr.cdnux.com/18510675/i/2025/01/04/65aa5a2fa5422.webp"} />
                <Flex justify="space-between" align="content-center">
                  <Flex align="center">
                    <Button size="small" type="text">
                      <IconFont type="icon-profile" size={24} style={{ color: "#000" }} /> 3
                    </Button>
                    <Avatar.Group max={{ count: 2, style: { color: "#f56a00", backgroundColor: "#fde3cf" } }}>
                      <Avatar src="https://dr.cdnux.com/18510675/i/2025/01/04/65a29b436889b.jpg" />
                      <Avatar style={{ backgroundColor: "#f56a00" }}>K</Avatar>
                      <Avatar style={{ backgroundColor: "#2563eb" }} icon={<AntDesignOutlined />} />
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
