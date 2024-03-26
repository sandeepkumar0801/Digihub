import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { IonIcon } from '@ionic/react';
import { Container, Nav, Navbar } from "react-bootstrap";
import { bag, homeOutline, cubeOutline, newspaperOutline, clipboardOutline, peopleOutline, chatbubbleOutline, businessOutline, settingsOutline } from 'ionicons/icons';
import './Sidebar.css';

export const Sidebar = () => {
    const [selectedSidebarItem, setSelectedSidebarItem] = useState(null);

    // Function to handle sidebar item click
    const handleSidebarItemClick = (item) => {
        setSelectedSidebarItem(item);
    };

    return (
        <nav className="sidebar">
            <ul className="sidebar-menu">
                <li>
                    <NavLink to="/dashboard" exact activeClassName="active" onClick={() => handleSidebarItemClick('dashboard')}>
                        <IonIcon icon={homeOutline} size="large"></IonIcon> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/products" activeClassName="active" onClick={() => handleSidebarItemClick('products')}>
                        <IonIcon icon={cubeOutline} size="large"></IonIcon> Products
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/orders" activeClassName="active" onClick={() => handleSidebarItemClick('orders')}>
                        <IonIcon icon={clipboardOutline} size="large"></IonIcon> Orders
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/jobssettings" activeClassName="active" onClick={() => handleSidebarItemClick('jobssettings')}>
                        <IonIcon icon={businessOutline} size="large"></IonIcon> Jobs Settings
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/channelsettings" activeClassName="active" onClick={() => handleSidebarItemClick('channelsettings')}>
                        <IonIcon icon={chatbubbleOutline} size="large"></IonIcon> Channel Settings
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/customers" activeClassName="active" onClick={() => handleSidebarItemClick('customers')}>
                        <IonIcon icon={peopleOutline} size="large"></IonIcon> Customers
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};
