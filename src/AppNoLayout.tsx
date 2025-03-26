import './App.css';
import { Outlet } from 'react-router-dom';
import { ReactNode } from 'react';

interface AppNoLayoutProps {
  children?: ReactNode;
}

const AppNoLayout = ({ children }: AppNoLayoutProps) => {
  return (
    <div className="min-h-screen">
      {children || <Outlet />}
    </div>
  );
};

export default AppNoLayout;
