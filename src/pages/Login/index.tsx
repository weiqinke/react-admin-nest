import { getSite } from "@/api/site";
import Copyright from "@/components/Footer/Copyright";
import LoginForm from "@/components/Forms/LoginForm";
import SuspendFallback from "@/components/SuspendFallback";
import Owl from "@/components/Owl";
import { lazy, Suspense, useEffect, useState } from "react";
import styles from "./index.module.css";

const RegisterForm = lazy(() => import("@/components/Forms/RegisterForm"));
const Snowflake = lazy(() => import("./snowflake"));

const BACKGROUNDS = ["https://dr.cdnux.com/18510675/i/2025/01/04/65a28bad6be9e.jpg", "https://dr.cdnux.com/18510675/i/2024/12/31/7xt4r.webp"];

function whenIdle(run: () => void) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(run, { timeout: 1200 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(run, 300);
  return () => window.clearTimeout(id);
}

const Login = () => {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const openRegister = () => setShowRegisterForm(true);
  const [random] = useState(Math.random());
  const [closeEyes, setCloseEyes] = useState(false);
  const [registeredUser, setRegisteredUser] = useState("");
  const [allowRegister, setAllowRegister] = useState(true);
  const [background, setBackground] = useState("");
  const [showSnow, setShowSnow] = useState(false);
  useEffect(() => {
    getSite()
      .then(res => {
        if (res.data?.data?.allow_register === false) setAllowRegister(false);
      })
      .catch(() => {});
  }, []);
  useEffect(
    () =>
      whenIdle(() => {
        setBackground(random < 0.45 ? BACKGROUNDS[0] : BACKGROUNDS[1]);
        setShowSnow(true);
      }),
    [random]
  );
  const leaveRegister = () => {
    setCloseEyes(false);
    setShowRegisterForm(false);
  };
  const showRegister = showRegisterForm && allowRegister;
  return (
    <div className={styles.container} style={background ? { backgroundImage: `url(${background})` } : undefined}>
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
            <LoginForm allowRegister={allowRegister} setRegister={openRegister} setCloseEyes={setCloseEyes} username={registeredUser} />
          )}
        </div>
      </div>
      <div className={styles.cr}>
        <Copyright />
      </div>
      {showSnow ? (
        <div className={styles.Snowflakecontainer}>
          <Suspense fallback={null}>
            <Snowflake rdm={random} />
          </Suspense>
        </div>
      ) : null}
    </div>
  );
};

export default Login;
