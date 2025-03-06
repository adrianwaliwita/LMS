import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import NavlayOut from "../layout/NavLayout";

const Layout = () => {
  const location = useLocation();

  return (
    <div>
      {location.pathname !== "/" ? (
        <NavlayOut>
          <main>
            <Outlet />
          </main>
        </NavlayOut>
      ) : (
        <main>
          <Outlet />
        </main>
      )}
    </div>
  );
};

export default Layout;
