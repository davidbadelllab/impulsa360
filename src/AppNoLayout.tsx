import { Outlet } from 'react-router-dom';
import { ReactNode } from 'react';

interface AppNoLayoutProps {
  children?: ReactNode;
}

const AppNoLayout = ({ children }: AppNoLayoutProps) => {
  return (
    <div>
      {children || <Outlet />}
    </div>
  );
};

export default AppNoLayout;
