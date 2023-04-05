import React, { FC } from "react";
import en_US from "./en-US";
import zh_CN from "./zh-CN";
import { FormattedMessage, MessageDescriptor, createIntl } from "react-intl";

type Id = keyof typeof en_US;

interface Props extends MessageDescriptor {
  id: Id;
}

export const LocaleFormatter: FC<Props> = ({ ...props }) => {
  const notChildProps = { ...props, children: undefined };
  return <FormattedMessage {...notChildProps} id={props.id} />;
};

export const lacaleConfig = {
  zh: zh_CN,
  en: en_US
};

export const useLocale = () => {
  const intl = createIntl({
    locale: "zh",
    messages: lacaleConfig["zh"]
  });

  return {
    lacaleConfig,
    ...intl
  };
};
