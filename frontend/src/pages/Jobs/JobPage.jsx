import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/SidePanel/Sidebar';
import './jobPage.css';
import { NavBar } from '../../components/Navbar/Navbar';
import { JobList } from './JobList';
import { useAuth } from "../../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export const JobPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) {
        navigate('/login');
    } 
}, [isAuthenticated, navigate]);

  return (
    <>
      <NavBar selectedSidebarItem = "job" />
      <Sidebar />
      <div className="job-page">
        <JobList/>
      </div>
    </>

  );
};
