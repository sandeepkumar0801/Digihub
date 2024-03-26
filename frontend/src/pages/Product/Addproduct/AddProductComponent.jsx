import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faTrash, faUpload, faPlus, faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';
import { InputText } from 'primereact/inputtext';
import { Card, CardContent, Typography, IconButton, Button, Dialog, Grid, Paper, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'; // Import Material-UI components
import ReactQuill from 'react-quill'; // Import ReactQuill
import 'react-quill/dist/quill.snow.css';

// Media Component
export const MediaComponent = ({ product, handleImageChange }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleImageChange(file);
    };

    return (
        <div className="media">
            <h4>Media</h4>
            <div className="media-box">
                <label htmlFor="imageUpload">
                    <FontAwesomeIcon icon={faUpload} size="3x" />
                    <p>Upload an image or drag & drop it</p>
                    <input type="file" id="imageUpload" accept="image/*" onChange={handleFileChange} />
                </label>
                {product?.newProduct?.photos && product?.newProduct?.photos.map((photo, index) => (
                    <img key={index} src={photo.image} alt={`Product Image ${index + 1}`} width="100" height="100" />
                ))}
            </div>
        </div>
    );
};

// TitleAndDescriptionComponent
export const TitleAndDescriptionComponent = ({ product, handleFieldChange }) => {
    return (
        <div className="title-description">
            <div>
                <h4>Title</h4>
                <input type="text" value={product?.newProduct?.fields?.title || ''} onChange={handleFieldChange} name="title" />
            </div>
            <div style={{ marginTop: '20px' }}>
                <h4>Description</h4>
                <ReactQuill
                    theme="snow"
                    value={product?.newProduct?.fields?.short_description || product?.newProduct?.fields?.description || ''}
                    onChange={(value) => handleFieldChange({ target: { name: 'description', value } })}
                    style={{ minHeight: '100px', height: '100px', marginBottom: '50px' }}
                />
            </div>
        </div>
    );
};

// Inventory Component
export const InventoryComponent = ({ product, handleFieldChange }) => {
    return (
        <div className="inventory">
            <h4>Inventory</h4>
            <div className="inventory-row">
                <div className="inventory-item">
                    <label htmlFor="price">Price:</label>
                    <input type="text" value={product?.newProduct?.fields?.price || ''} onChange={handleFieldChange} id="price" name="price" />
                </div>
                <div className="inventory-item">
                    <label htmlFor="quantity">Quantity:</label>
                    <input type="text" value={product?.newProduct?.fields?.quantity || ''} onChange={handleFieldChange} id="quantity" name="quantity" />
                </div>
                <div className="inventory-item">
                    <label htmlFor="sku">SKU Code:</label>
                    <input type="text" value={product?.newProduct?.fields?.sku || ''} onChange={handleFieldChange} id="sku" name="sku" />
                </div>
            </div>
            <div className="inventory-row">
                <div className="inventory-item">
                    <label htmlFor="barcode">Barcode:</label>
                    <input type="text" value={product?.newProduct?.fields?.barcode || ''} onChange={handleFieldChange} id="barcode" name="barcode" />
                </div>
                <div className="inventory-item">
                    <label htmlFor="asin">ASIN:</label>
                    <input type="text" value={product?.newProduct?.fields?.asin || ''} onChange={handleFieldChange} id="asin" name="asin" />
                </div>
            </div>
        </div>
    );
};

