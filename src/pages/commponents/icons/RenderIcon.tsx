import React from 'react';
import * as Icon from '@ant-design/icons';
export default function RenderIcon(iconType: any) {
  return React.createElement(Icon && (Icon as any)[iconType], {
    style: { fontSize: '16px', color: '#08c' }
  });
}
