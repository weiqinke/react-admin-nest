import React, { FC, useState } from 'react';
import { SketchPicker } from 'react-color';
import { SettingOutlined } from '@ant-design/icons';

const ThemePicker: FC = () => {
  const [background, setbackground] = useState(localStorage.getItem('@primary-color') || '#313653');
  const [switcherOn, setswitcherOn] = useState(false);
  const _switcherOn = () => {
    setswitcherOn(!switcherOn);
  };
  const _handleChangeComplete = (color: any) => {
    setbackground(color.hex);
    localStorage.setItem('@primary-color', color.hex);
    (window as any).less.modifyVars({
      '@primary-color': color.hex
    });
  };
  return (
    <div className={'switcher dark-white'}>
      <span className="sw-btn dark-white" onClick={_switcherOn}>
        <SettingOutlined type="setting" className="text-dark" />
      </span>
      {switcherOn && (
        <div style={{ padding: 10 }} className="clear">
          <SketchPicker
            color={background}
            onChangeComplete={color => {
              _handleChangeComplete(color);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
