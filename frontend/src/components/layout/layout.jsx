// Layout.js
import React from "react";
import { NavBar } from "../Navbar/Navbar";
import { Sidebar } from "../SidePanel/Sidebar.jsx";
export const Layout = ({ children }) => {
  return (
    <>
      {/* <NavBar /> */}
      <div className="container-fluid">
        <div className="row">
          <Sidebar />
          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            {children}
          </main>
        </div>
      </div>
    </>
  );
};

