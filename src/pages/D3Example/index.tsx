import Collision from "@/components/D3/Collision";
import { withErrorBoundary } from "@/components/ErrorBoundary";
import { Row, Col, Card } from "antd";
import { useLoaderData } from "react-router-dom";
import FailContainer from "../FailPage/FailContainer";

// eslint-disable-next-line react-refresh/only-export-components
const D3Example = () => {
  useLoaderData();

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="Collision" bordered={false}>
            <Collision />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Galaxy" bordered={false}></Card>
        </Col>
      </Row>
    </div>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default withErrorBoundary(D3Example, {
  fallbackRender: FailContainer
});
