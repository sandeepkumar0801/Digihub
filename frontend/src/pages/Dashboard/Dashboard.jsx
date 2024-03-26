import React, { useState, useEffect } from 'react';
import { Layout, Breadcrumb, Card, Row, Col, Select, Divider } from 'antd';
import { Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { Chart, CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement } from 'chart.js';
import { Sidebar } from '../../components/SidePanel/Sidebar';
import { NavBar } from '../../components/Navbar/Navbar';
import './dashboard.css';
import { getProducts } from '../../api/products'; // Assuming you have an API to fetch products

import {
    Grid,
} from '@mui/material';
import { getOrders } from '../../api/orders';
import { getChannelDetails } from '../../api/channel';

Chart.register(CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement);
const { Content, Footer } = Layout;
const { Option } = Select;

export const Dashboard = () => {
    const [totalOrderCount, setTotalOrderCount] = useState(0);
    const [totalUserCount, setTotalUserCount] = useState(0);
    const [completedOrderCount, setCompletedOrderCount] = useState(0);
    const [totalProfit, setTotalProfit] = useState(0);
    const [totalProductCount, setTotalProductCount] = useState(0);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const productData = await getProducts();
            const orderData = await getOrders();
            const channelData = await getChannelDetails();
            setTotalProductCount(productData.length);
            setTotalOrderCount(orderData.length);
            setTotalUserCount(channelData.length);

            // const [ completedOrdersRes, profitRes] = await Promise.all([
            //     axios.get(`${process.env.REACT_APP_BASE_URL}/common/api/completed_orders`),
            //     axios.get(`${process.env.REACT_APP_BASE_URL}/common/api/total_profit`),
            // ]);
            setCompletedOrderCount(0);
            setTotalProfit(0);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
    };

    const salesData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Sales',
                data: [120, 150, 130, 160, 140, 170, 150],
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const orderStatusData = {
        labels: ['Pending', 'Processing', 'Completed'],
        datasets: [
            {
                label: 'Order Status',
                data: [20, 30, 25],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 205, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 205, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const handleChange = (value) => {
        console.log(`Selected: ${value}`);
    };

    return (
        <>
            <NavBar selectedSidebarItem="dashboard" />
            <Sidebar />
            <div className="dashboard-page">
                <Grid container spacing={2} justifyContent="center">
                    <Layout className="site-layout">
                        <Content style={{ margin: '16px', padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
                            <Breadcrumb style={{ margin: '16px 0' }}>
                                <Breadcrumb.Item><h4>Dashboard</h4></Breadcrumb.Item>
                            </Breadcrumb>
                            <Divider />
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12} lg={5}>
                                    <Card title="Total Orders" style={{ background: '#fff' }}>
                                        <p style={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold', marginBottom: '0' }}>{totalOrderCount}</p>
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} lg={5}>
                                    <Card title="Total Channel Users" style={{ background: '#fff' }}>
                                        <p style={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold', marginBottom: '0' }}>{totalUserCount}</p>
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} lg={5}>
                                    <Card title="Completed Orders" style={{ background: '#fff' }}>
                                        <p style={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold', marginBottom: '0' }}>{completedOrderCount}</p>
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} lg={5}>
                                    <Card title="Total Profit" style={{ background: '#fff' }}>
                                        <p style={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold', marginBottom: '0' }}>{totalProfit}</p>
                                    </Card>
                                </Col>
                                <Col xs={24} sm={12} lg={4}>
                                <Card title="Total Products" style={{ background: '#fff' }}>
                                        <p style={{ color: '#1890ff', fontSize: '24px', fontWeight: 'bold', marginBottom: '0' }}>{totalProductCount}</p>
                                    </Card>
                                </Col>
                            </Row>
                            <Divider />
                            <Row gutter={[16, 16]}>
                                <Col xs={24} lg={12}>
                                <Card title="Latest Sales" style={{ background: '#fff' }}>
                                        <Bar data={salesData} />
                                        <Select defaultValue="week" style={{ width: 120, marginTop: 10 }} onChange={handleChange}>
                                            <Option value="week">Week</Option>
                                            <Option value="month">Month</Option>
                                            <Option value="year">Year</Option>
                                        </Select>
                                    </Card>
                                </Col>
                                <Col xs={24} lg={12}>
                                <Card title="Order Status" style={{ background: '#fff' }}>
                                        <Doughnut data={orderStatusData} />
                                    </Card>
                                </Col>
                            </Row>
                        </Content>
                        <Footer style={{ textAlign: 'center', background: '#fff' }}>Created by Anonymous</Footer>
                    </Layout>
                </Grid>
            </div>
        </>
    );
};
