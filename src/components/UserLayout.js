// UserLayout.js
import React from 'react';

function UserLayout({ children }) {
  return (
    <div className="user-layout">
      <nav>User-specific navigation </nav>
      <main>{children}</main>
    </div>
  );
}

export default UserLayout;