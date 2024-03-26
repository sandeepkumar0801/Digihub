import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './jobPage.css';

export const JobList = () => {
    const [jobs, setJobs] = useState(null);
    var storedGroupCode = localStorage.getItem("groupCode");
    const [formData, setFormData] = useState({
        fby_user_id: '1002',
        cc_operation: 'GET_PRODUCT_FROM_CHANNEL',
        cron_schedule: '12,42 * * * *',
        url: `shopify/api/get_shopify_products/?fby_user_id=${storedGroupCode}`
    });
    const [activeForm, setActiveForm] = useState('get');
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const headers = {
                    'Content-Type': 'application/json',
                    Authorization: process.env.REACT_APP_ACCESS_TOKEN,
                };
                const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/job/?request_type=get`, {}, { headers });
                const data = response.data.success.data;
                if (data.length > 0) {
                    const responseData = data.map((element) => ({
                        fby_user_id: element.fby_user_id,
                        channelName: element.channelName,
                        ownerCode: element.ownerCode,
                        groupCode: element.groupCode,
                        platformName: element.platformName,
                        cron_schedule: element.cron_schedule,
                        cc_operation: element.cc_operation
                    }));
                    setJobs(responseData);
                }
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };
        fetchData();
    }, []);

    const toggleForm = (formType) => {
        setActiveForm(formType);
    };

    const handleSubmit = async () => {
        try {
            const headers = {
                accept: '*/*',
                authorization: process.env.REACT_APP_ACCESS_TOKEN,
                'Content-Type': 'application/json',
            };
            let apiUrl = '';
            switch (activeForm) {
                case 'get':
                    apiUrl = `${process.env.REACT_APP_BASE_URL}/api/job/?request_type=get`;
                    break;
                case 'create':
                    apiUrl = `${process.env.REACT_APP_BASE_URL}/api/job/?request_type=create`;
                    break;
                case 'update':
                    apiUrl = `${process.env.REACT_APP_BASE_URL}/api/job/?request_type=update`;
                    break;
                case 'delete':
                    apiUrl = `${process.env.REACT_APP_BASE_URL}/api/job/?request_type=delete`;
                    break;
                default:
                    break;
            }
            const response = await axios.post(apiUrl, formData, { headers });
            const data = response.data.success.data;
            if (data.length > 0) {
                const responseData = data.map((element) => ({
                    fby_user_id: element.fby_user_id,
                    channelName: element.channelName,
                    ownerCode: element.ownerCode,
                    groupCode: element.groupCode,
                    platformName: element.platformName,
                    cron_schedule: element.cron_schedule,
                    cc_operation: element.cc_operation
                }));
                setJobs(responseData);
            }
            console.log("Create:", formData);
        } catch (error) {
            console.error('Error making API request:', error);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleGlobalFilterChange = (event) => {
        setGlobalFilter(event.target.value);
    };

    const filteredJobs = jobs ? jobs.filter(job => Object.values(job).some(value => value.toString().toLowerCase().includes(globalFilter.toLowerCase()))) : [];

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <div className="button-group">
                    <Button variant="contained" onClick={() => toggleForm('get')}>Get</Button>
                    <Button variant="contained" onClick={() => toggleForm('create')}>Create</Button>
                    <Button variant="contained" onClick={() => toggleForm('update')}>Update</Button>
                    <Button variant="contained" onClick={() => toggleForm('delete')}>Delete</Button>
                </div>

                {['get', 'create', 'update', 'delete'].includes(activeForm) && (
                    <div className="form-container">
                        <TextField fullWidth label="Fby User Id" name="fby_user_id" value={formData.fby_user_id} onChange={handleChange} />
                        <TextField fullWidth label="CC Operation" name="cc_operation" value={formData.cc_operation} onChange={handleChange} />
                        {(activeForm === 'create' || activeForm === 'update') && (
                            <>
                                <TextField fullWidth label="Cron Schedule" name="cron_schedule" value={formData.cron_schedule} onChange={handleChange} />
                                <TextField fullWidth label="Url" name="url" value={formData.url} onChange={handleChange} />
                            </>
                        )}
                        <Button variant="contained" onClick={handleSubmit}>Submit</Button>
                    </div>
                )}
                 <div className="filter-container">
                 <Typography variant="h6">Jobs</Typography>
                 <div className="search-container">
                        <SearchIcon />
                        <TextField type="search" variant="outlined" onChange={handleGlobalFilterChange} placeholder="     Search..." />
                    </div>
                </div>
            </Grid>
            <Grid item xs={12}>
                <TableContainer component={Paper} sx={{ width: '100%' }}>
                    <Table>
                        <TableHead sx={{ background: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Client Id</TableCell>
                                <TableCell>Channel Name</TableCell>
                                <TableCell>Owner Code</TableCell>
                                <TableCell>Group Code</TableCell>
                                <TableCell>Cron Schedule</TableCell>
                                <TableCell>CC Operation</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredJobs.map((job, index) => (
                                <TableRow key={index}>
                                    <TableCell>{job.fby_user_id}</TableCell>
                                    <TableCell>{job.platformName}</TableCell>
                                    <TableCell>{job.ownerCode}</TableCell>
                                    <TableCell>{job.groupCode}</TableCell>
                                    <TableCell>{job.cron_schedule}</TableCell>
                                    <TableCell>{job.cc_operation}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

        </Grid>
    );
}
