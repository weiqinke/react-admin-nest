/**
 * 个人中心
 */
import React, { FC, useEffect, useState } from "react";
import { Avatar, Card, Col, Divider, Row } from "antd";
import { getmyuserinfo, updateMyinfo } from "@/api/user";
import userPoster from "@/assets/header/user-poster.png";
import MetaDesc from "./MetaDesc";
import BaseFrom from "./basefrom";

import "./style.css";

const { Meta } = Card;

const BaseSetting: FC = function () {
  const [initFormItem, setInitFormItem] = useState<any>({});
  const [formKey, setFormKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [needaxios, setNeedAxios] = useState(1);
  const pendingCallback = async (formdata: any) => {
    const result = await updateMyinfo(formdata);
    if (result.data.code === 0) {
      setNeedAxios(needaxios + 1);
    }
  };
  useEffect(() => {
    let cancelled = false;
    getmyuserinfo()
      .then(result => {
        if (cancelled) return;
        if (result.data.code === 0) {
          setInitFormItem(result.data.data);
          setFormKey(value => value + 1);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [needaxios]);
  return (
    <Row>
      <Col span={24}>
        <Divider titlePlacement="left" plain>
          个人中心
        </Divider>
      </Col>

      <Col span={12}>{loaded ? <BaseFrom key={formKey} initFormItem={initFormItem} pendingCallback={pendingCallback} /> : null}</Col>
      <Col span={6} offset={1}>
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
