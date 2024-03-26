import { RotateLoader } from "react-spinners";
import "./loader.css"
export const Loader = () => {
    return (
        <div className="loader">
            <RotateLoader
            color="#0f3460"
            size={20}
            aria-label="Loading Spinner"
            data-testid="loader"
            />
        </div> 
    );
}