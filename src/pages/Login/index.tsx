import Copyright from "@/components/Footer/Copyright";
import LoginForm from "@/components/Forms/LoginForm";
import RegisterForm from "@/components/Forms/RegisterForm";
import { useState } from "react";
import Snowflake from "./snowflake";
import styles from "./index.module.scss";
import Owl from "@/components/Owl";

const Login = () => {
  const [register, setRegister] = useState(0);
  const onClick = () => setRegister(v => v + 1);
  const [random] = useState(Math.random());
  const [closeEyes, setCloseEyes] = useState(false);
  const bg = random < 0.45 ? "https://dr.cdnux.com/18510675/i/2025/01/04/65a28bad6be9e.jpg" : "https://dr.cdnux.com/18510675/i/2024/12/31/7xt4r.webp";
  return (
    <div className={styles.container} style={{ backgroundImage: `url(${bg})` }}>
      <div className={styles.fromContainer}>
        <div>
          <Owl closeEyes={closeEyes} />
        </div>
        <div>
          {register % 2 ? <RegisterForm goBack={() => setRegister(0)} setCloseEyes={setCloseEyes} /> : <LoginForm setRegister={onClick} setCloseEyes={setCloseEyes} />}
        </div>
      </div>
      <div className={styles.cr}>
        <Copyright />
      </div>
      <div className={styles.Snowflakecontainer}>
        <Snowflake rdm={random} />
      </div>
    </div>
  );
};

export default Login;
