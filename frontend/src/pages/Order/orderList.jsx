
import React, { useState } from 'react';
import { Button, Toolbar, TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Grid, Tabs, Tab, DialogTitle, InputAdornment } from '@mui/material';
import { SaveAlt as SaveAltIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import { read, utils, writeFile } from 'xlsx';
import { useNavigate } from 'react-router-dom';

export const OrderList = ({ orders }) => {
    const navigate = useNavigate();

    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All'); // Default to Everyone

    const exportCSV = async () => {
        try {
            const headings = [
                ["Order", "Channel", "Date", "Title", "SKU", "Variant", "Quantity", "Item", "price",
                    "Total price", "Address1", "Address2", "City", "Zip", "Province", "Country", "Email",
                    "Name", "Phone"]
            ];
            const wb = utils.book_new();
            const ws = utils.json_to_sheet([], { header: headings });
            const dataToExport = orders.map(element => ({
                order: element.order_no,
                channel: element.channel,
                date: element.updated_at,
                title: element.title,
                sku: element.sku,
                variant: element.variant_id,
                quantity: element.quantity,
                item: element.item,
                price: element.price,
                total_price: element.total_price,
                address1: element.address,
                address2: element.address2,
                city: element.city,
                zip: element.zip,
                country: element.country,
                email: element.email,
                name: element.name,
                phone: element.phone
            }));
            utils.sheet_add_json(ws, dataToExport, { origin: 'A2', skipHeader: true });
            utils.book_append_sheet(wb, ws, 'Report');
            writeFile(wb, 'order.csv');
        } catch (error) {
            console.error('Error exporting CSV:', error.message);
        }
    };

    const handleRowClick = (rowData) => {
        navigate(`/createOrder/${rowData.order_no}`);
    };

    const handleCreateOrder = () => {
        // Handle the logic for creating a new order
        // For example, redirect to the create order page
        navigate('/createOrder');
    };

    const handleTabChange = (event, newValue) => {
        setStatusFilter(newValue);
    };

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'All') return true;
        return order.order_status.toLowerCase() === statusFilter.toLowerCase();
    }).filter(order => {
        // Filter orders based on the global filter (search input)
        const searchString = globalFilter.toLowerCase();
        return Object.values(order).some(value => value && value.toString().toLowerCase().includes(searchString));
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'unfulfilled':
                return '#ffcccc'; // Red color for unfulfilled orders
            case 'not paid':
                return '#ffffcc'; // Yellow color for orders not paid
            case 'fulfiled':
                return '#ccffcc'; // Yellow color for orders not paid
            case 'open':
                return '#ccffcc'; // Green color for open orders
            case 'closed':
                return '#ccccff'; // Blue color for closed orders
            default:
                return 'inherit'; // Use default color for other statuses
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid':
                return '#ccffcc'; // Green color for paid orders
            case 'pending':
                return '#ffee58'; // Yellow color for pending orders
            case 'partially_paid':
                return '#ffebcc'; // Orange color for partially paid orders
            case 'partially_refunded':
                return '#ffcccc'; // Red color for partially refunded orders
            case 'refunded':
                return '#ffcccc'; // Red color for refunded orders
            default:
                return 'inherit'; // Use default color for other statuses
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "";
        }
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Toolbar>
                    <DialogTitle><b>Order List</b></DialogTitle>
                    <Button
                        variant="contained"
                        startIcon={<SaveAltIcon />}
                        onClick={exportCSV}
                        style={{ marginLeft: 'auto', marginRight: '10px' }}
                    >
                        Export
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleCreateOrder} style={{ backgroundColor: '#f50057', color: 'white' }}>
                        Create Order
                    </Button>
                </Toolbar>
            </Grid>
            <Grid item style={{ marginTop: '5px' }}>
                <TextField
                    variant="outlined"
                    placeholder="Search..."
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 300 }}
                />
                <Tabs value={statusFilter} onChange={handleTabChange} variant="scrollable">
                    {['All', 'Unfulfilled', 'fulfiled', 'Not paid', 'Open', 'Closed'].map((status) => (
                        <Tab key={status} label={status} value={status} />
                    ))}
                </Tabs>
            </Grid>
            <Grid item xs={12}>
                <TableContainer component={Paper} sx={{ width: '100%' }}>
                    <Table>
                        <TableHead sx={{ background: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>#Order</TableCell>
                                <TableCell>Client</TableCell>
                                <TableCell>Total price</TableCell>
                                <TableCell>Total Item</TableCell>
                                <TableCell>Payment Status</TableCell>
                                <TableCell>Order Status</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell><input type="checkbox" /></TableCell>
                                    <TableCell>
                                        <span
                                            className="order-title"
                                            onClick={() => handleRowClick(order)}
                                            style={{
                                                cursor: 'pointer',
                                                color: '#1976d2', // Blue color
                                                transition: 'color 0.3s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = '#115293'} // Darker blue when hovered
                                            onMouseLeave={(e) => e.target.style.color = '#1976d2'} // Return to original color when not hovered
                                        >
                                            {order.order_no}
                                        </span></TableCell>
                                    <TableCell>{order.buyer_name}</TableCell>
                                    <TableCell>{order.total_items_price}</TableCell>
                                    <TableCell>{order.total_items}</TableCell>
                                    <TableCell>
                                        <span
                                            style={{
                                                backgroundColor: getPaymentStatusColor(order.payment_status),
                                                borderRadius: '4px',
                                                padding: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {order.payment_status}
                                        </span>
                                    </TableCell>
                                    <TableCell>                                    <span
                                        style={{
                                            backgroundColor: getStatusColor(order.order_status),
                                            borderRadius: '4px',
                                            padding: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {order.order_status}
                                    </span>
                                    </TableCell>
                                    <TableCell>{order.quantity || 0}</TableCell>
                                    <TableCell>{formatDate(order.updated_at)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};
