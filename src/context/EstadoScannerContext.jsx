import React, { createContext, useEffect, useState } from "react";

export const EstadoScannerContext = createContext();

export const EstadoScannerProvider = ({ children }) => {

    const [estadoScanner, setEstadoScanner] = useState(true);

    useEffect(() => {
        console.log("EstadoScannerProvider", estadoScanner);
    }, [!estadoScanner])
    
    return (
        <EstadoScannerContext.Provider value={{
            estadoScanner, 
            setEstadoScanner
        }}>
            {children}
        </EstadoScannerContext.Provider>
    )
}
