// api/products.js
import axios from 'axios';

export const getOrders = () => {
  var storedGroupCode = localStorage.getItem("groupCode");

  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const res = await axios.post(
          `${process.env.REACT_APP_BASE_URL}/common/api/get_order_master?fby_user_id=${storedGroupCode}`,
          {},
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: process.env.REACT_APP_ACCESS_TOKEN
            }
          }
        );
        if (res.data.success.data.length > 0) {
            const responseData = res.data.success.data;
            resolve(responseData);
        }
      } catch (err) {
        reject(err.message);
      }
    });
  });
};

