import { Button, Card, Flex, Typography } from "antd";
import React, { useEffect, useState } from "react";
import type { CardProps } from "antd/es/card";
import CountUp from "react-countup";
import { GithubOutlined, LikeOutlined, MailOutlined } from "@ant-design/icons";
import Translatex from "../Translatex";
import avatar from "@/assets/user/defaultAvatar.jpg";

import styles from "./index.module.scss";

const { Text, Title } = Typography;

export interface UserCardProp extends CardProps {
  children?: React.ReactNode;
  info?: any;
  index?: number;
}

export const UserFooter: React.FC<{ name: string; count: number }> = ({ name, count }) => (
  <div className={styles.cover}>
    <Text type="secondary">{name}</Text>
    <Title style={{ margin: 0 }} level={5}>
      <CountUp end={count} start={0} duration={1.75} />
    </Title>
  </div>
);

const UserCard: React.FC<UserCardProp> = ({
  info = {
    id: 1,
    name: "User",
    description: "description",
    follwer: 0,
    mits: 0,
    total: 0,
    forbid: false
  },
  index = 1
}) => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <Translatex direction="up" run={!loading} delay={index * 100}>
      <Card
        className={`${styles.usercard} ${styles.hoverCard}`}
        cover={<div className={styles.userCardBg} />}
        actions={[
          <UserFooter name="Foloower" count={info.follwer} />,
          <UserFooter name="Folowing" count={info.mits} />,
          <UserFooter name="Total Post" count={info.total} />
        ]}>
        <div className={styles.userinfo}>
          <div className={styles.avatar}>
            <img src={avatar} className={styles.img} alt="" />
            <div className={styles.avatarbg}></div>
          </div>
          <div className={styles.info}>
            <Title style={{ margin: 0 }} level={5}>
              {info.name}
            </Title>
            <Text type="secondary">{info.description}</Text>
            <Flex style={{ marginTop: 8 }} gap={8}>
              <Button shape="circle" icon={<GithubOutlined />} />
              <Button shape="circle" icon={<MailOutlined />} />
              <Button shape="circle" icon={<LikeOutlined />} />
            </Flex>
          </div>
        </div>
      </Card>
    </Translatex>
  );
};

export default UserCard;
