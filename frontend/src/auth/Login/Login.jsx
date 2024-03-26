import React, { useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import './login.css';
import { translate } from '../translate';
import { NavBar } from '../../components/Navbar/Navbar';
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please enter both email and password");
            return;
        }
        try {
            axios.post(`${process.env.REACT_APP_BASE_URL}/login`, { email, password })
            .then((res) => {
                const { token, groupCode, user } = res.data;
                localStorage.setItem("token", token);
                localStorage.setItem("groupCode", groupCode);
                localStorage.setItem("user", user.name);

                login();
                navigate("/dashboard");
            })
            .catch((error) => {
                setError("Invalid email or password");
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <>
        <NavBar />
            <div className="login-container">
                <div className="login-form">
                    <div className="login-form-inner">
                        <h1 className="text-center">{translate('Login')}</h1>
                        {error && <div className="text-critical mb-1">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="form-field-container">
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={translate('Email')}
                                    required
                                />
                            </div>
                            <div className="form-field-container">
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={translate('Password')}
                                    required
                                />
                            </div>
                            <button type="submit">{translate('SIGN IN')}</button>
                        </form>
                        <div className="text-center mt-1">
                            <span>
                                {translate('Don\'t have an account?')}{' '}
                                <Link to="/register" className="text-interactive">
                                    {translate('Create an account')}
                                </Link>
                            </span>
                        </div>
                        <div className="text-center mt-1">
                            <Link to="/reset-password" className="text-interactive">
                                {translate('Forgot your password?')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>

    );
};

