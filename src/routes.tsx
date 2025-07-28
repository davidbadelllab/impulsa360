import { createBrowserRouter } from 'react-router-dom';
import { dashboardRoutes } from './views/Dashboard/Dashboard';
import LinkTree from './views/LinkTree/LinkTree';
import App from './App';
import AppNoLayout from './AppNoLayout';
import Login from './views/Login/Login';
import Dashboard from './views/Dashboard/Dashboard';
import Services from './views/Services/Services';
import Systems from './views/Systems/Systems';
import SuccessCases from './views/SuccessCases/SuccessCases';
import Blog from './views/Blog/Blog';
import BlogDetail from './views/Blog/BlogDetail';
import Contact from './views/Contact/Contact';
import FAQ from './views/FAQ/FAQ';
import About from './views/About/About';
import ErrorPage from './components/ErrorPage';
import Hero from './components/Hero/Hero.jsx';
import Benefits from './components/Benefits/Benefits.jsx';
import ServicePlans from './components/ServicePlans.jsx';
import TermsOfService from './views/TermsOfService';
import PrivacyPolicy from './views/PrivacyPolicy';
import LegalNotice from './views/LegalNotice';
import AppsComponent from './components/AppsComponent.jsx';
import ComponentsSuccessCases from './components/ComponentsSuccessCases.jsx';
import AgileServices from './components/AgileServices.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import VideoConferencePage from './views/Dashboard/VideoConferencePage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AppNoLayout><Login /></AppNoLayout>
  },
  {
    path: '/dashboard',
    element: (
      <AppNoLayout>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </AppNoLayout>
    ),
    children: dashboardRoutes
  },

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
            <AppsComponent />
            <ServicePlans />
            <ComponentsSuccessCases />
            <AgileServices/>
          </>
        )
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
        path: 'blog/:id',
        element: <BlogDetail />
      },
      {
        path: 'contact',
        element: <Contact />
      },
      {
        path: 'faq',
        element: <FAQ />
      },
      {
        path: 'about',
        element: <About />
      },
      {
        path: 'terms',
        element: <TermsOfService />
      },
      {
        path: 'privacy',
        element: <PrivacyPolicy />
      },
      {
        path: 'legal',
        element: <LegalNotice />
      }
    ]
  },
  {
    path: '/linktree',
    element: <LinkTree />
  }
]);

export default router;
