import { getSite } from "@/api/site";
import Copyright from "@/components/Footer/Copyright";
import LoginForm from "@/components/Forms/LoginForm";
import SuspendFallback from "@/components/SuspendFallback";
import Owl from "@/components/Owl";
import { lazy, Suspense, useEffect, useState } from "react";
import styles from "./index.module.scss";

const RegisterForm = lazy(() => import("@/components/Forms/RegisterForm"));
const Snowflake = lazy(() => import("./snowflake"));

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
  const showRegister = Boolean(register % 2 && allowRegister);
  return (
    <div className={styles.container} style={{ backgroundImage: `url(${bg})` }}>
      <div className={styles.fromContainer}>
        <div>
          <Owl closeEyes={closeEyes} />
        </div>
        <div>
          {showRegister ? (
            <Suspense fallback={<SuspendFallback />}>
              <RegisterForm
                goBack={leaveRegister}
                onRegistered={username => {
                  setRegisteredUser(username);
                  leaveRegister();
                }}
                setCloseEyes={setCloseEyes}
              />
            </Suspense>
          ) : (
            <LoginForm allowRegister={allowRegister} setRegister={onClick} setCloseEyes={setCloseEyes} username={registeredUser} />
          )}
        </div>
      </div>
      <div className={styles.cr}>
        <Copyright />
      </div>
      <div className={styles.Snowflakecontainer}>
        <Suspense fallback={null}>
          <Snowflake rdm={random} />
        </Suspense>
      </div>
    </div>
  );
};

export default Login;
