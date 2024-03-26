import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { NavBar } from '../../components/Navbar/Navbar';
import { Sidebar } from '../../components/SidePanel/Sidebar';
import './orderPage.css';

export const OrderMasterPage = () => {
    const navigate = useNavigate();
    const { orderId } = useParams();
    const [orderMaster, setOrderMaster] = useState({});
    const [orderDetails, setOrderDetails] = useState([]);

    const breadCrumItems = [
        { label: 'Home', command: () => navigate('/order') },
        { label: 'Order List', command: () => navigate('/order') },
        { label: 'Order Master', command: () => navigate(`/orderMaster${orderId}`) }
    ];

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/common/api/get_order_master?fby_user_id=1002`, {
                    order_no: orderId
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: process.env.REACT_APP_ACCESS_TOKEN
                    }
                });
                if (res.data.success && res.data.success.data.length > 0) {
                    const responseData = res.data.success.data;
                    setOrderMaster(responseData[0]);
                    try {
                        const resDetails = await axios.post(`${process.env.REACT_APP_BASE_URL}/common/api/get_order_detail?fby_user_id=1002`, {
                            order_no: orderId
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: process.env.REACT_APP_ACCESS_TOKEN
                            }
                        });
                        if (resDetails.data.success && resDetails.data.success.data.length > 0) {
                            const responseDataDetails = resDetails.data.success.data;
                            setOrderDetails(responseDataDetails);
                        }
                    } catch (error) {
                        console.error('Error fetching order details:', error);
                    }

                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    // Function to handle navigating back
    const handleBack = () => {
        navigate(-1);
    };

    // Function to navigate to order detail page
    const handleOrderSelect = (order_line_item_id) => {
        navigate(`/orderMaster/${orderId}/orderDetails/${order_line_item_id}`);
    };

    const orderBodyTemplate = (rowData) => {
        return (
            <span
                onClick={() => {
                    handleOrderSelect(rowData.order_line_item_id);
                }}
                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
            >
                {rowData.order_line_item_id}
            </span>
        );
    };

    return (
        <>
            <NavBar selectedSidebarItem="orders" />
            <Sidebar />
            <BreadCrumb model={breadCrumItems} style={{ marginLeft: '200px' }} />
            <h1 style={{ marginLeft: '300px' }}>Order: {orderMaster.seller_order_id}</h1>
            <div className="order-page">
                <div style={{ display: 'flex' }}>
                    <div style={{ width: '100%' }}>
                        <Card>
                            <div className="flex flex-wrap gap-2 mb-4" >
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Channel:</label>
                                    <div>{orderMaster.channel}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Order Status:</label>
                                    <div>{orderMaster.order_status}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Seller Order ID:</label>
                                    <div>{orderMaster.seller_order_id}</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4" >
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Total Tax:</label>
                                    <div>{orderMaster.total_tax}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Promotion Disount:</label>
                                    <div>{orderMaster.total_discount}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Item Total Price:</label>
                                    <div>{orderMaster.total_items_price}</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4" >
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Total Shipping Price:</label>
                                    <div>{orderMaster.total_shipping_price}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Payment Status:</label>
                                    <div>{orderMaster.payment_status}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Sales Record No:</label>
                                    <div>{orderMaster.sales_record_no}</div>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4" >
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Purchase Date:</label>
                                    <div>{orderMaster.purchase_date}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Payment Date:</label>
                                    <div>{orderMaster.payment_date}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Local Time:</label>
                                    <div>{orderMaster.local_time}</div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div style={{ width: '60%', marginLeft: '15px' }}>
                        <Card>
                            <h2>Shipping Address</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Recipient Name:</label>
                                    <div>{orderMaster.recipient_name}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Shipping Address:</label>
                                    <div>{orderMaster.ship_address_1}</div>
                                    <div>{orderMaster.ship_address_2}</div>
                                    <div>{orderMaster.ship_city}, {orderMaster.ship_state}, {orderMaster.ship_postal_code}</div>
                                    <div>{orderMaster.ship_country}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Phone Number:</label>
                                    <div>{orderMaster.ship_phone_number}</div>
                                </div>
                            </div>
                        </Card>
                        <Card style={{ marginTop: '10px' }}>
                            <h2>Billing Address</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Bill To:</label>
                                    <div>{orderMaster.bill_generator_name}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Billing Address:</label>
                                    <div>{orderMaster.bill_address_1}</div>
                                    <div>{orderMaster.bill_address_2}</div>
                                    <div>{orderMaster.bill_city}, {orderMaster.bill_state}, {orderMaster.bill_postal_code}</div>
                                    <div>{orderMaster.bill_country}</div>
                                </div>
                                <div className="flex-auto">
                                    <label className="font-bold block mb-2">Phone Number:</label>
                                    <div>{orderMaster.bill_phone_number}</div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            <Card>
                <DataTable value={orderDetails} style={{ marginBottom: '20px', marginLeft: '250px' }}>
                    <Column field="order_no" header="Order No" />
                    <Column field="location_id" header="Location ID" />
                    <Column field="seller_order_id" header="Seller Order ID" />
                    <Column field="purchase_date" header="Purchase Date" />
                    <Column field="order_line_item_id" header="Order Line Item ID" body={orderBodyTemplate} />
                    <Column field="sku" header="SKU" />
                    <Column field="quantity_purchased" header="Quantity Purchase" />
                    <Column field="item_total_tax" header="Item Total Price" />
                </DataTable>
            </Card>
            <div style={{ marginTop: '1%', marginLeft: '93%' }}>
                <Button label="Back" className="p-button-secondary" onClick={handleBack} />
            </div>
        </>
    );
};
