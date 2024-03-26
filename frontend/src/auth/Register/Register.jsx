import React, { useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import './register.css';
import { translate } from '../translate';
import { useNavigate } from "react-router-dom";
import { NavBar } from '../../components/Navbar/Navbar';

export const Register = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [groupCode, setGroupCode] = useState('');
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }
        try {
            axios.post(`${process.env.REACT_APP_BASE_URL}/register`, { name, email, password, groupCode })
                .then(res => {
                    console.log(res);
                    navigate('/login')
                })
                .catch(err => {
                    console.log(err);
                    throw new Error(err.message);
                })

        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <NavBar />
            <div className="register-container">
                <div className="register-form">
                    <div className="register-form-inner">
                        <h1 className="text-center">Create A New Account</h1>
                        {error && <div className="text-critical mb-1">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-field-container">
                                <input id="newUsername" value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder="Full Name" />
                            </div>
                            <div className="form-field-container">
                                <input id="newUserEmail" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" />
                            </div>
                            <div className="form-field-container">
                                <input id="newPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
                            </div>
                            <div className="form-field-container">
                                <label htmlFor="region">Select Group code:</label>
                                <select
                                    id="groupCode"
                                    name="Group Code"
                                    value={groupCode}
                                    onChange={(e) => setGroupCode(e.target.value)}
                                >
                                    <option value="AEU">AEU</option>
                                    <option value="SHEU">SHEU</option>
                                    <option value="SREU">SREU</option>
                                    <option value="WCEU">WCEU</option>
                                    <option value="PSEU">PSEU</option>
                                    <option value="EEU">EEU</option>
                                    <option value="AMZ">AMZ</option>
                                    <option value="MRKL">MRKL</option>
                                    <option value="STREU">STREU</option>
                                    <option value="AMNA">AMNA</option>
                                    <option value="MGEU">MGEU</option>
                                    <option value="8">8</option>

                                </select>
                            </div>
                            <button type="submit">{translate('SIGN UP')}</button>
                        </form>
                        <div className="text-center mt-1">
                            <span>
                                Already have an account?{' '}
                                <Link to="/login" className="text-interactive">
                                    {translate('Login here')}
                                </Link>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

