/**
 * 个人中心
 */
import React, { FC, useEffect, useState } from "react";
import { Card, Col, Divider, Row } from "antd";
import { getmyuserinfo, updateMyinfo } from "@/api/caravan/User";
import userPoster from "@/assets/header/user-poster.png";
import MetaDesc from "./MetaDesc";
import BaseFrom from "./basefrom";
import Avatar from "@/components/Avatar";

import "./style.scss";

const { Meta } = Card;

const BaseSetting: FC = function () {
  const [initFormItem, setInitFormItem] = useState<any>({});
  const [needaxios, setNeedAxios] = useState(1);
  const pendingCallback = async (formdata: any) => {
    const result = await updateMyinfo(formdata);
    if (result.data.code === 200) {
      setNeedAxios(needaxios + 1);
    }
  };
  useEffect(() => {
    getmyuserinfo().then((result) => {
      if (result.data.code === 200) {
        setInitFormItem(result.data.data);
      }
    });
  }, [needaxios]);
  return (
    <Row>
      <Col span={24}>
        <Divider orientation="left" plain>
          个人中心
        </Divider>
      </Col>
      
      <Col span={12}>
        <BaseFrom initFormItem={initFormItem} pendingCallback={pendingCallback} />
      </Col>
      <Col span={6} offset={ 1}>
        <div className="setting-base">
          <Card style={{ width: 350 }} cover={<img alt="" src={userPoster} className="poster" />}>
            <Meta
              avatar={<Avatar src={"https://admiring-dijkstra-34cb29.netlify.app/static/media/b1.553c69e9.jpg"} size="large" />}
              description={<MetaDesc userInfo={initFormItem} />}
            />
          </Card>
        </div>
      </Col>
    </Row>
  );
};
export default BaseSetting;
