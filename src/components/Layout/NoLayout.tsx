import { Outlet } from 'react-router-dom';

const NoLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};

export default NoLayout;
