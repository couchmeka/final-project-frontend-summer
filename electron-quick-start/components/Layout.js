import React from "react";
import ResponsiveAppBar from "./NavBar";

const Layout = ({children}) => {  // children is added to the component props
    return (
         <div>
        <ResponsiveAppBar/>
        {children}  
        </div>
    )
}

export default Layout;
