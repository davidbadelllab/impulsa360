import './App.css'
import Header from './components/Layout/Header.jsx'
import Footer from './components/Layout/Footer.jsx'
import { Outlet } from 'react-router-dom'


const App = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default App;
