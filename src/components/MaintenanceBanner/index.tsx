import { getSite } from "@/api/platform";
import { Alert } from "antd";
import { useEffect, useState } from "react";

const MaintenanceBanner = () => {
  const [info, setInfo] = useState<{ maintenance?: boolean; maintenance_message?: string; maintenance_at?: string } | null>(null);

  useEffect(() => {
    getSite()
      .then(res => {
        const data = res.data?.data || {};
        if (data.maintenance) setInfo(data);
        else setInfo(null);
      })
      .catch(() => setInfo(null));
  }, []);

  if (!info?.maintenance) return null;

  return (
    <Alert
      type="warning"
      showIcon
      banner
      title={info.maintenance_message || "系统维护中，部分写操作可能不可用"}
      description={info.maintenance_at ? `预计时间：${info.maintenance_at}` : undefined}
    />
  );
};

export default MaintenanceBanner;
