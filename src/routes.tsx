import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Login from './views/Login/Login';
import Dashboard from './views/Dashboard/Dashboard';
import Services from './views/Services/Services';
import Systems from './views/Systems/Systems';
import SuccessCases from './views/SuccessCases/SuccessCases';
import Blog from './views/Blog/Blog';
import Contact from './views/Contact/Contact';
import ErrorPage from './components/ErrorPage';
import Hero from './components/Hero/Hero.jsx';
import Benefits from './components/Benefits/Benefits.jsx';
import ServicePlans from './components/ServicePlans.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <>
            <Hero/>
            <Benefits />
            <ServicePlans />
          </>
        )
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'services',
        element: <Services />
      },
      {
        path: 'systems',
        element: <Systems />
      },
      {
        path: 'success-cases',
        element: <SuccessCases />
      },
      {
        path: 'blog',
        element: <Blog />
      },
      {
        path: 'contact',
        element: <Contact />
      }
    ]
  }
]);

export default router;
