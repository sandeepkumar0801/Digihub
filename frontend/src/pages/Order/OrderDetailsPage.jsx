import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Barcode from 'react-barcode';
import { useReactToPrint } from 'react-to-print';
import Quagga from 'quagga';
import { NavBar } from '../../components/Navbar/Navbar';
import { Sidebar } from '../../components/SidePanel/Sidebar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './orderPage.css';

export const OrderDetailsPage = () => {
    const navigate = useNavigate();
    const { orderId, lineId } = useParams();
    const [order, setOrder] = useState({});
    const [orders, setOrders] = useState([]);
    const [scannedOrderLineItems, setScannedOrderLineItems] = useState([]);
    const [specialNumber, setSpecialNumber] = useState('');
    const [streamActive, setStreamActive] = useState(true);
    const printRef = useRef();
    const qrRef = useRef();
    const breadCrumItems = [
        { label: 'Home', command: () => navigate('/order') },
        { label: 'Order List', command: () => navigate('/order') },
        { label: 'Order Master', command: () => navigate(`/orderMaster/${orderId}`) },
        { label: 'Order Details', command: () => navigate(`/orderMaster/${orderId}/orderDetails/${lineId}`) }
    ];

    useEffect(() => {
        const fetchOrderDetails = async () => {
            var storedGroupCode = localStorage.getItem("groupCode");
            try {
                const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/common/api/get_order_detail?fby_user_id=${storedGroupCode}`, {
                    order_no: orderId,
                    order_line_item_id: lineId
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: process.env.REACT_APP_ACCESS_TOKEN
                    }
                });
                if (res.data.success && res.data.success.data.length > 0) {
                    const responseData = res.data.success.data;
                    setOrders(responseData);
                    setOrder(responseData[0]);
                    generateSpecialNumber(responseData[0].order_line_item_id);
                    const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/get_bin?fby_user_id=${storedGroupCode}&order_no=${responseData[0].order_no}`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: process.env.REACT_APP_ACCESS_TOKEN
                            }
                        });
                    const scannedOrder = response.data.success.data.map(order => order.order_line_item_id);
                    setScannedOrderLineItems(scannedOrder);
                }
            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        };
        fetchOrderDetails();
    }, [orderId, lineId]);

    // Function to generate barcode value
    const generateBarcodeValue = () => {
        const { order_no, sku, order_line_item_id } = order;
        const lastThreeOrderNo = order_no?.toString().slice(-3) || '000';
        const lastThreeSKU = sku?.toString().slice(-3) || '000';
        const lastThreeOrderLineItemId = order_line_item_id?.toString().slice(-3) || '000';
        const lastThreeSpecialNumber = specialNumber?.toString().slice(-3) || '000';
        return lastThreeOrderNo + lastThreeSKU + lastThreeOrderLineItemId + lastThreeSpecialNumber;
    };

    const generateSpecialNumber = (orderNo) => {
        const generatedSpecialNumber = `${orderNo}-${Math.floor(Math.random() * 1000)}`;
        setSpecialNumber(generatedSpecialNumber);
    };

    // Function to handle assigning bin
    const handleAssignBin = async (barcode) => {
        try {
            // If barcode doesn't match any bin number, assign a new bin number
            var storedGroupCode = localStorage.getItem("groupCode");
            const newBinNumber = specialNumber || 0;
            await axios.post(`${process.env.REACT_APP_BASE_URL}/api/assign-bin?fby_user_id=${storedGroupCode}`, {
                barcode: barcode,
                binNumber: newBinNumber,
                order_no: order.order_no,
                order_line_item_id: order.order_line_item_id,
                status: 'scanned'
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: process.env.REACT_APP_ACCESS_TOKEN
                    }
                }
            );

            let scannedOrder = scannedOrderLineItems;
            scannedOrder.concat(order.order_line_item_id);
            let uniqueScannedOrder = [...new Set(scannedOrder)]
            checkOrderCompletion(uniqueScannedOrder);

        } catch (error) {
            console.error('Error assigning bin:', error);
        }
    };


    // Function to check order completion
    const checkOrderCompletion = (scannedOrder) => {
        const allScannedItemsPresent = scannedOrder.every(itemId => orders.some(order => order.order_line_item_id === itemId));
        const sameLength = scannedOrderLineItems.length === orders.length;

        if (allScannedItemsPresent && sameLength) {
            markOrderAsComplete();
        }
    };

    // Function to mark order as complete
    const markOrderAsComplete = async () => {
        try {
            var storedGroupCode = localStorage.getItem("groupCode");
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/mark-order-complete?fby_user_id=${storedGroupCode}`, {
                orderId: orderId,
                status: 'complete'
            },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: process.env.REACT_APP_ACCESS_TOKEN
                    }
                }
            );
            console.log('Order marked as complete:', response.data);
            // Future: handle any UI updates or navigation after marking order as complete
        } catch (error) {
            console.error('Error marking order as complete:', error);
        }
    };

    // Function to handle barcode scan
    const handleBarcodeScan = async (barcode) => {
        try {
            handleAssignBin(barcode);
        } catch (error) {
            console.error('Error scanning barcode:', error);
        } finally {
            stopScanner(true);
        }
    };

    // Function to handle file change
    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const imageUrl = URL.createObjectURL(file);
            Quagga.decodeSingle({
                src: imageUrl,
                numOfWorkers: 0,
                inputStream: {
                    size: 800
                },
                decoder: {
                    readers: ['code_128_reader']
                },
            }, (result) => {
                if (result && result.codeResult) {
                    handleBarcodeScan(result.codeResult.code);
                } else {
                    console.log('No barcode found in the image.');
                }
            });
        } catch (error) {
            console.error('Error scanning barcode from image:', error);
        }
    };

    // Function to handle navigating back
    const handleBack = () => {
        navigate(-1);
    };

    // Function to start the scanner
    const startScanner = () => {
        setStreamActive(true);
        Quagga.init({
            inputStream: {
                name: 'Live',
                type: 'LiveStream',
                target: qrRef.current,
                constraints: {
                    width: '150',
                    height: '150',
                    facingMode: 'environment',
                },
            },
            decoder: {
                readers: ['code_128_reader'] // specify the barcode type you want to scan
            },
        }, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            Quagga.start();
        });

        // Attach detection callback
        Quagga.onDetected((data) => {
            handleBarcodeScan(data.codeResult.code);
        });
    };

    // Function to stop the scanner
    const stopScanner = (shouldTurnOff = false) => {
        if (shouldTurnOff) {
            Quagga.stop();
            setStreamActive(false);
        }
    };


    // Function to handle printing labels
    const downloadLabel = useReactToPrint({
        content: () => printRef.current,
    });

    return (
        <div>
            <NavBar selectedSidebarItem="orders" />
            <Sidebar />
            {/* <BreadCrumb model={breadCrumItems} style={{ marginLeft: '200px' }} /> */}
            <div className="order-page">
                <Card style={{ flex: 2, marginRight: '1rem', padding: '1rem', position: 'relative' }}>
                    <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center' }}>
                        <ArrowBackIcon onClick={handleBack} />
                        <span style={{ fontSize: '1.2rem' }}>Order: {order.seller_order_id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <Button variant="contained" onClick={startScanner}>Start Scanning</Button>
                        <Button variant="contained" onClick={() => stopScanner(true)}>Stop Scanner</Button>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {streamActive && (
                            <div>
                                <div ref={qrRef} />
                            </div>
                        )}
                    </div>
                    <TableContainer style={{ maxHeight: '100vh', overflowY: 'auto' }}>
                        <Table>
                            <TableHead style={{ backgroundColor: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell><b>Detail</b></TableCell>
                                    <TableCell><b>Value</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Channel</TableCell>
                                    <TableCell>{order.channel}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Order No</TableCell>
                                    <TableCell>{order.order_no}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Location ID</TableCell>
                                    <TableCell>{order.location_id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Seller Order ID</TableCell>
                                    <TableCell>{order.seller_order_id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Purchase Date</TableCell>
                                    <TableCell>{order.purchase_date}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Payment Time</TableCell>
                                    <TableCell>{order.payment_time}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Order Line Item ID</TableCell>
                                    <TableCell>{order.order_line_item_id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>SKU</TableCell>
                                    <TableCell>{order.sku}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Order Item ID</TableCell>
                                    <TableCell>{order.order_item_id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Transaction ID</TableCell>
                                    <TableCell>{order.transaction_id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Quantity Purchased</TableCell>
                                    <TableCell>{order.quantity_purchased}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Item Total Price</TableCell>
                                    <TableCell>{order.item_total_price}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Item Total Ship Price</TableCell>
                                    <TableCell>{order.item_total_ship_price}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Tracking Courier</TableCell>
                                    <TableCell>{order.tracking_courier}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Tracking ID</TableCell>
                                    <TableCell>{order.tracking_id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Tracking Url</TableCell>
                                    <TableCell>{order.tracking_url}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Payment Status</TableCell>
                                    <TableCell>{order.payment_status}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Order Status</TableCell>
                                    <TableCell>{order.order_status}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Fulfillment Order ID</TableCell>
                                    <TableCell>{order.fulfillment_order_id}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Fulfillment Order Line Item ID</TableCell>
                                    <TableCell>{order.fulfillment_order_line_item_Id}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
                <Card style={{ flex: 1, padding: '1rem', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <Button variant="contained" onClick={downloadLabel} style={{ float: 'right' }}>Print Labels</Button>
                        </div>
                        <div ref={printRef} >
                            <div style={{ marginTop: '1rem' }}>
                                <Barcode
                                    value={generateBarcodeValue()}
                                    width={2}
                                    height={100}
                                    fontSize={14}
                                    format="CODE128"
                                />
                            </div>
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ marginTop: '5px' }}>
                                    <strong>Order No:</strong> {order.order_no}
                                </div>
                                <div style={{ marginTop: '5px' }}>
                                    <strong>SKU:</strong> {order.sku}
                                </div>
                                <div style={{ marginTop: '5px' }}>
                                    <strong>Special Number:</strong> {specialNumber}
                                </div>
                                <div style={{ marginTop: '5px' }}>
                                    <strong>Quantity:</strong> {order.quantity_purchased}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

        </div >
    );
};
