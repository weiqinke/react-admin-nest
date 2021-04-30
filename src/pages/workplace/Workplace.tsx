import React, { FC, useEffect } from 'react';

import './Workplace.less';
import TarceIndex from 'pages/tarceindex/tarceindex';

type DropChildProps = Partial<{ provided: any } & any> & React.HTMLAttributes<HTMLDivElement>;

export const DropChild = React.forwardRef<HTMLDivElement, DropChildProps>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));

const Workplace: FC = () => {
  useEffect(() => {
    return () => {};
  }, []);
  return (
    <div className="Workplace">
      <DropChild></DropChild>
      <TarceIndex />
    </div>
  );
};

export default Workplace;
