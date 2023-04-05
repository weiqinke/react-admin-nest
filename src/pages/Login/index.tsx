import React from "react";
import LoginCopyright from "@/components/Footer/LoginCopyright";
import LoginForm from "@/components/Forms/LoginForm";

import styles from "./index.module.scss";

const Login = () => {
  return (
    <div className={styles.container}>
      <LoginForm />
      <LoginCopyright />
    </div>
  );
};

export default Login;
