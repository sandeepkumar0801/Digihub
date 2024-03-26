import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, TextField, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Menu, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { NavBar } from '../../../components/Navbar/Navbar';
import { Sidebar } from '../../../components/SidePanel/Sidebar';
import { useParams, useNavigate } from 'react-router-dom';

export const AddNewOrder = () => {
    const navigate = useNavigate();
    const { orderNo } = useParams()
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address1: '',
        city: '',
        province: '',
        country: '',
        zip: '',
    })
    const [responseData, setResponseData] = useState([]);
    const [paymentStatus, setPaymentStatus] = useState('Pending');
    const [totalPayment, setTotalPayment] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [openCustomerDialog, setOpenCustomerDialog] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [customerAndShippingDetails, setCustomerAndShippingDetails] = useState(null);
    const [orderStatus, setOrderStatus] = useState('fulfilled');
    const [openTrackingDialog, setOpenTrackingDialog] = useState(false);
    const [channelOrderId, setChannelOrderId] = useState('');
    const [originalChannelOrderId, setOriginalChannelOrderId] = useState('');
    const [channelCode, setChannelCode] = useState('');
    const [skuEan, setSkuEan] = useState('');
    const [skuCode, setSkuCode] = useState('');
    const [tracking, setTracking] = useState('');
    const [shipmentDate, setShipmentDate] = useState('');
    const [carrier, setCarrier] = useState('');
    const [shipUrl, setShipUrl] = useState('');
    const [isReturn, setIsReturn] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (orderNo) {
                    // Fetch order details if orderNo exists
                    var storedGroupCode = localStorage.getItem("groupCode");
                    const resDetails = await axios.post(
                        `${process.env.REACT_APP_BASE_URL}/common/api/get_order_detail?fby_user_id=${storedGroupCode}`,
                        { order_no: orderNo },
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: process.env.REACT_APP_ACCESS_TOKEN
                            }
                        }
                    );
                    if (resDetails.data.success) {
                        setResponseData(resDetails.data.success.data);
                        const responseData = resDetails.data.success.data.map(element => ({
                            id: element.id,
                            title: element.product_name,
                            image: element.image, // Assuming there's an image property in the response
                            price: element.item_total_price,
                            quantity: element.quantity_purchased,
                            total_tax: element.item_tax,
                            line_item_id: element.order_line_item_id,
                            order_status: element.order_status,
                            payment_status: element.payment_status
                        }));
                        if (responseData.length > 0) {
                            setSelectedProducts(responseData.map(item => item)); // Update here
                            setOrderStatus(responseData[0].order_status)
                            setPaymentStatus(responseData[0].payment_status)
                        }
                        const shipData = resDetails.data.success.data.map(element => ({
                            first_name: element.recipient_name,
                            last_name: '',
                            email: element.buyer_email,
                            phone: element.ship_phone_number,
                            address1: element.ship_address_1,
                            city: element.ship_city,
                            province: element.ship_state_code,
                            country: element.ship_country,
                            zip: element.ship_postal_code,
                        }));
                        // Set the customer and shipping details
                        setCustomerAndShippingDetails(shipData[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [orderNo]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (product) => {
        setSelectedProducts(prevState => {
            if (!prevState.includes(product)) {
                return [...prevState, product];
            } else {
                return prevState.filter(item => item !== product);
            }
        });
    };

    const handleBrowse = async () => {
        try {
            var storedGroupCode = localStorage.getItem("groupCode");

            const res = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/common/api/get_all_product_varient?fby_user_id=${storedGroupCode}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: process.env.REACT_APP_ACCESS_TOKEN
                    }
                }
            );
            if (res.data.success.data.length > 0) {
                const responseData = res.data.success.data.map(element => ({
                    id: element.id,
                    title: element.title,
                    body_html: element.description,
                    image: element.image, // Assuming there's an image property in the response
                    price: element.price,
                    quantity: element.inventory_quantity,
                }));
                setProducts(responseData);
                setOpenDialog(true);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Function to handle tracking submit
    const handleTrackingSubmit = async () => {
        try {
            // Make API call to update tracking
            const response = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/common/api/push_tracking`,
                {
                    channelOrderId: channelOrderId,
                    originalChannelOrderId: originalChannelOrderId,
                    channelCode: channelCode,
                    skuEan: skuEan,
                    skuCode: skuCode,
                    tracking: tracking,
                    shipmentDate: shipmentDate,
                    carrier: carrier,
                    shipUrl: shipUrl,
                    isReturn: isReturn
                }
            );
            // Handle success response
            console.log(response.data);
        } catch (error) {
            // Handle error
            console.error('Error updating tracking:', error);
        }
    };


    const handleSaveSelectedProducts = () => {
        setSelectedProducts(selectedProducts);

        // You can save the selected products to a state or perform any other required action here
        // For example, you can update a state with the selected products
        const selectedProductsData = selectedProducts.map(productId => {
            return products.find(product => product.id === productId);
        });
        // Do something with the selected products data, for example:
        console.log('Selected products:', selectedProductsData);

        setOpenDialog(false);
    };

    const handleSaveCustomerDetails = () => {
        // Save the entered customer and shipping details
        const newCustomerAndShippingDetails = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            address1: formData.address1,
            city: formData.city,
            province: formData.province,
            country: formData.country,
            zip: formData.zip,
        };

        // Set the customer and shipping details
        setCustomerAndShippingDetails(newCustomerAndShippingDetails);

        // Close the customer dialog
        setOpenCustomerDialog(false);
    };

    const handleSave = async () => {
        try {
            // Prepare the data for the request
            const requestData = {
                line_items: selectedProducts.map(productId => {
                    const product = products.find(product => product.id === productId);
                    return {
                        variant_id: product.id,
                        quantity: product.quantity || 1, // Assuming quantity property
                    };
                }),
                customer: {
                    first_name: customerAndShippingDetails.first_name,
                    last_name: customerAndShippingDetails.last_name,
                    email: customerAndShippingDetails.email,
                },
                billing_address: {
                    first_name: customerAndShippingDetails.first_name,
                    last_name: customerAndShippingDetails.last_name,
                    address1: customerAndShippingDetails.address1,
                    city: customerAndShippingDetails.city,
                    province: customerAndShippingDetails.province,
                    country: customerAndShippingDetails.country,
                    zip: customerAndShippingDetails.zip,
                    phone: customerAndShippingDetails.phone,
                },
                shipping_address: {
                    first_name: formData.shipping_first_name,
                    last_name: formData.shipping_last_name,
                    address1: formData.address1,
                    city: formData.city,
                    province: formData.province,
                    country: formData.country,
                    zip: formData.zip,
                    phone: formData.shipping_phone,
                },
                email: customerAndShippingDetails.email,
                transactions: [
                    {
                        kind: "sale", // Assuming the transaction kind
                        status: "success", // Assuming the transaction status
                        amount: totalPayment, // Assuming the total payment amount
                    }
                ],
                financial_status: paymentStatus,
            };

            var storedGroupCode = localStorage.getItem("groupCode");

            // Make the POST request
            const res = await axios({
                url: `${process.env.REACT_APP_BASE_URL}/common/api/create_shopify_order/?fby_user_id=${storedGroupCode}`,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: process.env.REACT_APP_ACCESS_TOKEN
                },
                data: requestData,
            });

            console.log(res);
            if (res.data.success) {
                // Handle success
            }
        } catch (error) {
            console.error('Error saving Order:', error);
        }
    };


    const handleAddCustomerAndShipping = () => {
        setOpenCustomerDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleCustomerCloseDialog = () => {
        setOpenCustomerDialog(false);
    };
    const handlePaymentClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePaymentClose = () => {
        setAnchorEl(null);
    };

    const handlePaymentMethod = (method) => {
        setPaymentMethod(method);
        setAnchorEl(null);
        if (method === 'Mark as Paid') {
            setPaymentStatus('Paid');
        }
    };

    const handleLineItemClick = (lineItemId) => {
        navigate(`/orderMaster/${orderNo}/orderDetails/${lineItemId}`);
    };


    useEffect(() => {
        // Calculate total payment with tax
        let totalPrice = 0;
        for (const product of selectedProducts) {
            // Calculate total price based on selected products
            totalPrice += product.item_total_price || 0; // Assuming quantity property
        }
        // Set total payment with tax
        setTotalPayment(totalPrice); // Assuming tax is 10%
    }, [selectedProducts]);

    const handleBack = () => {
        navigate(-1);
    };

    const handleButtonClick = () => {
        setOpenTrackingDialog(true);
    };

    // Function to handle tracking dialog close
    const handleTrackingDialogClose = () => {
        setOpenTrackingDialog(false);
    };

    return (
        <>
            <NavBar selectedSidebarItem="products" />
            <Sidebar />
            <Grid container spacing={3} style={{ marginTop: '45px', marginLeft: '255px' }}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom style={{ display: 'flex', alignItems: 'center' }}>
                        <ArrowBackIcon onClick={handleBack} />

                        <span style={{ fontSize: '1.2rem', marginLeft: 8 }}>Order</span>
                        <Button variant="contained" color="primary" style={{ marginLeft: 'auto' }} onClick={handleSave}>Save</Button>
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            {(!orderNo) && (
                                <Typography variant="h5" component="h2" style={{ marginBottom: 10 }}>Product</Typography>
                            )}
                            <div style={{ display: 'flex' }}>
                                {(!orderNo) && (
                                    <>
                                        <TextField
                                            label="Search Product"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            InputProps={{
                                                endAdornment: (
                                                    <IconButton color="primary" aria-label="search" size="small">
                                                        <SearchIcon />
                                                    </IconButton>
                                                ),
                                            }}
                                        />
                                        <Button variant="outlined" style={{ marginLeft: 10, fontSize: '0.8rem' }} size="small" onClick={handleBrowse}>Browse</Button>
                                    </>
                                )}
                            </div>
                        </Grid>
                        {(selectedProducts.length > 0) && (
                            <Grid item xs={12}>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead sx={{ background: '#f5f5f5' }}>
                                            <TableRow>
                                                <TableCell>Image</TableCell>
                                                <TableCell>Title</TableCell>
                                                <TableCell>Quantity</TableCell>
                                                <TableCell>Price</TableCell>
                                                {(orderNo) && (
                                                    <TableCell>Line Order Id</TableCell>
                                                )}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedProducts.map(newproduct => {                                            // Add a null check for the image property
                                                return (
                                                    <TableRow key={newproduct.id}>
                                                        <TableCell><img src={(newproduct.image || '')} alt={newproduct.title} style={{ maxWidth: '100px' }} /></TableCell>
                                                        <TableCell>{newproduct.title || ''}</TableCell>
                                                        <TableCell>{newproduct.quantity || 0}</TableCell>
                                                        <TableCell>{newproduct.price || 0}</TableCell>
                                                        {orderNo &&
                                                            (<TableCell>
                                                                <Button onClick={() => handleLineItemClick(newproduct.line_item_id)}>{newproduct.line_item_id}</Button>
                                                            </TableCell>)
                                                        }
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>

                                    </Table>
                                </TableContainer>
                            </Grid>
                        )}

                    </Grid>
                    {/* Payment Information Card */}
                    <Grid container spacing={3} style={{ marginTop: '20px', marginLeft: '5px' }}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" component="h4">Payment</Typography>
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell>Payment Status:</TableCell>
                                                <TableCell>{paymentStatus}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                {orderStatus !== 'unfulfilled' && orderStatus !== 'partially fulfilled' ? (
                                                    <>
                                                        <TableCell>
                                                            <Button variant="outlined" color="primary" onClick={handlePaymentClick}>
                                                                Collect Payment
                                                            </Button>
                                                            <Menu
                                                                anchorEl={anchorEl}
                                                                open={Boolean(anchorEl)}
                                                                onClose={handlePaymentClose}
                                                            >
                                                                <MenuItem onClick={() => handlePaymentMethod('Enter Credit Card')}>Enter Credit Card</MenuItem>
                                                                <MenuItem onClick={() => handlePaymentMethod('Mark as Paid')}>Mark as Paid</MenuItem>
                                                            </Menu>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button variant="outlined" color="primary">
                                                                Send Invoice
                                                            </Button>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <TableCell>
                                                        <Button variant="outlined" color="primary" onClick={handleButtonClick}>
                                                            Add Tracking
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>

                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={3} style={{ marginTop: '80px' }}>
                    {customerAndShippingDetails ? (
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h2" style={{ fontSize: '1.2rem' }}>Customer and Shipping Details:</Typography>
                                <Typography variant="body1" gutterBottom>Name: {customerAndShippingDetails.first_name}</Typography>
                                <Typography variant="body1" gutterBottom>Email: {customerAndShippingDetails.email}</Typography>
                                <Typography variant="body1" gutterBottom>Phone: {customerAndShippingDetails.phone}</Typography>
                                <Typography variant="body1" gutterBottom>Address: {customerAndShippingDetails.address1}</Typography>
                                <Typography variant="body1" gutterBottom>City: {customerAndShippingDetails.city}</Typography>
                                <Typography variant="body1" gutterBottom>Province: {customerAndShippingDetails.province}</Typography>
                                <Typography variant="body1" gutterBottom>Country: {customerAndShippingDetails.country}</Typography>
                                <Typography variant="body1" gutterBottom>ZIP: {customerAndShippingDetails.zip}</Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="h2" style={{ fontSize: '0.8rem' }}><h5>Add Customer and Shipping Details</h5>
                                    <Button variant="contained" color="primary" onClick={handleAddCustomerAndShipping} style={{ fontSize: '0.8rem', marginLeft: '5px' }}>Add</Button>
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
                <Dialog open={openCustomerDialog} onClose={handleCustomerCloseDialog}>
                    <DialogTitle>Customer and Shipping Details</DialogTitle>
                    <DialogContent>
                        {/* Customer Data */}
                        <Typography variant="h6" gutterBottom>Customer Data</Typography>
                        <TextField
                            label="First Name"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.first_name}
                            name="first_name"
                            onChange={handleChange}
                        />
                        <TextField
                            label="Last Name"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.last_name}
                            name="last_name"
                            onChange={handleChange}
                        />
                        <TextField
                            label="Email"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.email}
                            name="email"
                            onChange={handleChange}
                        />
                        <TextField
                            label="Phone"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.phone}
                            name="phone"
                            onChange={handleChange}
                        />

                        {/* Shipping Data */}
                        <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>Shipping Address</Typography>
                        <TextField
                            label="First Name"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.shipping_first_name}
                            name="shipping_first_name"
                            onChange={handleChange}
                        />
                        <TextField
                            label="Last Name"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.shipping_last_name}
                            name="shipping_last_name"
                            onChange={handleChange}
                        />
                        <TextField
                            label="Address"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.address1}
                            name="address1"
                            onChange={handleChange}
                        />
                        <TextField
                            label="Phone"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.shipping_phone}
                            name="shipping_phone"
                            onChange={handleChange}
                        />
                        <TextField
                            label="City"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.city}
                            name="city"
                            onChange={handleChange}
                        />
                        <TextField
                            label="Province"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.province}
                            name="province"
                            onChange={handleChange}
                        />
                        <TextField
                            label="Country"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.country}
                            name="country"
                            onChange={handleChange}
                        />
                        <TextField
                            label="ZIP"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={formData.zip}
                            name="zip"
                            onChange={handleChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSaveCustomerDetails} color="primary">Save</Button>
                        <Button onClick={handleCustomerCloseDialog} color="primary">Close</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Select Products</DialogTitle>
                    <DialogContent>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableBody>
                                    {products.map(product => (
                                        <TableRow key={product.id}>
                                            <TableCell><img src={product.image || ''} alt={product.title} style={{ maxWidth: '100px' }} /></TableCell>
                                            <TableCell>{(product.title || '')}</TableCell>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProducts.some(item => item.id === product.id)}
                                                    onChange={() => handleCheckboxChange(product)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleSaveSelectedProducts} color="primary">Save</Button>
                        <Button onClick={handleCloseDialog} color="primary">Close</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openTrackingDialog} onClose={handleTrackingDialogClose}>
                    <DialogTitle>Add Tracking</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Channel Order Id"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={channelOrderId}
                            onChange={(e) => setChannelOrderId(e.target.value)}
                        />
                        <TextField
                            label="Original Channel Order Id"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={originalChannelOrderId}
                            onChange={(e) => setOriginalChannelOrderId(e.target.value)}
                        />
                        <TextField
                            label="Channel Code"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={channelCode}
                            onChange={(e) => setChannelCode(e.target.value)}
                        />
                        <TextField
                            label="SKU EAN"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={skuEan}
                            onChange={(e) => setSkuEan(e.target.value)}
                        />
                        <TextField
                            label="SKU Code"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={skuCode}
                            onChange={(e) => setSkuCode(e.target.value)}
                        />
                        <TextField
                            label="Tracking"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={tracking}
                            onChange={(e) => setTracking(e.target.value)}
                        />
                        <TextField
                            label="Shipment Date"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={shipmentDate}
                            onChange={(e) => setShipmentDate(e.target.value)}
                        />
                        <TextField
                            label="Carrier"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                        />
                        <TextField
                            label="Ship URL"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={shipUrl}
                            onChange={(e) => setShipUrl(e.target.value)}
                        />
                        <TextField
                            label="Is Return"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={isReturn}
                            onChange={(e) => setIsReturn(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleTrackingSubmit} color="primary">Submit</Button>
                        <Button onClick={handleTrackingDialogClose} color="primary">Cancel</Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </>
    );
};
