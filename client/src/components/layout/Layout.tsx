import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 min-h-screen">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;
