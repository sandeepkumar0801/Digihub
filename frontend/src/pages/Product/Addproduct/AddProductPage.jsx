import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { NavBar } from '../../../components/Navbar/Navbar';
import { Sidebar } from '../../../components/SidePanel/Sidebar.jsx';
import { MediaComponent, InventoryComponent, VariantTable, OrganizeAndClassifyComponent, WeightAndDimensionsComponent, VariantsComponent, TitleAndDescriptionComponent } from './AddProductComponent.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faUpload } from '@fortawesome/free-solid-svg-icons';
import './addProductPage.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, Dialog, Grid, Paper, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'; // Import Material-UI components


export const AddProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [dialogVisible, setDialogVisible] = useState(false); // Define dialog visibility state

  // Define openDialog function
  const openDialog = () => {
    setDialogVisible(true);
  };

  const [product, setProduct] = useState({
    newProduct: {
      fields: {
        title: '',
        tags: '',
        brand: '',
        weight: '',
        dimensions: { unit: 'm', width: '', height: '', length: '' },
        short_description: '',
        categories: [''],
      },
      photos: ['https://www.91-img.com/gallery_images_uploads/5/8/588d43a38403fdceb3dfc30b8d537974ef88699e.JPG', 'https://www.91-img.com/gallery_images_uploads/5/8/588d43a38403fdceb3dfc30b8d537974ef88699e.JPG'],
      variants: [],
      options: {
        option1: { name: 'color', values: ['red'] },
        option2: { name: 'color', values: ['black'] },
      },
      isUpdate: 'no',
    },
  });

  useEffect(() => {
    if (productId) {
      fetchProductDetails(productId);
    }
  }, [productId]);

  const fetchProductDetails = async (productId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BASE_URL}/common/api/get_product/?fby_user_id=8&sku=${productId}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: process.env.REACT_APP_ACCESS_TOKEN,
          },
        }
      );
      const newProduct = response.data.newProduct;
      setProduct({
        newProduct: {
          fields: {
            title: newProduct.fields.title,
            tags: newProduct.fields.tags,
            brand: newProduct.fields.brand,
            weight: newProduct.fields.weight_value + ' ' + newProduct.fields.weight_unit,
            dimensions: {
              unit: newProduct.fields.dimensions_unit || 'm',
              width: newProduct.fields.dimensions_width || '',
              height: newProduct.fields.dimensions_height || '',
              length: newProduct.fields.dimensions_length || '',
            },
            short_description: newProduct.fields.description,
            categories: [newProduct.fields.category],
          },
          photos: newProduct.photos.map(photo => photo),
          variants: newProduct.variants.map(variant => ({
            id: variant.id,
            sku: variant.sku,
            barcode: variant.barcode,
            item_id: variant.item_id,
            title: variant.title,
            inventory_quantity: variant.inventory_quantity,
            image: variant.image,
            price: variant.price,
            specialPrice: variant.specialPrice,
            skuFamily: variant.skuFamily,
          })),
          options: {
            option1: { name: newProduct.fields.option_1_name, values: [newProduct.fields.option_1_value] },
            option2: { name: newProduct.fields.option_2_name, values: [newProduct.fields.option_2_value] },
          },
          isUpdate: productId ? 'yes' : 'no',
        },
      });
      console.log(newProduct);

    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleSave = async () => {
    try {
      var storedGroupCode = localStorage.getItem("groupCode");
      let url = `${process.env.REACT_APP_BASE_URL}/common/api/push_shopify_product/?fby_user_id=${storedGroupCode}&sku=${product.newProduct.fields.sku}`;
      if(productId) {
        url = `${process.env.REACT_APP_BASE_URL}/common/api/push_shopify_product/?fby_user_id=${storedGroupCode}&sku=${product.newProduct.fields.sku}&isUpdate=yes`;
      }
      const res = await axios({
        url: url,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: process.env.REACT_APP_ACCESS_TOKEN
        },
        data: [product],
      });

      console.log(res);
      if (res.data.success) {
        // Handle success
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    if (name === 'short_description') {
      setProduct((prevProduct) => ({
        ...prevProduct,
        newProduct: {
          ...prevProduct.newProduct,
          fields: {
            ...prevProduct.newProduct.fields,
            [name]: '<p>' + value + '<p/>',
          },
        },
      }));

    } else if (name === 'categories') {
      // Split the string value by comma to get an array of categories
      setProduct((prevProduct) => ({
        ...prevProduct,
        newProduct: {
          ...prevProduct.newProduct,
          fields: {
            ...prevProduct.newProduct.fields,
            categories: [value],
          },
        },
      }));
    } else if (name === 'tags') {
      // Split the string value by comma to get an array of tags
      setProduct((prevProduct) => ({
        ...prevProduct,
        newProduct: {
          ...prevProduct.newProduct,
          fields: {
            ...prevProduct.newProduct.fields,
            tags: [value],

          },
        },
      }));
      // } else if (name === 'weight') {
      //   setProduct((prevProduct) => ({
      //     ...prevProduct,
      //     newProduct: {
      //       ...prevProduct.newProduct,
      //       fields: {
      //         ...prevProduct.newProduct.fields,
      //         weight: {
      //           ...prevProduct.newProduct.fields.weight,
      //           value: value,
      //         },
      //       },
      //     },
      //   }));
    }
    else {
      setProduct((prevProduct) => ({
        ...prevProduct,
        newProduct: {
          ...prevProduct.newProduct,
          fields: {
            ...prevProduct.newProduct.fields,
            [name]: value,
          },
        },
      }));
    }
  };


  const handleImageChange = (file) => {
    // Upload image file and update the product's photos state
    // This function will vary depending on your backend implementation
    // For example:
    // const formData = new FormData();
    // formData.append('image', file);
    // axios.post('/upload', formData).then((response) => {
    //    const imageUrl = response.data.imageUrl;
    //    setProduct((prevProduct) => ({
    //      ...prevProduct,
    //      newProduct: {
    //        ...prevProduct.newProduct,
    //        photos: [...prevProduct.newProduct.photos, imageUrl],
    //      },
    //    }));
    // });
  };

  const handleAddProduct = (variants) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      newProduct: {
        ...prevProduct.newProduct,
        variants: variants,
      },
    }));
  };

  const handleVariantChange = (arg1, arg2, arg3) => {
    if (Array.isArray(arg1)) {
      // If the first argument is an array, assume it's an array of updatedVariants
      setProduct(prevProduct => ({
        ...prevProduct,
        newProduct: {
          ...prevProduct.newProduct,
          variants: arg1
        },
      }));
      setProduct(prevProduct => ({
        ...prevProduct,
        newProduct: {
          ...prevProduct.newProduct,
          options: arg2
        },
      }));
    } else {
      // If the first argument is not an array, assume individual parameters (index, property, value)
      const index = arg1;
      const property = arg2;
      const value = arg3;

      setProduct(prevProduct => {
        const updatedVariants = [...prevProduct.newProduct.variants];
        updatedVariants[index][property] = value;

        return {
          ...prevProduct,
          newProduct: {
            ...prevProduct.newProduct,
            variants: updatedVariants,
          },
        };
      });
    }
  };


  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <>
      <NavBar selectedSidebarItem="products" />
      <Sidebar />
      <div className="page-content">
        <div className="header">
          {/* <Button onClick={handleBack} variant="contained" startIcon={<FontAwesomeIcon icon={faArrowLeft} />}>
            Back
          </Button> */}
          <ArrowBackIcon onClick={handleBack} />
          <span style={{ fontSize: '1.2rem', marginLeft: 8 }}>Product</span>
          <Button onClick={handleSave} variant="contained" color="primary" startIcon={<FontAwesomeIcon icon={faSave} />}>
            Save
          </Button>
        </div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TitleAndDescriptionComponent product={product} handleFieldChange={handleFieldChange} />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MediaComponent product={product} handleImageChange={handleImageChange} />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {/* Inventory component */}
            <InventoryComponent product={product} handleFieldChange={handleFieldChange} />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <VariantsComponent product={product} handleVariantChange={handleVariantChange} />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <OrganizeAndClassifyComponent product={product} handleFieldChange={handleFieldChange} />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <WeightAndDimensionsComponent product={product} handleFieldChange={handleFieldChange} />
          </Grid>
        </Grid>
      </div>
    </>
  );
};