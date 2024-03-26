import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/SidePanel/Sidebar';
import './channelPage.css';
import { NavBar } from '../../components/Navbar/Navbar';
import { ChannelList } from './ChannelList';
import { ChannelSettings } from './ChannelSetting';

export const ChannelPage = () => {
  return (
    <>
      <NavBar selectedSidebarItem = "channel" />
      <Sidebar />
      <div className="channel-page">
        {/* <ChannelList/> */}
        <ChannelSettings/>
      </div>
    </>

  );
};
