import { createContext } from "react";

export const Context = createContext(null)


const Contextprovider = ({ children }) => {

    const API_URL = "http://localhost:5000";

    const value = {
     API_URL,
    }

    return <Context.Provider value={value}>
        {children}
    </Context.Provider>
}

export default Contextprovider; 