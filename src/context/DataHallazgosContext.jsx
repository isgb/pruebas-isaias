import React, { createContext, useState, useEffect, useRef, useContext } from "react";
import { getLevantamientosListLocalStorage, getLevantamientosListOnline } from "../helpers/levantamientos";
import { DataContext } from "./DataContext";
import NetInfo from "@react-native-community/netinfo";

export const DataHallazgosContext = createContext();

export const DataHallazgosProvider = ({ children }) => {

    const {
        setLevantamientos,
        disabledButtonScanner
    } = useContext(DataContext)

    const [recargarHallazgos, setRecargarHallazgos] = useState(false)
    const [capturedImages, setCapturedImages]       = useState([]);
    const [isLoading, setIsLoading]                 = useState(true);

    const recargarDataLevantamientosList = async () => {
        try {
            await NetInfo.fetch().then(async (state) => {
                let levantamientosList = null;
                if (state.isConnected) {
                    levantamientosList = await getLevantamientosListOnline();
                } else {
                    levantamientosList = await getLevantamientosListLocalStorage();
                }
                if (levantamientosList) {
                    setLevantamientos(levantamientosList);
                    disabledButtonScanner(levantamientosList);
                } else {
                    console.error("Levantamientos list is undefined");
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {

        const recargarLevantamientos = async () => {
            try {
               await recargarDataLevantamientosList();
            } catch (error) {
                console.error("ERROR LIST hallazgos", error.response)
            }
        }

        if(recargarHallazgos){
            console.log("renderizando getLevantamientos");
            recargarLevantamientos();
            setRecargarHallazgos(false)
        }

    }, [recargarHallazgos]);

    return (
        <DataHallazgosContext.Provider value={{
            recargarHallazgos, 
            setRecargarHallazgos,
            capturedImages,
            setCapturedImages,
            isLoading,
            setIsLoading
        }}>
            {children}
        </DataHallazgosContext.Provider>
    )
}
