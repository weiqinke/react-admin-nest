import { LoadingMark } from "@/components/LoadingRing";

const SuspendFallback = () => {
  return (
    <div className="flex h-[calc(100vh-288px)] w-full items-center justify-center">
      <LoadingMark />
    </div>
  );
};

export default SuspendFallback;
