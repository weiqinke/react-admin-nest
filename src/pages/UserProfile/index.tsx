import UserInfoCard from "@/components/UserInfoCard";
import styles from "./index.module.scss";

const UserProfile = () => {
  return (
    <div className={styles.container}>
      <UserInfoCard />
    </div>
  );
};

export default UserProfile;
