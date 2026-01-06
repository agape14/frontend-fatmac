import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-grow pb-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

