import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Button, Typography, IconButton, Grid, Card, CardContent } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { RadioButton } from 'primereact/radiobutton';
import { Calendar } from 'primereact/calendar'; // Added
import './channelPage.css';
import { Sidebar } from '../../components/SidePanel/Sidebar';
import { NavBar } from '../../components/Navbar/Navbar';

export const ChannelList = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        action: 'get',
        ownerCode: 'YT',
        client: {
            id: 'Id123',
            name: 'Chicco',
            ownerCode: 'Code-12345',
        },
        channel: {
            id: 1002,
            platformName: 'Mirakl',
            platformCode: 'MK',
            name: 'shopify',
            code: 'SFIT',
            isEnabled: true,
            groupCode: 'AEU',
            currencyCode: 'EUR',
            orderSyncStartDate: new Date('2022-02-01T12:00:00'),
            credentials: {
                username: '',
                password: '',
                secret: '',
                token: '',
                domain: 'shopping170.myshopify.com',
                apiKey: '2ec972a612088fc392de502d7e4c3887',
                warehouseLocationId: '12345678',
                ebay: {
                    compatibilityLevel: '843',
                    devId: '',
                    appId: '',
                    certId: '',
                    siteId: '3',
                },
                amazon_sp_api: {
                    accessKey: 'AKIAZDX7KMTAZZ2ILNEG',
                    secretKey: '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',
                    roleArn: 'arn:aws:iam::626526938305:role/amazon-sp-api-role',
                    clientId: 'amzn1.application-oa2-client.6f9f60af4335499fa195136dfc68d6ab',
                    clientSecret: 'bb72721f822c39cee10d5de32e21d8e20291e09ee19e04000abb73274a65e5c9',
                    refreshToken: 'Atzr|IwEBIEThPmYZZNTWKH6eAmFyvU9baMWdD46eDQCl_9jfKImAPLL1mUXMM_FZT95JYlI1Ng37SYb8uyqrc7nfPLMCxSHykBwUyBbRG_TBI2tdhXU5YCQUt1T--DNauKgAVMmZAM126VT8si64HnRB3MHxWby-MbGrBpP1FKy3Z7JBzUH1LpPGukp-2S_S-tjPPEkKWHs3vTbh4kQ-cqO7uQImT4YMV4CQtPyPAnILTSS8p1OqRbeoDIDqrqS13yQwMWyaJ93uZ8wkaNoUEUq8K6cWSrLGJ5ZCzNpgwloL0JIZwbw2qjH0Sb4tS1zgPnZ7o5sBnFM',
                    marketPlaceId: 'APJ6JRA9NG5V4',
                    sellerId: 'A2ENUTYX0UZGL8',
                    region: 'eu',
                },
            },
            services: {
                stockUpdate: true,
                priceUpdate: false,
                orderSync: true,
                productPublish: false,
            },
        },
    });

    const [activeForm, setActiveForm] = useState('client'); // Default to 'client'

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: checked,
        }));
    };

    const handleCalendarChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const headers = {
                'accept': '*/*',
                'authorization': process.env.REACT_APP_ACCESS_TOKEN,
                'Content-Type': 'application/json',
            };
            let apiUrl = `${process.env.REACT_APP_BASE_URL}/${activeForm === 'client' ? 'client' : 'channel'}/`;
            let newData = activeForm === 'client' ? { 'action': formData.action, 'client': formData.client } : { 'action': formData.action, 'ownerCode': formData.ownerCode, 'channel': formData.channel };

            const response = await axios.post(apiUrl, newData, { headers });

            console.log('API response:', response.data);

            const responseData = response.data.response;
            setFormData((prevData) => ({
                ...prevData,
                action: responseData.data.channelId,
                client: activeForm === 'client' ? { id: responseData.data.id, name: responseData.data[0].name, ownerCode: responseData.data[0].ownerCode } : prevData.client,
                channel: activeForm === 'channel' ? {
                    id: responseData.data.channelId,
                    platformName: responseData.data.platformName,
                    platformCode: responseData.data.platformCode,
                    name: responseData.data.channelName,
                    code: responseData.data.channelCode,
                    isEnabled: responseData.data.isEnabled === 1,
                    groupCode: responseData.data.groupCode,
                    currencyCode: responseData.data.currencyCode,
                    orderSyncStartDate: responseData.data.orderSyncStartDate,
                    credentials: {
                        ...responseData.data.credentials,
                        ebay: responseData.data.ebay || '',
                        amazon_sp_api: responseData.data.amazon_sp_api
                    },
                    services: responseData.data.services,
                } : prevData.channel,
            }));
            console.log("Create:", formData);
        } catch (error) {
            console.error('Error making API request:', error);
        }
    };

    const toggleForm = (formType) => {
        setActiveForm(formType);
    };
    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <>
            <NavBar selectedSidebarItem="channel" />
            <Sidebar />
            <div className="channel-page">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>
                            Channel List
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Button onClick={handleBack} startIcon={<ArrowBackIcon />}>
                            Back
                        </Button>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2} justifyContent="center">
                            <Grid item>
                                <Button onClick={() => toggleForm('client')} variant={activeForm === 'client' ? 'contained' : 'outlined'}>
                                    Client Request
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button onClick={() => toggleForm('channel')} variant={activeForm === 'channel' ? 'contained' : 'outlined'}>
                                    Channel Request
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    {activeForm === 'client' ? (
                                        <>
                                            <Grid item xs={12}>
                                                <Typography variant="h6" gutterBottom>
                                                    Client Form
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Action:</label>
                                                    <InputText name="action" value={formData.action} onChange={handleChange} />
                                                </div>
                                            </Grid>

                                            <Grid item xs={12} sm={3}>
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Channel ID:</label>
                                                    <InputText name="client.id" value={formData.client.id} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Name:</label>
                                                    <InputText name="client.name" value={formData.client.name} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Owner code:</label>
                                                    <InputText name="client.ownerCode" value={formData.client.ownerCode} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                        </>
                                    ) : (
                                        <>
                                            <Grid item xs={12}>
                                                <Typography variant="h6" gutterBottom>
                                                    Channel Form
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Action:</label>
                                                    <InputText name="action" value={formData.action} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Owner Code:</label>
                                                    <InputText name="ownerCode" value={formData.ownerCode} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Channel ID:</label>
                                                    <InputText name="channel.id" value={formData.channel.id} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Platform Name:</label>
                                                    <InputText name="channel.platformName" value={formData.channel.platformName} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Platform Code:</label>
                                                    <InputText name="channel.platformCode" value={formData.channel.platformCode} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Channel Name:</label>
                                                    <InputText name="channel.name" value={formData.channel.name} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Channel Code:</label>
                                                    <InputText name="channel.code" value={formData.channel.code} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Group Code:</label>
                                                    <InputText name="channel.groupCode" value={formData.channel.groupCode} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Currency Code:</label>
                                                    <InputText name="channel.currencyCode" value={formData.channel.currencyCode} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Order Sync Start Date:</label>
                                                    <Calendar name="channel.orderSyncStartDate" value={formData.channel.orderSyncStartDate} onChange={(e) => handleCalendarChange({ target: { name: 'channel.orderSyncStartDate', value: e.value } })} showIcon />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Username:</label>
                                                    <InputText name="channel.credentials.username" value={formData.channel.credentials.username} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Password:</label>
                                                    <InputText name="channel.credentials.password" value={formData.channel.credentials.password} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Secret:</label>
                                                    <InputText name="channel.credentials.secret" value={formData.channel.credentials.secret} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Token:</label>
                                                    <InputText name="channel.credentials.token" value={formData.channel.credentials.token} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Domain:</label>
                                                    <InputText name="channel.credentials.domain" value={formData.channel.credentials.domain} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Dev ID (eBay):</label>
                                                    <InputText name="channel.credentials.ebay.devId" value={formData.channel.credentials.ebay.devId} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">App ID (eBay):</label>
                                                    <InputText name="channel.credentials.ebay.appId" value={formData.channel.credentials.ebay.appId} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Cert ID (eBay):</label>
                                                    <InputText name="channel.credentials.ebay.certId" value={formData.channel.credentials.ebay.certId} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Site ID (eBay):</label>
                                                    <InputText name="channel.credentials.ebay.siteId" value={formData.channel.credentials.ebay.siteId} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Access Key (Amazon SP API):</label>
                                                    <InputText name="channel.credentials.amazon_sp_api.accessKey" value={formData.channel.credentials.amazon_sp_api.accessKey} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Secret Key (Amazon SP API):</label>
                                                    <InputText name="channel.credentials.amazon_sp_api.secretKey" value={formData.channel.credentials.amazon_sp_api.secretKey} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Role ARN (Amazon SP API):</label>
                                                    <InputText name="channel.credentials.amazon_sp_api.roleArn" value={formData.channel.credentials.amazon_sp_api.roleArn} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Client ID (Amazon SP API):</label>
                                                    <InputText name="channel.credentials.amazon_sp_api.clientId" value={formData.channel.credentials.amazon_sp_api.clientId} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Client Secret (Amazon SP API):</label>
                                                    <InputText name="channel.credentials.amazon_sp_api.clientSecret" value={formData.channel.credentials.amazon_sp_api.clientSecret} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Refresh Token (Amazon SP API):</label>
                                                    <InputText name="channel.credentials.amazon_sp_api.refreshToken" value={formData.channel.credentials.amazon_sp_api.refreshToken} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Marketplace ID (Amazon SP API):</label>
                                                    <InputText name="channel.credentials.amazon_sp_api.marketPlaceId" value={formData.channel.credentials.amazon_sp_api.marketPlaceId} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Seller ID (Amazon SP API):</label>
                                                    <InputText name="channel.credentials.amazon_sp_api.sellerId" value={formData.channel.credentials.amazon_sp_api.sellerId} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Region (Amazon SP API):</label>
                                                    <InputText name="channel.credentials.amazon_sp_api.region" value={formData.channel.credentials.amazon_sp_api.region} onChange={handleChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Is Enabled:</label>
                                                    <RadioButton name="channel.isEnabled" onChange={handleChange} checked={formData.channel.isEnabled} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Stock Update Service:</label>
                                                    <Checkbox name="channel.services.stockUpdate" checked={formData.channel.services.stockUpdate} onChange={handleCheckboxChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Price Update Service:</label>
                                                    <Checkbox name="channel.services.priceUpdate" checked={formData.channel.services.priceUpdate} onChange={handleCheckboxChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3} >
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Order Sync Service:</label>
                                                    <Checkbox name="channel.services.orderSync" checked={formData.channel.services.orderSync} onChange={handleCheckboxChange} />
                                                </div>
                                            </Grid>
                                            <Grid item xs={12} sm={3}>
                                                <div className="form-group">
                                                    <label className="font-bold block mb-2">Product Publish Service:</label>
                                                    <Checkbox name="channel.services.productPublish" checked={formData.channel.services.productPublish} onChange={handleCheckboxChange} />
                                                </div>
                                            </Grid>
                                        </>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" onClick={handleSubmit}>
                            Submit
                        </Button>
                    </Grid>
                </Grid>
            </div >
        </>
    );
}
