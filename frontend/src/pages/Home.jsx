import { Fragment } from "react";
import { Wrapper } from "../components/wrapper/Wrapper";
import { products } from "../utils/products";
import { SliderHome } from "../components/Slider";
import { useWindowScrollToTop } from "../hooks/useWindowScrollToTop";
import { NavBar } from "../components/Navbar/Navbar";

export const Home = () => {
  const newArrivalData = products.filter(
    (item) => item.category === "mobile" || item.category === "wireless"
  );
  const bestSales = products.filter((item) => item.category === "sofa");
  useWindowScrollToTop();
  return (
    <>
      <NavBar />
      <Fragment>
        <SliderHome />
        <Wrapper />
      </Fragment>
    </>
  );
};