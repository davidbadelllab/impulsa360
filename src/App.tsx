import './App.css';
import { Outlet } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import Header from './components/Layout/Header.jsx';
import Footer from './components/Layout/Footer.jsx';
import MenuMovil from './components/MenuMovil.jsx';
import WhatsAppWidget from './components/WhatsAppWidget.jsx';


const App = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {isMobile ? (
        <MenuMovil />
      ) : (
        <Footer />
      )}
      <WhatsAppWidget />
    </div>
  );
};

export default App;
