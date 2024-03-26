import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/SidePanel/Sidebar';
import { ProductList } from './ProductList';
import { getProducts } from '../../api/products'; // Assuming you have an API to fetch products
import './ProductPage.css';
import { NavBar } from '../../components/Navbar/Navbar';
import { useAuth } from "../../auth/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export const ProductPage = () => {
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
        navigate('/login');
    } 
}, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  return (
    <>
      <NavBar selectedSidebarItem = "products" />
      <Sidebar />
      <div className="product-page">
        <ProductList products={products} />
      </div>
    </>

  );
};