export const VariantTable = ({ product, handleVariantChange, openDialog }) => {
    return (
        <div className="variant-table">
            <h4>Variants</h4>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <IconButton onClick={() => openDialog(null)} className="manage-icon-button">
                        <FontAwesomeIcon icon={faCog} /><h5>Manage Variant</h5>
                    </IconButton>
                </Grid>
                <Grid item xs={12}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ background: '#f5f5f5' }}>
                                <TableRow>
                                    <TableCell>Variant</TableCell>
                                    <TableCell>Price</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>SKU Code</TableCell>
                                    <TableCell>Barcode</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {product.newProduct.variants.map((variant, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <TextField
                                                type="text"
                                                value={variant?.title || ''}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="text"
                                                value={variant.price || ''}
                                                onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="text"
                                                value={variant.quantity || variant.inventory_quantity || ''}
                                                onChange={(e) => handleVariantChange(index, 'quantity', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="text"
                                                value={variant.sku || ''}
                                                onChange={(e) => handleVariantChange(index, 'sku', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                type="text"
                                                value={variant.barcode || ''}
                                                onChange={(e) => handleVariantChange(index, 'barcode', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="primary" onClick={() => openDialog(index)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </div>
    );
};

export const VariantsComponent = ({ product, handleVariantChange }) => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [variantOptions, setVariantOptions] = useState(['']);
    const [variantValues, setVariantValues] = useState(['']);
    const [options, setOptions] = useState([{ name: '', values: [''] }]);

    const [variants, setVariants] = useState([]);
    const [variantsAdded, setVariantsAdded] = useState(false);
    const [currentVariantIndex, setCurrentVariantIndex] = useState(null);
    const [addOptionCount, setAddOptionCount] = useState(0); // Track the number of times "Add Option" button is clicked

    const openDialog = (index = null) => {
        setDialogVisible(true);
    };

    const closeDialog = () => {
        setDialogVisible(false);
    };
    const addVariantOption = () => {
        if (addOptionCount < 1) { // Allow adding options only twice
            setOptions(prevOptions => [...prevOptions, { name: '', values: [''] }]);
            setAddOptionCount(prevCount => prevCount + 1);
        }
    };

    const handleOptionNameChange = (index, value) => {
        setOptions(prevOptions => {
            const updatedOptions = [...prevOptions];
            updatedOptions[index].name = value;
            return updatedOptions;
        });
    };

    const handleValueChange = (optionIndex, valueIndex, value) => {
        setOptions(prevOptions => {
            const updatedOptions = [...prevOptions];
            updatedOptions[optionIndex].values[valueIndex] = value;
            return updatedOptions;
        });
    };
    // const handleVariantChange = (index, field, value) => {
    //     const updatedVariants = [...variants];
    //     updatedVariants[index][field] = value;
    //     setVariants(updatedVariants);
    // };

    const removeVariantOption = (index) => {
        setOptions(prevOptions => {
            const updatedOptions = [...prevOptions];
            updatedOptions.splice(index, 1);
            return updatedOptions;
        });
    };

    const handleSave = () => {
        const newVariants = [];
        options[0].values.forEach((color) => {
            options[1].values.forEach((size) => {
                const variant = {
                    price: 0,
                    barcode: '',
                    sku: '',
                    quantity: 0,
                    title: `${color} • ${size}`
                };
                newVariants.push(variant);
            });
        });
        handleVariantChange(newVariants, options);
        closeDialog();
        setVariantsAdded(true);
    };

    // Function to add a new value to an option
    const addValue = (optionIndex) => {
        setOptions(prevOptions => {
            const updatedOptions = [...prevOptions];
            updatedOptions[optionIndex].values.push('');
            return updatedOptions;
        });
    };

    // Function to remove a value from an option
    const removeValue = (optionIndex, valueIndex) => {
        setOptions(prevOptions => {
            const updatedOptions = [...prevOptions];
            updatedOptions[optionIndex].values.splice(valueIndex, 1);
            return updatedOptions;
        });
    };

    return (
        <div>
            {(variantsAdded || product.newProduct.variants.length > 0) ? (
                <VariantTable product={product} handleVariantChange={handleVariantChange} openDialog={openDialog} />
            ) : (
                <div className="variant-box">
                    <button className="add-variant-button" onClick={openDialog}>
                        <FontAwesomeIcon icon={faPlus} /> Add your first variant
                    </button>
                </div>
            )}
            <Dialog open={dialogVisible} onClose={closeDialog} fullWidth maxWidth="sm">
                <div className="dialog-content">
                    <div className="title-bar">
                        <Typography variant="h6" className="title">Manage Variants</Typography>
                        <IconButton onClick={closeDialog} className="cancel-button">
                            <FontAwesomeIcon icon={faTimes} />
                        </IconButton>
                    </div>
                    <div className="current-variants">
                        <Typography variant="body1">Your current variants</Typography>
                    </div>
                    <div className="option-fields">
                        {options.map((option, optionIndex) => (
                            <Card key={optionIndex} className="option-card">
                                <CardContent>
                                    <Typography variant="subtitle1">Option name</Typography>
                                    <TextField
                                        className='MuiInputBase-input'
                                        value={option.name}
                                        onChange={(e) => handleOptionNameChange(optionIndex, e.target.value)}
                                        placeholder="Add Option name"
                                    />
                                    <IconButton onClick={() => removeVariantOption(optionIndex)} className="delete-option-button">
                                        <FontAwesomeIcon icon={faTrash} className="delete-icon" />
                                    </IconButton>
                                    <Grid container alignItems="center">
                                        <Grid item xs={12}>
                                            {option.values.map((value, valueIndex) => (
                                                <div key={valueIndex} className="option-value">
                                                    <Typography variant="subtitle1">Option value</Typography>
                                                    <TextField
                                                        className='MuiInputBase-input'
                                                        value={value}
                                                        onChange={(e) => handleValueChange(optionIndex, valueIndex, e.target.value)}
                                                        placeholder="Add Option Value"
                                                    />
                                                    <IconButton onClick={() => removeValue(optionIndex, valueIndex)} className="delete-value-button">
                                                        <FontAwesomeIcon icon={faTrash} className="delete-icon" />
                                                    </IconButton>
                                                </div>
                                            ))}
                                        </Grid>
                                        <Grid item className="center-icon">
                                            <IconButton onClick={() => addValue(optionIndex)} className="add-value-button">
                                                <FontAwesomeIcon icon={faPlus} />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    <div className="button-group">
                        <Button onClick={addVariantOption} variant="contained" color="primary" className="add-option-button">
                            <FontAwesomeIcon icon={faPlus} />
                            Add an Option
                        </Button>
                        <Button onClick={handleSave} variant="contained" color="primary" className="save-button">
                            Save
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};


// Organize & Classify Component
export const OrganizeAndClassifyComponent = ({ product, handleFieldChange }) => {
    return (
        <div className="organize-and-classify">
            <h4>Organize & Classify</h4>
            <div className="row">
                <div className="column">
                    <label htmlFor="brand">Brand:</label>
                    <input type="text" id="brand" name="brand" value={product.newProduct.fields.brand || ''} onChange={handleFieldChange} />
                </div>
                <div className="column">
                    <label htmlFor="category">Category:</label>
                    <input type="text" id="category" name="categories" value={product.newProduct.fields.categories || ''} onChange={handleFieldChange} />
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <label htmlFor="tags">Tags:</label>
                    <input type="text" id="tags" name="tags" value={product.newProduct.fields.tags || ''} onChange={handleFieldChange} />
                </div>
            </div>
        </div>
    );
};

// Weight & Dimensions Component
export const WeightAndDimensionsComponent = ({ product, handleFieldChange }) => {
    const [selectedDimensionUnit, setSelectedDimensionUnit] = useState(product.newProduct.fields.dimensions.unit || '');
    const [selectedWeightUnit, setWeightSelectedUnit] = useState(product.newProduct.fields.weight.unit || '');

    const handleDimensionChange = (e) => {
        const { name, value } = e.target;
        const updatedDimensions = {
            ...product.newProduct.fields.dimensions,
            [name]: value
        };
        handleFieldChange({
            target: {
                name: 'dimensions',
                value: updatedDimensions
            }
        });
    };

    const handleUnitChange = (e) => {
        const selectedUnitValue = e.target.value;
        setSelectedDimensionUnit(selectedUnitValue);
        handleFieldChange({
            target: {
                name: 'dimensions',
                value: {
                    ...product.newProduct.fields.dimensions,
                    unit: selectedUnitValue
                }
            }
        });
    };

    const handleWeightUnitChange = (e) => {
        const selectedUnitValue = e.target.value;
        setWeightSelectedUnit(selectedUnitValue);
        handleFieldChange({
            target: {
                name: 'weight',
                value: {
                    ...product.newProduct.fields.weight,
                    unit: selectedUnitValue
                }
            }
        });
    };

    return (
        <div className="weight-and-dimensions">
            <h4>Weight & Dimensions</h4>
            <div className="row">
                <div className="column">
                    <label htmlFor="weight">Weight:</label>
                    <div className="dimensions-input">
                        <input type="text" id="weight" name="weight" value={product.newProduct.fields.weight} onChange={handleFieldChange} />
                        <select name="unit" value={selectedWeightUnit} onChange={handleWeightUnitChange}>
                            <option value="">Select Unit</option>
                            <option value="pounds" selected={selectedWeightUnit === "pounds"}>Pounds</option>
                            <option value="grams" selected={selectedWeightUnit === "grams"}>Grams</option>
                            <option value="kilograms" selected={selectedWeightUnit === "kilograms"}>Kilograms</option>
                        </select>
                    </div>
                </div>
                <div className="column">
                    <label>Dimensions:</label>
                    <div className="dimensions-input">
                        <input type="text" id="width" name="width" placeholder="Width" value={product.newProduct.fields.dimensions.width} onChange={handleDimensionChange} />
                        <input type="text" id="height" name="height" placeholder="Height" value={product.newProduct.fields.dimensions.height} onChange={handleDimensionChange} />
                        <input type="text" id="length" name="length" placeholder="Length" value={product.newProduct.fields.dimensions.length} onChange={handleDimensionChange} />
                        <select name="unit" value={selectedDimensionUnit} onChange={handleUnitChange}>
                            <option value="">Select Unit</option>
                            <option value="inches" selected={selectedDimensionUnit === "inches"}>Inches</option>
                            <option value="feet" selected={selectedDimensionUnit === "feet"}>Feet</option>
                            <option value="yards" selected={selectedDimensionUnit === "yards"}>Yards</option>
                            <option value="millimeters" selected={selectedDimensionUnit === "millimeters"}>Millimeters</option>
                            <option value="centimeters" selected={selectedDimensionUnit === "centimeters"}>Centimeters</option>
                            <option value="meters" selected={selectedDimensionUnit === "meters"}>Meters</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};