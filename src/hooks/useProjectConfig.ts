import { useState } from 'react';
import { defaultConfig } from 'config/defaultConfig';
interface DefaultConfig {
  layout: string;
}
export const useProjectConfig = (initialPayload: DefaultConfig = defaultConfig) => {
  const [config, setConfig] = useState(initialPayload);
  return {
    config,
    setConfig
  };
};
