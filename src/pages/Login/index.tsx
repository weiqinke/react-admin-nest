import LoginForm from "@/components/Forms/LoginForm";
import styles from "./index.module.scss";
import Copyright from "@/components/Footer/Copyright";

const Login = () => {
  return (
    <div className={styles.container}>
      <LoginForm />
      <div className={styles.cr}>
        <Copyright />
      </div>
    </div>
  );
};

export default Login;
