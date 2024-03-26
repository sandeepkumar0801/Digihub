import { lazy, Suspense, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavBar } from "./components/Navbar/Navbar";
import { Footer } from "./components/Footer/Footer";
import { Loader } from "./components/Loader/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { Layout } from "./components/Layout/layout.jsx";
import { Home } from "./pages/Home.jsx"
import { Login } from "./auth/Login/Login.jsx"
import { Register } from "./auth/Register/Register.jsx"
import { ResetPasswordForm } from "./auth/ResetPasswordPage/ResetPasswordForm.jsx";
import { ProductPage } from "./pages/Product/Productpage.jsx";
import { AddProductPage } from "./pages/Product/Addproduct/AddProductPage.jsx";
import { OrderPage } from "./pages/Order/OrderPage.jsx";
import { ChannelPage } from "./pages/Channels/ChannelPage.jsx";
import { JobPage } from "./pages/Jobs/JobPage.jsx";
import { OrderMasterPage } from "./pages/Order/OrderMasterPage.jsx";
import { OrderDetailsPage } from "./pages/Order/OrderDetailsPage.jsx";
import { AddNewOrder } from "./pages/Order/Addorder/AddNewOrder.jsx";
import { Dashboard } from "./pages/Dashboard/Dashboard.jsx";
import { ChannelSettings } from "./pages/Channels/ChannelSetting.jsx";
import { ChannelList } from "./pages/Channels/ChannelList.jsx";

const App = () => {

    return (
        <Suspense fallback={<Loader />}>
            <Router>
                <ToastContainer
                    position="top-right"
                    autoClose={1000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />
                <Routes>
                    <>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login/>} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/reset-password" element={<ResetPasswordForm />} />
                    </>

                    <>
                        {/* <Route path="/layout" element={<Layout />} /> */}
                        <Route path="/products" element={<ProductPage />} />
                        <Route path="/products/edit" element={<AddProductPage />} />
                        <Route path="/products/edit/:productId" element={<AddProductPage />} />
                        <Route path="/orders" element={<OrderPage />} />
                        <Route path="/jobssettings" element={<JobPage />} />
                        <Route path="/channelsettings" element={<ChannelPage />} />
                        <Route path="/dashboard" element={<Dashboard/>} />
                        <Route path="/channelList" element={<ChannelList/>} />

                        <Route exact path="/createOrder" element={<AddNewOrder />} />
                        <Route exact path="/createOrder/:orderNo" element={<AddNewOrder />} />

                        <Route exact path="/orderMaster" element={<OrderMasterPage />} />
                        <Route exact path="/orderMaster/:orderId" element={<OrderMasterPage />} />
                        <Route exact path="/orderMaster/:orderId/orderDetails" element={<OrderDetailsPage />} />
                        <Route exact path="/orderMaster/:orderId/orderDetails/:lineId" element={<OrderDetailsPage />} />
                    </>

                </Routes>
                {/* <Footer /> */}
            </Router>
        </Suspense>
    );
};

export default App;
