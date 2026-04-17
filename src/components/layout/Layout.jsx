import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  const hideChrome = ['/', '/login', '/menu', '/my-order', '/my-orders', '/cajero', '/reset-password', '/rockola'].includes(path);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideChrome && <Header />}
      <main style={{ flex: 1 }}>
        {children}
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
};

export default Layout;

