import React, { useState, useEffect, useRef } from 'react';
import { getExportProducts } from '../../api/products';
import { read, utils, writeFile } from "xlsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImport, faDownload } from '@fortawesome/free-solid-svg-icons';

import {
    Button,
    Toolbar,
    TextField,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Grid,
    TableSortLabel,
    Tabs,
    Tab,
    InputAdornment,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText
} from '@mui/material';
import {
    SaveAlt as SaveAltIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    CloudUpload as CloudUploadIcon,
    Add as AddIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ProductList = ({ products }) => {
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [orderBy, setOrderBy] = useState(null);
    const [order, setOrder] = useState('asc');
    const [tabValue, setTabValue] = useState('All'); // Default to 'All' tab
    const [channelDetails, setChannelDetails] = useState([]);
    const [isChannelPublishedDialogOpen, setIsChannelPublishedDialogOpen] = useState(false);
    const [isChannelUnpublishedDialogOpen, setIsChannelUnpublishedDialogOpen] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [checkedNotes, setCheckedNotes] = useState(false);
    const [importButtonDisabled, setImportButtonDisabled] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteSku, setDeleteSku] = useState('');

    const tabs = ["All", "Active", "Archived", "Draft", "Published", "Unpublished"];

    const handleRowClick = (product) => {
        navigate(`/products/edit/${product.sku}`);
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleFileChange = () => {
        if (fileInputRef.current && fileInputRef.current.files.length > 0) {
            setImportButtonDisabled(false);
        } else {
            setImportButtonDisabled(true);
        }
    };

    const hideUploadDialog = () => {
        setShowImportDialog(false);
    }

    // Function to push products to the server
    const pushProducts = async rows => {
        try {
            var storedGroupCode = localStorage.getItem("groupCode");
            await axios.post(
                `${process.env.REACT_APP_BASE_URL}/common/api/push_shopify_product_varient_in_bulk?fby_user_id=${storedGroupCode}`,
                rows,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: process.env.REACT_APP_ACCESS_TOKEN
                    }
                }
            );
        } catch (err) {
            console.log(err.message);
        }
    };

    const handleBulkImport = () => {
        if (!importButtonDisabled) {
            const file = fileInputRef.current.files[0];
            // if (file) {
            //     onFileChange(file);
            //     setShowImportDialog(false);
            // }
            // const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async event => {
                    const wb = read(event.target.result);
                    const sheets = wb.SheetNames;
                    if (sheets.length) {
                        const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
                        await pushProducts(rows);
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        }
    };

    const exportSampleFileDownload = async () => {
        const wb = utils.book_new();
        const ws = utils.json_to_sheet([]);
        let headings = [["id", "title", "description", "option_1_name", "option_1_value", "option_2_name", "option_2_value",
            "sku", "gtin", "asin", "quantity", "price", "image_link", "brand", "tags", "category", "weight", "weight_unit", "height", "width",
            "length", "dimensions_units"
        ]];
        let data = [];
        utils.sheet_add_aoa(ws, headings);
        utils.sheet_add_json(ws, data, { origin: 'A2', skipHeader: true });
        utils.book_append_sheet(wb, ws, 'Report');
        writeFile(wb, `productSample.csv`);
    };


    const handleExport = async () => {
        const wb = utils.book_new();
        const ws = utils.json_to_sheet([]);
        let headings = [["id", "title", "description", "option_1_name", "option_1_value", "option_2_name", "option_2_value",
            "sku", "gtin", "asin", "quantity", "price", "image_link", "brand", "tags", "category", "weight", "weight_unit", "height", "width",
            "length", "dimensions_units"
        ]];
        let data = [];
        try {
            utils.sheet_add_aoa(ws, headings);
            data = await getExportProducts();

        } catch (error) {
            data = [];
            console.error('Error fetching products:', error);

        }
        utils.sheet_add_json(ws, data, { origin: 'A2', skipHeader: true });
        utils.book_append_sheet(wb, ws, 'Report');
        writeFile(wb, `product.csv`);
    };

    const handleImport = () => {
        setShowImportDialog(true)
    };

    const handleAddProduct = () => {
        navigate('/products/edit');
    };

    const openDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteSkuChange = (event) => {
        setDeleteSku(event.target.value);
    };

    // Function to close the delete confirmation dialog
    const closeDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
    };

    const handleChannelClick = async (row) => {
        if (row.channel_status == 'published') {
            setIsChannelPublishedDialogOpen(true)
        } else {
            setIsChannelUnpublishedDialogOpen(true)
        }
        try {
            var storedGroupCode = localStorage.getItem("groupCode");
            const res = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/common/api/get_product?fby_user_id=${storedGroupCode}&sku=${row.sku}&isCreated=true`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: process.env.REACT_APP_ACCESS_TOKEN
                    }
                }
            );
            if (res.data.length > 0) {
                setChannelDetails(res.data);
                setIsChannelPublishedDialogOpen(true);
            } else {
                setChannelDetails([]);
                setIsChannelUnpublishedDialogOpen(true);
            }

        } catch (error) {
            console.error('Error fetching channel details:', error);
            setChannelDetails([]);
            setIsChannelUnpublishedDialogOpen(true);
        }
    };


    const handleAddTab = () => {
        console.log("Add new tab functionality goes here");
    };

    const createSortHandler = (property) => () => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const filteredProducts = products.filter(product => {
        const searchFields = ['title', 'status', 'sku', 'inventory_quantity', 'price', 'channel', 'created_at'];
        return searchFields.some(field =>
            product[field] && product[field].toString().toLowerCase().includes(searchText.toLowerCase())
        );
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (orderBy) {
            const comparison = a[orderBy].localeCompare(b[orderBy]);
            return order === 'asc' ? comparison : -comparison;
        }
        return 0;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return '#b9e5a4'; // Slightly darker green color for active status
            case 'archived':
                return '#e0e0e0'; // Slightly darker gray color for archived status
            case 'draft':
                return '#ffcc80'; // Slightly darker orange color for draft status
            default:
                return 'white'; // Default light color for other statuses
        }
    };

    const getChannelStatusColor = (status) => {
        switch (status) {
            case 'published':
                return '#b9e5a4';
            default:
                return '#e0e0e0';
        }
    }

    const renderProductsByStatus = (status) => {
        let filteredProduct = sortedProducts;
        if (status !== 'All') {
            if (status === 'Published') {
                filteredProduct = filteredProduct.filter(product => product.channel_status === 'published');
            } else if (status === 'Unpublished') {
                filteredProduct = filteredProduct.filter(product => product.channel_status !== 'published');
            } else {
                filteredProduct = filteredProduct.filter(product => product.status === status.toLowerCase());
            }
        }
        return filteredProduct;
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

    const getQuantityString = (row) => {
        if (row.count == 0) {
            return row.quantity || 0;
        } else {
            return (
                <span>
                    {row.quantity || ''}<br />
                    <span style={{ color: '#aaa' }}>{' ' + row.count || ''} variants</span>
                </span>
            );
        }
    }

    const handleDelete = async () => {
        closeDeleteDialog(); // Close the delete confirmation dialog

        try {
            var storedGroupCode = localStorage.getItem("groupCode");
            await axios.post(
                `${process.env.REACT_APP_BASE_URL}/common/api/delete_shopify_product?fby_user_id=${storedGroupCode}&sku=${deleteSku}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: process.env.REACT_APP_ACCESS_TOKEN
                    }
                }
            );
            // After successful deletion, you might want to refresh the product list
            handleRefresh();
        } catch (error) {
            console.error('Error deleting product:', error);
            // Handle error, display an error message, or take appropriate action
        }
    };

    return (
        <>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Toolbar>
                        <DialogTitle><b>Product List</b></DialogTitle>
                        <div style={{ marginLeft: 'auto' }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddProduct}
                                style={{ backgroundColor: '#1976d2', color: '#fff', marginLeft: '8px' }}
                            >
                                Add Product
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon />}
                                onClick={handleRefresh}
                                style={{ backgroundColor: '#2196f3', marginLeft: '8px' }}
                            >
                                Refresh
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveAltIcon />}
                                onClick={handleExport}
                                style={{ backgroundColor: '#4caf50', marginLeft: '8px' }}
                            >
                                Export
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                onClick={handleImport}
                                style={{ backgroundColor: '#f44336', marginLeft: '8px' }}
                            >
                                Import
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<DeleteIcon />}
                                onClick={openDeleteDialog}
                                style={{ backgroundColor: '#f44336', marginLeft: '8px' }}
                            >
                                Delete
                            </Button>
                        </div>
                    </Toolbar>
                </Grid>
                <Grid item xs={12}>
                    <div style={{ marginLeft: 'auto' }}>
                        <TextField
                            variant="outlined"
                            placeholder="Search..."
                            onChange={(e) => setSearchText(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                style: { borderRadius: '2px' }
                            }}
                            sx={{ width: 300 }}  // Adjust the width as needed
                        />
                        <Tabs
                            value={tabValue}
                            onChange={(e, newValue) => setTabValue(newValue)}
                            aria-label="product-tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                        >
                            {tabs.map(tab => (
                                <Tab key={tab} label={tab} value={tab} />
                            ))}
                            <Tab
                                icon={<AddIcon />}
                                aria-label="add-tab"
                                onClick={handleAddTab}
                            />
                        </Tabs>
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <TableContainer component={Paper} sx={{ width: '100%' }}>
                        <Table>
                            <TableHead sx={{ background: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell></TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'title'}
                                            direction={orderBy === 'title' ? order : 'asc'}
                                            onClick={createSortHandler('title')}
                                        >
                                            Product
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Product Status</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={orderBy === 'sku'}
                                            direction={orderBy === 'sku' ? order : 'asc'}
                                            onClick={createSortHandler('sku')}
                                        >
                                            SKU
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Channel Status</TableCell>
                                    <TableCell>Updated</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {renderProductsByStatus(tabValue).map((product) => (
                                    <TableRow key={product.id} style={{ cursor: 'pointer' }}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedProducts.includes(product)}
                                                onChange={() => {
                                                    if (selectedProducts.includes(product)) {
                                                        setSelectedProducts(selectedProducts.filter(item => item !== product));
                                                    } else {
                                                        setSelectedProducts([...selectedProducts, product]);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className="product-title"
                                                onClick={() => handleRowClick(product)}
                                                style={{
                                                    cursor: 'pointer',
                                                    color: '#1976d2', // Blue color
                                                    transition: 'color 0.3s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.color = '#115293'} // Darker blue when hovered
                                                onMouseLeave={(e) => e.target.style.color = '#1976d2'} // Return to original color when not hovered
                                            >
                                                {product.title}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span style={{ backgroundColor: getStatusColor(product.status), borderRadius: '4px', padding: '4px' }}>
                                                {product.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>{getQuantityString(product)}</TableCell>
                                        <TableCell>{product.variantPrice ? product.variantPrice : product.price}</TableCell>
                                        <TableCell>
                                            <span
                                                style={{
                                                    backgroundColor: getChannelStatusColor(product.channel_status),
                                                    borderRadius: '4px',
                                                    padding: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={handleChannelClick}
                                            >
                                                {product.channel_status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{formatDate(product.updated_at)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
                <Dialog open={isChannelPublishedDialogOpen} onClose={() => setIsChannelPublishedDialogOpen(false)}>
                    <DialogTitle>Published Channel Details</DialogTitle>
                    <DialogContent>
                        {'Display Published channel details here'}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsChannelPublishedDialogOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={isChannelUnpublishedDialogOpen} onClose={() => setIsChannelUnpublishedDialogOpen(false)}>
                    <DialogTitle>Unpublished Channel Details</DialogTitle>
                    <DialogContent>
                        {'Display Unpublished channel details here'}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsChannelUnpublishedDialogOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Grid>
            <Dialog open={showImportDialog} onHide={hideUploadDialog}>
                <div className="upload-dialog-content">
                    <h2>Import Products</h2>
                    <div className="upload-options">
                        <div className="local-upload">
                            <div class="drag-drop-box">
                                <input id="file-upload" type="file" class="file-upload-input" ref={fileInputRef} onChange={handleFileChange} accept=".csv" />
                                <label for="file-upload" class="file-upload-label">
                                    <span class="plus-icon">+</span>
                                    <span class="drag-drop-text">
                                        <FontAwesomeIcon icon={faFileImport} className="upload-icon" />
                                        Upload a CSV file or Drag & Drop it
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="template-download" onClick={exportSampleFileDownload}>
                            <a href="#" className="download-template">
                                <FontAwesomeIcon icon={faDownload} className="download-icon" />
                                Download Template
                            </a>
                        </div>
                    </div>
                    <div className="import-notes">
                        <input type="checkbox" id="show-notes" checked={checkedNotes} onChange={() => setCheckedNotes(!checkedNotes)} />
                        <p>
                            Prior to importing your products, please ensure that you have assigned a unique SKU code to each product or variant.
                            Digihub will link products with matching SKU codes. The duration of the import process may vary based on the quantity of products
                            and their associated images. Please be aware that this operation cannot be paused or interrupted.
                        </p>

                    </div>
                    <Button className="submit-button" onClick={handleBulkImport} disabled={!(!importButtonDisabled && checkedNotes)}>
                        Import Products
                    </Button>
                    <Button onClick={hideUploadDialog} style={{ marginLeft: '5px' }} variant="contained" color="secondary">
                        Cancel
                    </Button>
                </div>
            </Dialog>
            <Dialog open={isDeleteDialogOpen} onClose={closeDeleteDialog}>
                <DialogTitle>Delete Product</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter the SKU of the product you want to delete:
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="sku"
                        label="SKU"
                        type="text"
                        fullWidth
                        value={deleteSku}
                        onChange={handleDeleteSkuChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDelete} color="primary">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>

    );
};
