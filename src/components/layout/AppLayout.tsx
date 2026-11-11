import { useState } from "react";
import { Outlet } from "react-router-dom";

import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">

      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div
        className={`app-main ${
          collapsed ? "main-expanded" : ""
        }`}
      >
        <AppHeader
          onMenuClick={() => setMobileOpen(true)}
        />

        <main className="app-content">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default AppLayout;
