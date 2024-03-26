// api/products.js
import axios from 'axios';

export const getProducts = () => {
  return new Promise((resolve, reject) => {
    var storedGroupCode = localStorage.getItem("groupCode");
    setTimeout(async () => {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/common/api/get_product?fby_user_id=${storedGroupCode}`,
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
            description: element.description,
            option_1_name: element.option_1_name,
            option_1_value: element.option2_value,
            option_2_name: element.option_2_name,
            option_2_value: element.option_2_value,
            sku: element.sku,
            gtin: element.gtin,
            asin: element.asin,
            quantity: element.inventory_quantity,
            price: element.price,
            image_link: element.image,
            brand: element.brand,
            tags: element.tags,
            category: element.category,
            weight: element.weight,
            weight_unit: element.weight_unit,
            height: element.height,
            width: element.width,
            length: element.length,
            dimensions_units: element.dimensions_units,
            status: element.product_status,
            variantPrice: element.variantPrice,
            quantity: element.quantity,
            count: element.count,
            channel_status: element.channel_status,
            created_at: element.created_at,
            updated_at: element.updated_at
          }));
          resolve(responseData);
        }
      } catch (err) {
        reject(err.message);
      }
    });
  });
};

export const getExportProducts = () => {
  var storedGroupCode = localStorage.getItem("groupCode");

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
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
            description: element.description,
            option_1_name: element.option_1_name,
            option_1_value: element.option2_value,
            option_2_name: element.option_2_name,
            option_2_value: element.option_2_value,
            sku: element.sku,
            gtin: element.gtin,
            asin: element.asin,
            quantity: element.inventory_quantity,
            price: element.price,
            image_link: element.image,
            brand: element.brand,
            tags: element.tags,
            category: element.category,
            weight: element.weight_value,
            weight_unit: element.weight_unit,
            height: element.dimensions_height,
            width: element.dimensions_width,
            length: element.dimensions_length,
            dimensions_units: element.dimensions_units
          }));
          resolve(responseData);
        }
      } catch (err) {
        reject(err.message);
      }
    });
  });
};
