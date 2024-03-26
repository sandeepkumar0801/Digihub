import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Switch, Grid, Button, Typography, FormControlLabel, Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';

import ShopifyLogo from '../../Images/shopify.svg';
import AmazonLogo from '../../Images/amazon.svg';
import WooCommerceLogo from '../../Images/woocommerce.jpeg';
import PrestaShopLogo from '../../Images/prestashop.png';
import MiraklLogo from '../../Images/mirakl.png';

const channelDetails = {
    Shopify: ShopifyLogo,
    amazon: AmazonLogo,
    woocommerce: WooCommerceLogo,
    prestashop: PrestaShopLogo,
    mirakl: MiraklLogo,
};

const useStyles = makeStyles(theme => ({
    root: {
        height: '100%',
        padding: '16px',
    },
    row: {
        padding: '8px 0',
        borderBottom: '1px solid #eee',
    },
    image: {
        maxWidth: '50px',
        maxHeight: '50px',
        marginLeft: '20px'
    },
    switchLabel: {
        fontSize: '0.875rem',
    },
    button: {
        textAlign: 'right',
    },
}));

export const ChannelSettings = () => {
    const navigate = useNavigate();

    const classes = useStyles();
    const [channels, setChannels] = useState([]);

    useEffect(() => {
        fetchChannelDetails();
    }, []);

    const fetchChannelDetails = async () => {
        // Fetch channel details from API
        var storedGroupCode = localStorage.getItem("groupCode");

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
                const responseData = res.data.success.data;
                setChannels(responseData);
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    const handleSwitchChange = async (channelId, groupCode, checked) => {
        // Call API to switch channel status
        var storedGroupCode = localStorage.getItem("groupCode");

        try {
            const res = await axios.post(
                `${process.env.REACT_APP_BASE_URL}/api/update_channel_status`,
                {
                    channelId: channelId,
                    groupCode: storedGroupCode,
                    isActive: checked ? 1 : 0
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: process.env.REACT_APP_ACCESS_TOKEN
                    }
                }
            );
            console.log('Channel status updated successfully');
        } catch (error) {
            console.error('Error updating channel status:', error);
        }
    };

    const handleCreateClick = () => {
        // Navigate to the '/channelList' page
        navigate('/channelList');
    };
    return (
        <Grid container className={classes.root}>
            <h4>Channels</h4>
            <Grid item xs={12} className={classes.button}>
                <Button variant="contained" color="primary" onClick={handleCreateClick}>Create</Button>
            </Grid>
            <Grid container spacing={2} style={{ marginTop: '20px' }}>
                {/* <Grid item xs={4}><Typography variant="subtitle1">Channel ID</Typography></Grid>
                <Grid item xs={4}><Typography variant="subtitle1">Image</Typography></Grid>
                <Grid item xs={4}><Typography variant="subtitle1">Status</Typography></Grid> */}
                {channels.map(channel => (
                    <Grid container key={channel.id} alignItems="center" component={Paper} className={classes.row}>
                        <Grid item xs={4}><img src={channelDetails[channel.platformName]} alt={channel.platformName} className={classes.image} /></Grid>
                        <Grid item xs={4}><Typography>{channel.channelId}</Typography></Grid>
                        <Grid item xs={4}>
                            <FormControlLabel
                                control={<Switch checked={channel.isActive === 1} onChange={(e) => handleSwitchChange(channel.channelId, channel.storedGroupCode, e.target.checked)} />}
                                label={channel.isActive === 1 ? 'Active' : 'Inactive'}
                                className={classes.switchLabel}
                            />
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </Grid>
    );
};
