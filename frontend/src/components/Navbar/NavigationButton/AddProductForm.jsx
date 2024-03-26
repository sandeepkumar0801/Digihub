import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from "react-router-dom";

export const AddProductForm = ({ onSubmit }) => {
    const navigate = useNavigate();
    const navigateToAddProductPage = () => {
        navigate('/products/edit');
    };

    return (
        <button className="submit green" onClick={navigateToAddProductPage}>
            <FontAwesomeIcon icon={faPlus} /> Add New
        </button>
    );
};
