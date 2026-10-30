import { getSite } from "@/api/platform";
import Copyright from "@/components/Footer/Copyright";
import LoginForm from "@/components/Forms/LoginForm";
import RegisterForm from "@/components/Forms/RegisterForm";
import { useEffect, useState } from "react";
import Snowflake from "./snowflake";
import styles from "./index.module.scss";
import Owl from "@/components/Owl";

const Login = () => {
  const [register, setRegister] = useState(0);
  const onClick = () => setRegister(v => v + 1);
  const [random] = useState(Math.random());
  const [closeEyes, setCloseEyes] = useState(false);
  const [registeredUser, setRegisteredUser] = useState("");
  const [allowRegister, setAllowRegister] = useState(true);
  useEffect(() => {
    getSite()
      .then(res => {
        if (res.data?.data?.allow_register === false) setAllowRegister(false);
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (!allowRegister) setRegister(0);
  }, [allowRegister]);
  const leaveRegister = () => {
    setCloseEyes(false);
    setRegister(0);
  };
  const bg = random < 0.45 ? "https://dr.cdnux.com/18510675/i/2025/01/04/65a28bad6be9e.jpg" : "https://dr.cdnux.com/18510675/i/2024/12/31/7xt4r.webp";
  return (
    <div className={styles.container} style={{ backgroundImage: `url(${bg})` }}>
      <div className={styles.fromContainer}>
        <div>
          <Owl closeEyes={closeEyes} />
        </div>
        <div>
          {register % 2 && allowRegister ? (
            <RegisterForm
              goBack={leaveRegister}
              onRegistered={username => {
                setRegisteredUser(username);
                leaveRegister();
              }}
              setCloseEyes={setCloseEyes}
            />
          ) : (
            <LoginForm allowRegister={allowRegister} setRegister={onClick} setCloseEyes={setCloseEyes} username={registeredUser} />
          )}
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
