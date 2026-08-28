import { createContext } from "react";

export const Context = createContext(null)


const Contextprovider = ({ children }) => {

    const API_URL = "https://humisfragnance-5.onrender.com";

    const value = {
     API_URL,
    }

    return <Context.Provider value={value}>
        {children}
    </Context.Provider>
}

export default Contextprovider; 