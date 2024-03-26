
import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/SidePanel/Sidebar';
import './orderPage.css';
import { OrderList } from './orderList';
import { getOrders } from '../../api/orders';
import { NavBar } from '../../components/Navbar/Navbar';
import { useAuth } from "../../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export const OrderPage = () => {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        } 
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setOrders([]);
        }
    };

    return (
        <>
            <NavBar selectedSidebarItem="orders" />
            <Sidebar />
            <div className="order-page">
                <OrderList orders={orders} />
            </div>
        </>

    );
};
