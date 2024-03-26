// NavigationButton/NavbarAfterLoginProduct.js

import React from "react";
// Import your sidebar components
import { Container, Nav, Navbar } from "react-bootstrap";
import { RefreshButton } from "./RefreshButton";
import { ExportButton } from "./ExportButton";
import { ImportButton } from "./ImportButton";
import { AddProductForm } from "./AddProductForm";
import { BarcodeManagement } from "./BarcodeManagement";

export const ProductNavbar = () => (
    <Nav>
        {/* <Nav.Item>
            <RefreshButton />
        </Nav.Item>
        <Nav.Item>
            <ExportButton />
        </Nav.Item>
        <Nav.Item>
            <ImportButton />
        </Nav.Item>
        <Nav.Item>
            <AddProductForm />
        </Nav.Item>
        <Nav.Item>
            <BarcodeManagement />
        </Nav.Item> */}
    </Nav>
);
