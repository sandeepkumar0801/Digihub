import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../navbar.css";
export const LoginNavbar = () => (
    <Nav className="justify-content-end flex-grow-1 pe-3">
        <Nav.Item>
            <Link
                aria-label="Go to Home Page"
                className="navbar-link"
                to="/"
            >
                <span className="nav-link-label">Home</span>
            </Link>
        </Nav.Item>
        <Nav.Item>
            <Link
                aria-label="Go to Login Page"
                to="/login"
                className="login"
                // data-num={cartList.length}
            >
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
            </Link>
        </Nav.Item>
    </Nav>
);