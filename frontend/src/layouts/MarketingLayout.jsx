import { Outlet } from 'react-router-dom';
import MarketingNavbar from '../components/marketing/Navbar';
import MarketingFooter from '../components/marketing/Footer';

/**
 * Marketing Layout
 * Wraps public marketing experiences (Landing page) with sticky glass Navbar,
 * fluid content area, and minimal Footer.
 */
export default function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg text-primary selection:bg-accent/30 selection:text-primary">
      <MarketingNavbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <MarketingFooter />
    </div>
  );
}
