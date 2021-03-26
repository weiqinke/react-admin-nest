/**
 * 个人中心
 */
import React, { FC, useEffect, useState } from 'react';
import './style.scss';
import { Card, Col, Divider, Row } from 'antd';
import Avatar from 'pages/commponents/avatar';
import userPoster from 'assets/header/user.webp';
import BaseFrom from './basefrom';
import { getmyuserinfo, updateMyinfo } from 'api/nest-admin/User';
import MetaDesc from './MetaDesc';

const { Meta } = Card;

const BaseSetting: FC = function() {
  const [initFormItem, setInitFormItem] = useState<any>({});
  const [needaxios, setNeedAxios] = useState(1);
  const pendingCallback = async (formdata: any) => {
    const result = await updateMyinfo(formdata);
    if (result.data.code === 200) {
      setNeedAxios(needaxios + 1);
    }
  };
  useEffect(() => {
    getmyuserinfo().then(result => {
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
      <Col sm={24} md={24} lg={6}>
        <div className="setting-base">
          <Card style={{ width: 350 }} cover={<img alt="" src={userPoster} className="poster" />}>
            <Meta
              avatar={
                <Avatar
                  src={'https://portrait.gitee.com/uploads/avatars/user/431/1295434_weiqinke_1591925291.png!avatar30'}
                  size="large"
                />
              }
              title={'月野兔'}
              description={<MetaDesc userInfo={initFormItem} />}
            />
          </Card>
        </div>
      </Col>
      <Col offset={1} sm={23} md={23} lg={10}>
        <BaseFrom initFormItem={initFormItem} pendingCallback={pendingCallback} />
      </Col>
    </Row>
  );
};
export default BaseSetting;
