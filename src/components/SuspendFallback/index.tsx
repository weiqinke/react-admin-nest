const SuspendFallback = () => {
  return (
    <div className="flex h-[calc(100vh-288px)] w-full items-center justify-center">
      <div className="text-center text-[32px] text-[#5c6570]">正在加载中，不会太久，请稍等。</div>
    </div>
  );
};

export default SuspendFallback;
