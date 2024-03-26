import React, { useState } from "react";
import { Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ProductNavbar } from "./NavigationButton/ProductNavbar";
import { OrderNavbar } from "./NavigationButton/OrderNavbar";
import { LoginNavbar } from "./NavigationButton/LoginNavbar";
import { ChannelNavbar } from "./NavigationButton/ChannelNavbar";
import { JobNavbar } from "./NavigationButton/JobNavbar";
import { IonIcon } from '@ionic/react';
import { bag, personCircle } from 'ionicons/icons';
import { Dashboard } from "./NavigationButton/Dashboard";
import { useAuth } from "../../auth/AuthContext";

export const NavBar = ({ selectedSidebarItem }) => {
    const { logout } = useAuth();
    const { cartList } = useSelector((state) => state.cart);
    const [expand, setExpand] = useState(false);
    const [showProfile, setShowProfile] = useState(false);

    const toggleProfile = () => {
        setShowProfile(!showProfile);
    };

    function checkSelectedSidebarItem() {
        if (selectedSidebarItem === "products") {
            return <ProductNavbar />;
        } else if (selectedSidebarItem === "orders") {
            return <OrderNavbar />;
        } else if (selectedSidebarItem === "channel") {
            return <ChannelNavbar />;
        } else if (selectedSidebarItem === "job") {
            return <JobNavbar />;
        } else if (selectedSidebarItem === "dashboard") {
            return <Dashboard />;
        } else {
            return <LoginNavbar />;
        }
    }

    return (
        <Navbar
            fixed="top"
            expand="md"
            className="navbar"
            style={{ backgroundColor: "white" }}
        >
            <Container className="navbar-container">
                <Navbar.Brand to="/">
                    <IonIcon icon={bag}></IonIcon>
                    <h1 className="logo">DigiHub</h1>
                </Navbar.Brand>
                <Navbar.Collapse id="responsive-navbar-nav" className="right-alligned">
                    <div className="d-flex align-items-center">
                        <div className="media-cart">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="black"
                                className="nav-icon"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <Link
                                aria-label="Go to Cart Page"
                                to="/cart"
                                className="cart"
                                data-num={cartList.length}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="black"
                                    className="nav-icon"
                                >
                                    <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                                </svg>
                            </Link>
                        </div>
                        <Navbar.Toggle
                            aria-controls="basic-navbar-nav"
                            onClick={() => {
                                setExpand(!expand);
                            }}
                        >
                            <span></span>
                            <span></span>
                            <span></span>
                        </Navbar.Toggle>
                        {(selectedSidebarItem == 'products' || selectedSidebarItem == 'orders' || selectedSidebarItem === 'channel' || selectedSidebarItem === 'job' || selectedSidebarItem == "dashboard") && (
                            <div className="profile-container">
                                <IonIcon
                                    icon={personCircle}
                                    onClick={toggleProfile}
                                    className="profile-icon"
                                />
                                <Dropdown className="profile-dropdown">
                                    <Dropdown.Toggle variant="transparent" id="dropdown-basic">
                                        {localStorage.getItem("user")}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item href="#/action-1">Profile</Dropdown.Item>
                                        <Dropdown.Item href="#/action-2" onClick={logout}>Logout</Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        )}
                    </div>
                    {checkSelectedSidebarItem()}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};
