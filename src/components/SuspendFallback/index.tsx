import { Spin } from "antd";

const SuspendFallback = () => {
  return (
    <div className="h-full">
      <Spin description="加载中..." spinning>
        <div className="relative h-[calc(100vh-288px)] w-full bg-transparent">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-[32px]">正在加载中，不会太久，请稍等。</div>
        </div>
      </Spin>
    </div>
  );
};

export default SuspendFallback;
