import { SuspendFallbackLoading } from "@/components/Loadings";
import React, { useEffect } from "react";
import { useNavigate } from "react-router";

const NeedLogin = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/login");
  }, []);
  return <SuspendFallbackLoading />;
};

export default NeedLogin;
