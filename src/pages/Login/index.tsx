import Copyright from "@/components/Footer/Copyright";
import LoginForm from "@/components/Forms/LoginForm";
import RegisterForm from "@/components/Forms/RegisterForm";
import { useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Snowflake from "./snowflake";
import styles from "./index.module.scss";
import Owl from "@/components/Owl";

const Login = () => {
  const [register, setRegister] = useState(0);
  const onClick = () => setRegister(v => v + 1);
  const [random] = useState(Math.random());
  const [closeEyes, setCloseEyes] = useState(false);

  const bg = random < 0.45 ? "https://www.freeimg.cn/i/2024/01/13/65a28bad6be9e.jpg" : "https://www.freeimg.cn/i/2024/12/18/6762e71092b9c.webp";
  return (
    <div className={styles.container} style={{ backgroundImage: `url(${bg})` }}>
      <div className={styles.fromContainer}>
        <div>
          <Owl closeEyes={closeEyes} />
        </div>
        <TransitionGroup>
          <CSSTransition key={register} timeout={100} classNames="loginfade">
            {register % 2 ? <RegisterForm goBack={() => setRegister(0)} setCloseEyes={setCloseEyes} /> : <LoginForm setRegister={onClick} setCloseEyes={setCloseEyes} />}
          </CSSTransition>
        </TransitionGroup>
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
