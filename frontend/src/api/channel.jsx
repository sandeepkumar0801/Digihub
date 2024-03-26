import axios from 'axios';
export const getChannelDetails = () => {
    return new Promise((resolve, reject) => {
      var storedGroupCode = localStorage.getItem("groupCode");
      setTimeout(async () => {
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/channel_details?groupCode=${storedGroupCode}`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: process.env.REACT_APP_ACCESS_TOKEN
                    }
                }
            );
          if (res.data.success.data.length > 0) {
            resolve(res.data.success.data);
          }
        } catch (err) {
          reject(err.message);
        }
      });
    });
  };
  