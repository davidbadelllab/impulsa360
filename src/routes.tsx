import { createBrowserRouter } from 'react-router-dom';
import LinkTree from './views/LinkTree/LinkTree';
import App from './App';
import AppNoLayout from './AppNoLayout';
import Login from './views/Login/Login';
import Dashboard from './views/Dashboard/Dashboard';
import Services from './views/Services/Services';
import Systems from './views/Systems/Systems';
import SuccessCases from './views/SuccessCases/SuccessCases';
import Blog from './views/Blog/Blog';
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

const router = createBrowserRouter([
  {
    path: '/login',
    element: <AppNoLayout><Login /></AppNoLayout>
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
