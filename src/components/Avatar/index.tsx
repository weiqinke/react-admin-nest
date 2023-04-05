import React from "react";
import { Avatar as AvatarComponent } from "antd";

function handleError() {
  return true;
}

const Avatar: React.FC<any> = props => {
  return <AvatarComponent {...props} onError={handleError} />;
};

export default Avatar;
