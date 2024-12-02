import React, { createContext, useState, useEffect, useRef } from "react";
import NetInfo from '@react-native-community/netinfo';
import {
    getEstadosLevantamientosListToSendDB,
    getLevantamientosListLocalStorage,
    getLevantamientosListOffline,
    getLevantamientosListOnline,
    guardarEstadoLevantamientoOnListLocalStorageForSendToDB,
    guardarLevantamientosLocalStorage
} from "../helpers/levantamientos";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const DataContext = createContext();

export const DataProvider = ({ children }) => {

    const [spinner, setSpinner] = useState(false)
    const [recargarLista, setRecargarLista] = useState(false)
    const [recargarHallazgos, setRecargarHallazgos] = useState(false)
    const [isOnline, setIsOnline] = useState(false);
    const [modalIsDisconnected, setModalIsDisconnected] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [token, setToken] = useState(null);
    const [levantamientos, setLevantamientos] = useState([]);
    const [estadoScanner, setEstadoScanner] = useState(true);

    const disabledButtonScanner = (levantamientosList) => {
        try {
            const isEstadoEscanear = levantamientosList.some((levantamiento) => (levantamiento.estado === 1));
            if (isEstadoEscanear) {
                setEstadoScanner(false);
            }
        } catch (error) {
            console.log("disableButtonScanner", error);
        }
    }

    const findLevantamiento = async (newLevantamiento, isOnline = true) => {
        try {
            //   const dataHallazgo = levantamientos.find( (levantamiento) =>  (isOnline) 
            //                                                                 ? ( levantamiento.id === newLevantamiento.id ? levantamiento.id : null) 
            //                                                                 : ( levantamiento.sucursal === newLevantamiento.sucursal ? levantamiento.sucursal : null));

            const findLevantamientoOnline = (levantamiento) =>
                levantamiento.id === newLevantamiento.id ? levantamiento.id : null;

            const findLevantamientoOffline = (levantamiento) =>
                levantamiento.sucursal === newLevantamiento.sucursal ? levantamiento.sucursal : null;

            const dataHallazgo = levantamientos.find((levantamiento) =>
                isOnline ? findLevantamientoOnline(levantamiento) : findLevantamientoOffline(levantamiento)
            );

            if (dataHallazgo === undefined) {
                console.log("findLevantamiento", [...levantamientos, newLevantamiento]);
                setLevantamientos([...levantamientos, newLevantamiento]);
                try {
                    const resp = await guardarLevantamientosLocalStorage([...levantamientos, newLevantamiento]);
                    return newLevantamiento;
                } catch (error) {
                    console.log(error);
                    return false;
                }
            } else {
                console.log("YA EXISTE", dataHallazgo);
                return dataHallazgo;
            }

        } catch (error) {
            console.error("findLevantamiento", error);
            return false;
        }
    }

    const updateLevantamiento = async (newLevantamiento, isOnline = true) => {
        try {

            let updatedLevantamientos = levantamientos.map((levantamiento) =>
                (isOnline ? levantamiento.id : levantamiento.sucursal) === (isOnline ? newLevantamiento.id : newLevantamiento.sucursal)
                    ? newLevantamiento
                    : levantamiento
            );

            updatedLevantamientos = updatedLevantamientos.length === 0
                ? [...levantamientos, newLevantamiento]
                : updatedLevantamientos;

            setLevantamientos(updatedLevantamientos);
            try {
                const resp = await guardarLevantamientosLocalStorage(updatedLevantamientos);
                return newLevantamiento;
            } catch (error) {
                console.log(error);
                return false;
            }

        } catch (error) {
            console.error("updateLevantamiento", error);
            return false;
        }
    }

    const actualizarEstadoScanner = () => {
        setEstadoScanner(!estadoScanner);
    }

    const getDataLevantamientosListOnline = async () => {
        let levantamientosList = null;
        try {

            levantamientosList = await getLevantamientosListOnline();
            console.log("ONLINE");
            console.log("getDataLevantamientosListOnline levantamientosList ", levantamientosList);
            setLevantamientos(levantamientosList)
            await guardarLevantamientosLocalStorage(levantamientosList);
            disabledButtonScanner(levantamientosList);

        } catch (error) {
            console.error(error);
        }
    }

    const getDataLevantamientosListOffline = async () => {
        let levantamientosList = null;
        try {
            levantamientosList = await getLevantamientosListOffline();
            console.log("OFFLINE");
            console.log("getDataLevantamientosListOffline levantamientosList ", levantamientosList);
            setLevantamientos(levantamientosList)

            disabledButtonScanner(levantamientosList);

        } catch (error) {
            console.error(error);
        }
    }

    const getDataLevantamientosListStorage = async () => {
        let levantamientosList = null;
        try {
            levantamientosList = await getLevantamientosListLocalStorage();
            console.log("getLevantamientosListLocalStorage");
            console.log("levantamientosList ", levantamientosList);
            setLevantamientos(levantamientosList)
        } catch (error) {
            console.error(error);
        }
    }

    async function deleteLevantamiento(levantamientoId) {
        try {
            let levantamientos = await getLevantamientosListLocalStorage();
            const levantamientosFiltered = levantamientos.filter((levantamiento) => levantamiento.id !== levantamientoId);
            setLevantamientos(levantamientosFiltered);
            await guardarLevantamientosLocalStorage(levantamientosFiltered);
        } catch (error) {
            console.log("deleteLevantamiento", error)
        }
    }

    async function deleteEstadoLevantamiento(levantamientoId) {
        try {
            let estadolevantamientos = await getEstadosLevantamientosListToSendDB();
            const estadoLevantamientosFiltered = estadolevantamientos.filter((levantamiento) => levantamiento.id !== levantamientoId);
            console.log("deleteEstadoLevantamiento", estadoLevantamientosFiltered);
            // setLevantamientos(estadoLevantamientosFiltered);
            // await guardarEstadoLevantamientoOnListLocalStorageForSendToDB(estadoLevantamientosFiltered);
            await AsyncStorage.setItem('levantamientos_estados_localstorage_sendDB', JSON.stringify(estadoLevantamientosFiltered));
        } catch (error) {
            console.log("deleteEstadoLevantamiento", error)
        }
    }

    useEffect(() => {
        // Subscribe
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected);
        });

        return () => {
            // Unsubscribe
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!isOnline) {
            setModalIsDisconnected(true)
        } else {
            setModalIsDisconnected(false)
        }

    }, [isOnline]);

    useEffect(() => {

        const getLevantamientos = async () => {
            try {
                await NetInfo.fetch().then(async state => {
                    if (state.isConnected) {
                        try {
                            await getDataLevantamientosListOnline();
                        } catch (error) {
                            console.error(error);
                        }
                    }
                    else {
                        try {
                            await getDataLevantamientosListOffline();
                        } catch (error) {
                            console.error(error);
                        }
                    }
                });
            } catch (error) {
                console.log("ERROR LIST", error.response)
            }
        }

        // console.log("renderizando getLevantamientos");
        // getLevantamientos();

    }, [!recargarLista]);

    return (
        <DataContext.Provider value={{
            levantamientos,
            setLevantamientos,
            findLevantamiento,
            deleteLevantamiento,
            recargarLista,
            setRecargarLista,
            recargarHallazgos,
            setRecargarHallazgos,
            spinner,
            setSpinner,
            token,
            setToken,
            isOnline,
            modalIsDisconnected,
            setModalIsDisconnected,
            modalVisible,
            setModalVisible,
            getDataLevantamientosListStorage,
            estadoScanner,
            setEstadoScanner,
            actualizarEstadoScanner,
            deleteEstadoLevantamiento,
            disabledButtonScanner,
            updateLevantamiento
        }}>
            {children}
        </DataContext.Provider>
    )
}
