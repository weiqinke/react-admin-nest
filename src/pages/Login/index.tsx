import Copyright from "@/components/Footer/Copyright";
import LoginForm from "@/components/Forms/LoginForm";
import RegisterForm from "@/components/Forms/RegisterForm";
import { useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import styles from "./index.module.scss";

const Login = () => {
  const [register, setRegister] = useState(0);
  const onClick = () => setRegister(v => v + 1);

  return (
    <div className={styles.container}>
      <div className={styles.fromContainer}>
        <TransitionGroup>
          <CSSTransition key={register} timeout={100} classNames="loginfade">
            {register % 2 ? <RegisterForm goBack={() => setRegister(0)} /> : <LoginForm setRegister={onClick} />}
          </CSSTransition>
        </TransitionGroup>
      </div>
      <div className={styles.cr}>
        <Copyright />
      </div>
      <div className={styles.paopaocontainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
          <div className={styles.bubble} key={item} />
        ))}
      </div>
    </div>
  );
};

export default Login;
