import React, { createContext, useState, useEffect, useContext } from "react";
import NetInfo from '@react-native-community/netinfo';
import {
    getEstadosLevantamientosListToSendDB,
    getLevantamientosListLocalStorage,
    getLevantamientosListToSendBD,
    getToken,
    guardarEstadoLevantamientoForSendDB,
    guardarEstadoLevantamientoOnListLocalStorageForSendToDB,
    updateLevantamientoOnLevantamientosListLocalStorage,
    updateLevantamientos
} from "../helpers/levantamientos";
import { createLevantamientoRequest, terminarLevantamientoRequest } from "../api/levantamientos";
import { DataContext } from "./DataContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deleteHallazgosToSendBDByLevantamientoId, getHallazgosListToSendBD } from "../helpers/hallazgos";
import { createHallazgoRequestTest, createHallazgoRequestWithLimit } from "../api/hallazgos";
import { Alert } from "react-native";
import { showAlertMessageError } from "../helpers";

export const SendDataToBDContext = createContext();

export const SendDataToBDProvider = ({ children }) => {

    const {
        findLevantamiento,
        deleteLevantamiento,
        setRecargarLista,
        recargarLista,
        setLevantamientos,
        deleteEstadoLevantamiento
    } = useContext(DataContext)

    const [spinner, setSpinner] = useState(false)
    const [isOnline, setIsOnline] = useState(false);

    const senDataLevantamientos = async () => {
        const levantamientosToSendBD = await getLevantamientosListToSendBD();
        const arrayHallazgosExistentenEnDB = [];

        if (levantamientosToSendBD !== undefined) {

            setSpinner(true);
            const token = await getToken();

            if (token) {

                try {

                    let errorSend = false;
                    console.log("levantamientosToSendBD", levantamientosToSendBD);
                    for (const levantamiento of levantamientosToSendBD) {

                        console.log("ENVIANDO: ", levantamiento);
                        try {

                            let resLevantamiento = await createLevantamientoRequest(levantamiento.clavecliente,
                                levantamiento.nombresucursal,
                                levantamiento.numerosucursal,
                                levantamiento.latitud,
                                levantamiento.longitud,
                                levantamiento.url,
                                token,
                                levantamiento.levantamientoTemporalId);
                            // console.log("resLevantamiento ",resLevantamiento);

                            if (resLevantamiento.data.status === 200) {

                                const code = resLevantamiento.data.code;

                                if(code != 1){

                                let newLevantamiento = resLevantamiento.data.data;

                                if (await findLevantamiento(newLevantamiento)) {

                                    const estadoLevantamiento = levantamiento.estado;

                                    console.log("estadoLevantamiento", estadoLevantamiento);
                                    await deleteLevantamiento(levantamiento.id);

                                    /********************************* */
                                    if (estadoLevantamiento === 2) {

                                        try {
                                            const dataLevantamiento = {
                                                ...newLevantamiento,
                                                estado: 2
                                            }

                                            const respTerminarLevantamiento = await terminarLevantamientoRequest(dataLevantamiento.id);

                                            if (respTerminarLevantamiento.data.status === "success") {
                                                console.log("SE GUARDO ESTATUS EN BD");

                                                const responseUpdatedLevantamientos = await updateLevantamientoOnLevantamientosListLocalStorage(dataLevantamiento);
                                                if (responseUpdatedLevantamientos) {

                                                    setLevantamientos(responseUpdatedLevantamientos);
                                                    await deleteEstadoLevantamiento(levantamiento.id);

                                                    // if (!isOnline) {
                                                    //     await guardarEstadoLevantamientoOnListLocalStorageForSendToDB(dataLevantamiento);
                                                    //     await guardarEstadoLevantamientoForSendDB(dataLevantamiento);
                                                    // }
                                                }
                                            } else {
                                                console.log("senDataLevantamientos respTerminarLevantamiento", respTerminarLevantamiento);
                                                showAlertMessageError("No se pudo terminar el levantamiento, vuelva a intentarlo.");
                                                
                                                await guardarEstadoLevantamientoOnListLocalStorageForSendToDB(dataLevantamiento);
                                                await guardarEstadoLevantamientoForSendDB(dataLevantamiento);
                                            }

                                        } catch (error) {
                                            console.error("ERROR terminarLevantamiento", error)
                                        }
                                    }
                                    /********************************* */

                                } else {
                                    showAlertMessageError(
                                        'ERROR AL GUARDAR DATOS LOCALMENTE',
                                        'VUELVA A INTENTARLO.');
                                    errorSend = true;
                                    break;
                                }

                                } else{
                                    // const messageLevantamientoExist = resLevantamiento.data.message.toUpperCase();
                                    console.log("messageLevantamientoExist", resLevantamiento);

                                    await deleteLevantamiento(levantamiento.id);
                                    await deleteEstadoLevantamiento(levantamiento.id);
                                    await deleteHallazgosToSendBDByLevantamientoId( levantamiento.id );

                                    arrayHallazgosExistentenEnDB.push(levantamiento.nombresucursal)

                                }

                            } else {
                                console.log("senDataLevantamientos resLevantamiento", resLevantamiento);
                                showAlertMessageError(
                                    'ERROR DE GUARDADO DE DATOS DE LEVANTAMIENTO EN SERVER.',
                                    'ERROR');
                                errorSend = true;
                                break;
                            }

                        } catch (error) {
                            console.error("ERROR ENVIO DATA LEVANTAMIENTO TO SERVER ", error.response);
                            console.error("ERROR ENVIO DATA LEVANTAMIENTO TO SERVER ", error);
                            errorSend = true;
                            break;
                        }
                    }

                    if (errorSend === false) {
                        // console.log("NO HUBO ERROR");
                        await AsyncStorage.removeItem("levantamientos_localstorage_sendbd");
                    }

                } catch (error) {
                    console.log(error);
                    return false
                }
            }

            if(arrayHallazgosExistentenEnDB.length > 0){
                showAlertMessageError(
                    'ALERTA',
                    `Los siguientes levantamientos ya fueron creados por otro usuario: ${arrayHallazgosExistentenEnDB.join(", ")}`);

            }

            setSpinner(false);
            return true
        }
        setSpinner(false);
    }

    // const senDataHallazgos = async () => {

    //     let hallazgosToSendBD = await getHallazgosListToSendBD();

    //     if (hallazgosToSendBD && hallazgosToSendBD.length === 0) {
    //         hallazgosToSendBD = undefined;
    //     }

    //     if (hallazgosToSendBD !== undefined) {

    //         setSpinner(true);
    //         const token = await getToken();

    //         if (token) {

    //             try {

    //                 let errorSend = false;
    //                 for (const hallazgo of hallazgosToSendBD) {

    //                     console.log("ENVIANDO HALLAZGO: ", hallazgo);
    //                     try {
    //                         // Verificar que todas las propiedades necesarias no sean undefined
    //                         if (
    //                             hallazgo.levantamientoId !== undefined &&
    //                             hallazgo.hallazgoPrincipalId !== undefined &&
    //                             hallazgo.sucursalId !== undefined &&
    //                             hallazgo.cantidadReal !== undefined &&
    //                             hallazgo.cantidadIdeal !== undefined &&
    //                             hallazgo.observaciones !== undefined &&
    //                             hallazgo.hallazgoId !== undefined &&
    //                             hallazgo.fotosCamera !== undefined &&
    //                             hallazgo.isTemporal !== undefined
    //                         ) {
    //                             // let resHallazgo = await createHallazgoRequest(
    //                             //     hallazgo.levantamientoId,
    //                             //     hallazgo.hallazgoPrincipalId,
    //                             //     hallazgo.sucursalId,
    //                             //     hallazgo.cantidadReal,
    //                             //     hallazgo.cantidadIdeal,
    //                             //     hallazgo.observaciones,
    //                             //     hallazgo.hallazgoId,
    //                             //     hallazgo.fotosCamera
                                
    //                         // let resHallazgo = await createHallazgoRequest(
    //                         //     hallazgo.levantamientoId,
    //                         //     hallazgo.hallazgoPrincipalId,
    //                         //     hallazgo.sucursalId,
    //                         //     hallazgo.cantidadReal,
    //                         //     hallazgo.cantidadIdeal,
    //                         //     hallazgo.observaciones,
    //                         //     hallazgo.hallazgoId,
    //                         //     hallazgo.fotosCamera,
    //                         //     hallazgo.isTemporal
    //                         // );
    //                         // console.log("resHallazgo", resHallazgo);

    //                         // Suponiendo que tienes un objeto con la estructura {"_parts": [[Array]]}
    //                         const formDataObject = hallazgo.fotos ? hallazgo.fotos : null;

    //                         // Crear una nueva instancia de FormData
    //                         const formDataHallaz = new FormData();

    //                         console.log("formDataObject", formDataObject);
    //                         // Iterar sobre los pares clave-valor y agregarlos a la instancia de FormData
    //                         if (formDataObject !== null || 
    //                             formDataObject !== undefined ||
    //                             formDataObject.length > 0) {
    //                             for (const [key, value] of formDataObject._parts) {
    //                                 formDataHallaz.append(key, value);
    //                             }
    //                             console.log("ENTRO AQUI");
    //                         }

    //                         // console.log("hallazgo.fotos", hallazgo.fotos instanceof FormData);

    //                         const formDataHallazgos = formDataHallaz instanceof FormData 
    //                                                     ? formDataHallaz
    //                                                     : new FormData();

    //                         // Ahora `formData` contiene los datos transformados
    //                         // console.log(formData);
                            
    //                         console.log("formDataHallazgos senDataHallazgos", formDataHallazgos);

    //                         formDataHallazgos.append("levantamientoId", hallazgo.levantamientoId);
    //                         formDataHallazgos.append("hallazgoPrincipalId", hallazgo.hallazgoPrincipalId);
    //                         formDataHallazgos.append("sucursalId", hallazgo.sucursalId);
    //                         formDataHallazgos.append("cantidadReal", hallazgo.cantidadReal);
    //                         formDataHallazgos.append("cantidadIdeal", hallazgo.cantidadIdeal);
    //                         formDataHallazgos.append("observaciones", hallazgo.observaciones);
    //                         formDataHallazgos.append("hallazgoId", hallazgo.hallazgoId);
    //                         formDataHallazgos.append("isTemporal", hallazgo.isTemporal);
    //                         // formData.append("fotosCamera", fotosCamera);

    //                         console.log("formDataHallazgos", formDataHallazgos);

    //                         let resHallazgo = await createHallazgoRequestTest(formDataHallazgos);
    //                         console.log("resHallazgo", resHallazgo);

    //                             if (resHallazgo.status === "success") {

    //                                 // let newHallazgo = resHallazgo.data.data;
    //                                 let newHallazgo = resHallazgo.data;

    //                                 const levantamientosData = await getLevantamientosListLocalStorage();
    //                                 const responseLevantamientos = await updateLevantamientos(levantamientosData,
    //                                     newHallazgo.levantamiento_id,
    //                                     hallazgo.hallazgoPrincipalId,
    //                                     hallazgo.cantidadIdealInput,
    //                                     hallazgo.cantidadRealInput,
    //                                     hallazgo.observacionesInput,
    //                                     hallazgo.fotos,
    //                                     hallazgo.fotosLocal,
    //                                     newHallazgo.id);

    //                             } else {
    //                                 Alert.alert(
    //                                     'ERROR DE GUARDADO DE DATOS DE HALLAZGOS EN SERVER.',
    //                                     'ERROR ' + resHallazgo.message);
    //                                 errorSend = true;
    //                                 break;
    //                             }

    //                         } else {
    //                             console.error("Hallazgo tiene propiedades undefined: ", hallazgo);
    //                             Object.keys(hallazgo).forEach(key => {
    //                                 if (hallazgo[key] === undefined) {
    //                                   console.error(`La propiedad ${key} está indefinida`);
    //                                 }});
    //                             errorSend = true;
    //                         }
    //                     } catch (error) {
    //                         console.error("Error al enviar hallazgo: ", error);
    //                         errorSend = true;
    //                     }
    //                 }

    //                 if (!errorSend) {
    //                     console.log("Todos los hallazgos fueron enviados correctamente.");
    //                 } else {
    //                     console.error("Hubo errores al enviar algunos hallazgos.");
    //                 }

    //             } catch (error) {
    //                 console.error("Error al procesar hallazgos: ", error);
    //             } finally {
    //                 setSpinner(false);
    //             }
    //         } else {
    //             console.error("No se pudo obtener el token.");
    //         }
    //     } else {
    //         console.log("No hay hallazgos para enviar.");
    //     }
    // }

    const senDataHallazgos = async () => {

        let hallazgosToSendBD = await getHallazgosListToSendBD();

        if (hallazgosToSendBD && hallazgosToSendBD.length === 0) {
            hallazgosToSendBD = undefined;
        }

        if (hallazgosToSendBD !== undefined) {

            setSpinner(true);
            const token = await getToken();

            if (token) {

                try {

                    let errorSend = false;
                    for (const hallazgo of hallazgosToSendBD) {

                        console.log("ENVIANDO HALLAZGO: ", hallazgo);
                        try {

                            // let resHallazgo = await createHallazgoRequest(
                            //     hallazgo.levantamientoId,
                            //     hallazgo.hallazgoPrincipalId,
                            //     hallazgo.sucursalId,
                            //     hallazgo.cantidadReal,
                            //     hallazgo.cantidadIdeal,
                            //     hallazgo.observaciones,
                            //     hallazgo.hallazgoId,
                            //     hallazgo.fotosCamera,
                            //     hallazgo.isTemporal
                            // );
                            // console.log("resHallazgo", resHallazgo);

                            // Suponiendo que tienes un objeto con la estructura {"_parts": [[Array]]}
                            const formDataObject = hallazgo.fotos ? hallazgo.fotos : null;

                            // Crear una nueva instancia de FormData
                            const formDataHallaz = new FormData();

                            console.log("formDataObject TEST", formDataObject);
                            // Iterar sobre los pares clave-valor y agregarlos a la instancia de FormData
                            if (formDataObject !== null && formDataObject._parts) {
                                if (formDataObject._parts.length > 0) {
                                    for (const [key, value] of formDataObject._parts) {
                                        if (value !== undefined && value !== null) {
                                            console.log("key", key);
                                            console.log("value", value);
                                            formDataHallaz.append(key, value);
                                        }
                                    }
                                    console.log("ENTRO AQUI");
                                } else {
                                    console.error("formDataObject does not have _parts property");
                                }
                            }

                            // console.log("hallazgo.fotos", hallazgo.fotos instanceof FormData);

                            const formDataHallazgos = formDataHallaz instanceof FormData 
                                                        ? formDataHallaz
                                                        : new FormData();

                            // Ahora `formData` contiene los datos transformados
                            // console.log(formData);
                            
                            console.log("formDataHallazgos senDataHallazgos", formDataHallazgos);

                            formDataHallazgos.append("levantamientoId", hallazgo.levantamientoId);
                            formDataHallazgos.append("hallazgoPrincipalId", hallazgo.hallazgoPrincipalId);
                            formDataHallazgos.append("sucursalId", hallazgo.sucursalId);
                            formDataHallazgos.append("cantidadReal", hallazgo.cantidadReal);
                            formDataHallazgos.append("cantidadIdeal", hallazgo.cantidadIdeal);
                            formDataHallazgos.append("observaciones", hallazgo.observaciones);
                            formDataHallazgos.append("hallazgoId", hallazgo.hallazgoId);
                            formDataHallazgos.append("isTemporal", hallazgo.isTemporal);
                            formDataHallazgos.append("fotosEliminadas", hallazgo.fotosEliminadas);

                            console.log("formDataHallazgos", formDataHallazgos);

                            let resHallazgo = await createHallazgoRequestWithLimit(formDataHallazgos);
                            console.log("resHallazgo", resHallazgo);

                            if (resHallazgo.status === "success") {

                                // let newHallazgo = resHallazgo.data.data;
                                let newHallazgo = resHallazgo.data;

                                const levantamientosData = await getLevantamientosListLocalStorage();
                                const responseLevantamientos = await updateLevantamientos(levantamientosData,
                                    newHallazgo.levantamiento_id,
                                    hallazgo.hallazgoPrincipalId,
                                    hallazgo.cantidadIdealInput,
                                    hallazgo.cantidadRealInput,
                                    hallazgo.observacionesInput,
                                    hallazgo.fotos,
                                    hallazgo.fotosLocal,
                                    newHallazgo.id);

                            } else {
                                Alert.alert(
                                    'ERROR DE GUARDADO DE DATOS DE HALLAZGOS EN SERVER.',
                                    'ERROR ' + resHallazgo.message);
                                errorSend = true;
                                break;
                            }

                        } 
                        catch (error) {
                            console.error("ERROR ENVIO DATA DE HALLAZGOS TO SERVER ", error);
                            console.error("ERROR ENVIO DATA DE HALLAZGOS TO SERVER ", error.response);
                            errorSend = true;
                            break;
                        }
                    }

                    if (errorSend === false) {
                        // console.log("NO HUBO ERROR");
                        await AsyncStorage.removeItem("hallazgos_localstorage_sendbd");
                    }

                } catch (error) {
                    console.log(error);
                    return false
                }

            }
            setSpinner(false);
            return true
        }
        return true
    }

    const senDataEstadosLevantamientos = async () => {

        // console.log("ENTRANDO A senDataEstadosLevantamientos");

        const estadosLevantamientosToSendDB = await getEstadosLevantamientosListToSendDB();
        
        console.log("estadosLevantamientosToSendDB", estadosLevantamientosToSendDB);
        
        if (estadosLevantamientosToSendDB !== undefined) {

            setSpinner(true);
            const token = await getToken();
        
            if (token) {

                try {

                    let errorSend = false;

                    for (const estadoLevantamiento of estadosLevantamientosToSendDB) {

                        console.log("ENVIANDO ESTADO : ", estadoLevantamiento);

                        try {
                            const respTerminarLevantamiento = await terminarLevantamientoRequest(estadoLevantamiento.id);

                            if (respTerminarLevantamiento.data.status === "success") {

                                console.log("SE GUARDO ESTATUS EN BD",estadoLevantamiento);

                                const responseUpdatedLevantamientos = await updateLevantamientoOnLevantamientosListLocalStorage(estadoLevantamiento);
                                if (responseUpdatedLevantamientos) {

                                    setLevantamientos(responseUpdatedLevantamientos);
                                    await deleteEstadoLevantamiento(estadoLevantamiento.id);

                                }
                            } 
                            else {
                                console.log("senDataEstadosLevantamientos respTerminarLevantamiento", respTerminarLevantamiento);
                                showAlertMessageError("No se pudo terminar el levantamiento, vuelva a intentarlo.");
                                
                                // await guardarEstadoLevantamientoOnListLocalStorageForSendToDB(dataLevantamiento);
                                // await guardarEstadoLevantamientoForSendDB(dataLevantamiento);
                            }

                        } catch (error) {
                            console.error("ERROR ENVIO DATA estado LEVANTAMIENTO TO SERVER ", error.response);
                            console.error("ERROR ENVIO DATA estado LEVANTAMIENTO TO SERVER ", error);
                            errorSend = true;
                            break;
                        }
                    }

                } catch (error) {
                    console.log(error);
                    return false
                }
            }

            setSpinner(false);
            return true
        }
        setSpinner(false);
    }

    const sendDataOnLocalStorageToBD = async () => {

        await senDataLevantamientos();
        await senDataHallazgos();
        await senDataEstadosLevantamientos();
        setRecargarLista(!recargarLista);
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

        const sendData = async () => {
            sendDataOnLocalStorageToBD();
            // setRecargarLista(!recargarLista)
        }

        if (!isOnline) {
        } else {
            try {
                sendData();
            } catch (error) {
                console.log(error);
            }
        }

    }, [isOnline]);

    return (
        <SendDataToBDContext.Provider value={{
            spinner,
            setSpinner,
            isOnline,
        }}>
            {children}
        </SendDataToBDContext.Provider>
    )
}
