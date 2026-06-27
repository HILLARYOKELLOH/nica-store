'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname.startsWith('/auth/');
  const isAdmin = pathname.startsWith('/admin/');
  const showLayout = !isAuth && !isAdmin;

  return (
    <>
      {showLayout && <Navbar />}
      {isAdmin && <AdminNavbarStub />}
      <main className={showLayout ? 'min-h-screen' : ''}>
        {children}
      </main>
      {showLayout && <Footer />}
    </>
  );
}

function AdminNavbarStub() {
  return null; // Navbar is rendered inside admin pages themselves
}
