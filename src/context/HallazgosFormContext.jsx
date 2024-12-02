import React, { createContext, useContext, useState, useRef } from 'react';
import { getLevantamientosListLocalStorage, guardarLevantamientosLocalStorage } from '../helpers/levantamientos';
import { createHallazgoRequest, createHallazgoRequestTest, createHallazgoRequestWithLimit } from '../api/hallazgos';
import { guardarHallazgosLocalStorageForSendBD } from '../helpers/hallazgos';
import { useHallazgoInputs } from '../hooks/useHallazgoInputs';
import { DataContext } from './DataContext';
import uuid from 'react-native-uuid';
import { DataHallazgosContext } from './DataHallazgosContext';

const HallazgosFormContext = createContext();

export const useHallazgo = () => {
    return useContext(HallazgosFormContext);
};

export const HallazgoFormProvider = ({ children }) => {

    const { isOnline } = useContext(DataContext);
    const [estadoLevantamiento, setEstadoLevantamiento] = useState(false);
    const [listHallazgos, setListHallazgos] = useState({});
    const [levantamiento, setLevantamiento] = useState({ estado: 0 });
    const [typeAuditoria, setTypeAuditoria] = useState("");

    const cantidadRealRef = useRef("0");
    const cantidadIdealRef = useRef("0");
    const observacionesRef = useRef('');

    const { hallazgoForm, setHallazgoForm } = useHallazgoInputs(
        {
            cantidadIdeal: "",
            cantidadReal: "",
            hallazgo: "",
            hallazgoId: null,
            id: null,
            imagenes: [],
            observaciones: "",
            camposAdicionales: [],
        }
    );

    function findObjectByHallazgo(familia, grupo, dataHallazgo) {

        let copyListHallazgos = { ...listHallazgos };

        const FamiliaHallazgo = copyListHallazgos[familia];
        const GrupoHallazgo = FamiliaHallazgo[grupo];

        let camposAdicionales = dataHallazgo.camposAdicionales.map(item => ({
            ...item
        }));

        camposAdicionales.forEach(item => {
            item.valor = "";
        });

        const newHallazgo = {
            cantidadIdeal: "0",
            cantidadReal: "0",
            hallazgo: dataHallazgo.hallazgo,
            hallazgoId: "",
            id: dataHallazgo.id,
            idUnique: uuid.v4(),
            fotos: [],
            fotosEliminadas: [],
            fotosLocal: [],
            imagenes: [],
            observaciones: "",
            camposAdicionales: camposAdicionales,
        }

        if (Array.isArray(GrupoHallazgo)) {

            for (let i = 0; i < GrupoHallazgo.length; i++) {
                
                if (GrupoHallazgo[i].hallazgo === dataHallazgo.hallazgo
                    && GrupoHallazgo[i].idUnique === dataHallazgo.idUnique
                ) {

                    GrupoHallazgo.push(newHallazgo);
                    return copyListHallazgos;
                } else
                    console.log("NO SE ENCONTRÓ EN EL ARRAY");
            }
        }
    }

    const addHallazgo = (familia, grupo, dataHallazgo) => {

        const updateList = findObjectByHallazgo(familia, grupo, dataHallazgo);

        if (updateList !== undefined)
            setListHallazgos(updateList);
    }

    const updateLevantamientos = async (levantamientosData,
        levantamientoId, hallazgoPrincipalId, cantidadIdealInput,
        cantidadRealInput, observacionesInput, fotosCamera, fotosCameraLocal,
        hallazgoId, isTemporal = null, familia = "", grupo = "") => {

        let hallazgoEncontrado;
        let dataLevantamiento = levantamientosData.find((levantamiento) => levantamiento.id === levantamientoId);

        for (const clave in dataLevantamiento.hallazgosPrincipales) {
            if (dataLevantamiento.hallazgosPrincipales.hasOwnProperty(typeAuditoria)) {

                const dataFamiliaMain = dataLevantamiento.hallazgosPrincipales[typeAuditoria];

                /** Seteamos los valores de listHallazgos */
                // setListHallazgos(dataFamiliaMain);

                for (const grupoFamilia in dataFamiliaMain) {
                    if (dataFamiliaMain.hasOwnProperty(familia)) {

                        const dataHallazgoMain = dataFamiliaMain[familia];

                        for (const hallazgoPrincipal in dataHallazgoMain) {
                            if (dataHallazgoMain.hasOwnProperty(grupo)) {

                                const hallazgoPrin = dataHallazgoMain[grupo];

                                for (let i = 0; i < hallazgoPrin.length; i++) {

                                    if (hallazgoPrin[i].id === hallazgoPrincipalId) {
                                        hallazgoEncontrado = hallazgoPrin[i];
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // console.log("hallazgoEncontrado", hallazgoEncontrado);

        // return;

        if (hallazgoEncontrado !== undefined) {

            dataHallazgoPrincipal = {
                ...hallazgoEncontrado,
                cantidadIdeal: cantidadIdealInput,
                cantidadReal: cantidadRealInput,
                observaciones: observacionesInput,
                fotos: fotosCamera,
                fotosLocal: fotosCameraLocal,
                hallazgoId,
                isTemporal
            };

            if (dataLevantamiento.hallazgosPrincipales[typeAuditoria]) {
                if (dataLevantamiento.hallazgosPrincipales[typeAuditoria][familia]) {
                    if (dataLevantamiento.hallazgosPrincipales[typeAuditoria][familia][grupo]) {
                        const index = dataLevantamiento.hallazgosPrincipales[typeAuditoria][familia][grupo].findIndex(
                            hallazgo => hallazgo.id === hallazgoPrincipalId
                        );

                        if (index !== -1) {
                            dataLevantamiento.hallazgosPrincipales[typeAuditoria][familia][grupo][index] = dataHallazgoPrincipal;
                        }
                    }
                }
            }

            setLevantamiento(dataLevantamiento);

            const levantamientosActualizados = levantamientosData.map(
                (levantamiento) => (levantamiento.id === dataLevantamiento.id ? dataLevantamiento : levantamiento)
            );

            try {
                await guardarLevantamientosLocalStorage(levantamientosActualizados);
            } catch (error) {
                console.log("error guardarLevantamientosLocalStorage", error);
            }
        }
    };

    const processAdditionalFields = (hallazgoInputs) => {
        let arrayFamiliaAdicional = [];
        for (const key in hallazgoInputs.camposAdicionales) {
            if (hallazgoInputs.camposAdicionales.hasOwnProperty(key)) {
                const campo = hallazgoInputs.camposAdicionales[key];
                if (typeof campo === 'object' && campo !== null) {
                    arrayFamiliaAdicional.push({
                        [campo.id]: campo.valor
                    });
                }
            }
        }
        return arrayFamiliaAdicional;
    };

    const handleInput = async (
        value,
        nameInput = "",
        fotosLocal = null,
        updateFromGaleriaFotos = false,
        fotosEliminadasIds = [],
        isCampoAdicional = false,
        hallazgoPrincipalIdInput = null,
        idEspecificoHallazgo = "",
        objetoHallazgoFormInputs = {}
    ) => {

        const hallazgoData = Object.keys(objetoHallazgoFormInputs).length === 0 ? hallazgoForm : objetoHallazgoFormInputs;

        const levantamientosData = await getLevantamientosListLocalStorage();

        let hallazgoInputs = (isCampoAdicional === false) ? {
            ...hallazgoData,
            [nameInput]: value,
        } : hallazgoData;

        if (fotosLocal !== null) {
            if (!updateFromGaleriaFotos) {
                hallazgoInputs = {
                    ...hallazgoInputs,
                    fotosLocal: [...hallazgoInputs.fotosLocal, ...fotosLocal]
                };
            } else {
                hallazgoInputs = {
                    ...hallazgoInputs,
                    fotosLocal
                };
            }
        }

        const {
            cantidadReal: cantidadRealInput,
            cantidadIdeal: cantidadIdealInput,
            observaciones: observacionesInput,
            fotos: fotosCamera,
            fotosLocal: fotosCameraLocal,
            hallazgoId: hallazgoId,
            isTemporal: isTemporal,
            fotosEliminadas: fotosEliminadas,
        } = hallazgoInputs;

        const hallazgoPrincipalId = hallazgoData.id || hallazgoPrincipalIdInput;
        const levantamientoId = levantamiento.id;
        const sucursalId = levantamiento.sucursalId;

        let arrayFamiliaAdicional = [];

        if (isCampoAdicional)
            arrayFamiliaAdicional = processAdditionalFields(hallazgoInputs);

        if (cantidadIdealInput.trim().length > 0 && cantidadRealInput.trim().length > 0) {

            try {
                if (!isOnline) {

                    const hallazgoStorage = {
                        levantamientoId,
                        hallazgoPrincipalId,
                        sucursalId,
                        hallazgoId,
                        cantidadIdeal: Number(parseInt(cantidadIdealInput)),
                        cantidadReal: Number(parseInt(cantidadRealInput)),
                        observaciones: observacionesInput,
                        fotos: fotosCamera,
                        fotosLocal: fotosCameraLocal,
                        isTemporal: isTemporal,
                        fotosEliminadas: fotosEliminadas,
                    };

                    await guardarHallazgosLocalStorageForSendBD(hallazgoStorage);

                    await updateLevantamientos(levantamientosData, levantamientoId,
                        hallazgoPrincipalId, cantidadIdealInput,
                        cantidadRealInput, observacionesInput,
                        fotosCamera, fotosCameraLocal,
                        hallazgoId, isTemporal, hallazgoData.familiaForm, hallazgoData.grupoHallazgo);

                    return hallazgoStorage;
                } else {
                    const formData = value instanceof FormData ? value : new FormData();
                    formData.append("levantamientoId", levantamientoId);
                    formData.append("levantamientoTemporalId", levantamientoId);
                    formData.append("hallazgoPrincipalId", hallazgoPrincipalId);
                    formData.append("sucursalId", sucursalId);
                    formData.append("cantidadReal", Number(parseInt(cantidadRealInput)));
                    formData.append("cantidadIdeal", Number(parseInt(cantidadIdealInput)));
                    formData.append("observaciones", observacionesInput);
                    formData.append("hallazgoId", idEspecificoHallazgo);
                    formData.append("isTemporal", isTemporal || false);
                    formData.append("fotosEliminadas", fotosEliminadas || []);

                    if (isCampoAdicional)
                        formData.append('arrayFamiliaAdicional', JSON.stringify(arrayFamiliaAdicional));

                    let resHallazgo = await createHallazgoRequestWithLimit(formData);
                    console.log("resHallazgo", resHallazgo);

                    if (resHallazgo.status === "success") {

                        let newHallazgo = resHallazgo.data;
                        console.log("newHallazgo", newHallazgo);

                        hallazgoInputs = {
                            ...hallazgoInputs,
                            cantidadIdeal: newHallazgo.cantidad_ideal ? newHallazgo.cantidad_ideal.toString() : "0",
                            cantidadReal: newHallazgo.cantidad_real ? newHallazgo.cantidad_real.toString() : "0",
                            fotos: new FormData(),
                            hallazgoId: newHallazgo.id
                        };

                        setHallazgoForm(hallazgoInputs);

                        await updateLevantamientos(levantamientosData, levantamientoId,
                            hallazgoPrincipalId, cantidadIdealInput,
                            cantidadRealInput, observacionesInput,
                            new FormData(), fotosCameraLocal,
                            newHallazgo.id, isTemporal, hallazgoData.familiaForm, hallazgoData.grupoHallazgo);

                        return hallazgoInputs;

                    } else {
                        console.log("Error al guardar hallazgo", "Intente escribir nuevamente los datos.");
                    }
                }
            } catch (error) {
                console.log("test hallazgos 1", error.response);
                if (error.response && error.response.data) console.log("test hallazgos 1", error.response.data);
                else console.log("test hallazgos 1", error.message);

            }
        } else console.log("Campos vacios", "Termine de completar los campos");

        return null;
    }

    const handleInputImage = async (value, nameInput = "", fotosLocal = null, updateFromGaleriaFotos = false, fotosEliminadasIds = [], hallazgoFormFotos) => {

        const levantamientosData = await getLevantamientosListLocalStorage();

        let hallazgoInputs = {
            ...hallazgoFormFotos,
            [nameInput]: value,
            fotosEliminadas: fotosEliminadasIds,
        };

        if (fotosLocal !== null) {

            if (!updateFromGaleriaFotos) {

                hallazgoInputs = {
                    ...hallazgoInputs,
                    fotosLocal: [...hallazgoInputs.fotosLocal || [], ...fotosLocal]
                };
            } else {

                hallazgoInputs = {
                    ...hallazgoInputs,
                    fotosLocal
                };
            }
        }

        const {
            cantidadReal: cantidadRealInput,
            cantidadIdeal: cantidadIdealInput,
            observaciones: observacionesInput,
            fotos: fotosCamera,
            fotosLocal: fotosCameraLocal,
            hallazgoId: hallazgoId,
            isTemporal: isTemporal,
            fotosEliminadas: fotosEliminadas,
        } = hallazgoInputs;

        const hallazgoPrincipalId = hallazgoFormFotos.id;
        const levantamientoId = levantamiento.id;
        const sucursalId = levantamiento.sucursalId;

        if (cantidadIdealInput.trim().length > 0 && cantidadRealInput.trim().length > 0) {
            try {

                if (!isOnline) {

                    const hallazgoStorage = {
                        levantamientoId,
                        hallazgoPrincipalId,
                        sucursalId,
                        hallazgoId,
                        cantidadIdeal: cantidadIdealInput,
                        cantidadReal: cantidadRealInput,
                        observaciones: observacionesInput,
                        fotos: fotosCamera,
                        fotosLocal: fotosCameraLocal,
                        isTemporal: isTemporal,
                        fotosEliminadas: fotosEliminadas,
                    };

                    await guardarHallazgosLocalStorageForSendBD(hallazgoStorage);

                    await updateLevantamientos(levantamientosData, levantamientoId,
                        hallazgoPrincipalId, cantidadIdealInput,
                        cantidadRealInput, observacionesInput,
                        fotosCamera, fotosCameraLocal,
                        hallazgoId, isTemporal);

                    return false;

                } else {

                    const formData = value instanceof FormData ? value : new FormData();
                    formData.append("levantamientoId", levantamientoId);
                    formData.append("levantamientoTemporalId", levantamientoId);
                    formData.append("hallazgoPrincipalId", hallazgoPrincipalId);
                    formData.append("sucursalId", sucursalId);
                    formData.append("cantidadReal", cantidadRealInput);
                    formData.append("cantidadIdeal", cantidadIdealInput);
                    formData.append("observaciones", observacionesInput);
                    formData.append("hallazgoId", hallazgoId);
                    formData.append("isTemporal", isTemporal);
                    formData.append("fotosEliminadas", fotosEliminadas);

                    let resHallazgo = await createHallazgoRequestWithLimit(formData);

                    if (resHallazgo.status === "success") {

                        let newHallazgo = resHallazgo.data;

                        hallazgoInputs = {
                            ...hallazgoInputs,
                            fotos: new FormData(),
                            hallazgoId: newHallazgo.id
                        };

                        setHallazgoForm(hallazgoInputs);

                        await updateLevantamientos(levantamientosData, levantamientoId,
                            hallazgoPrincipalId, cantidadIdealInput,
                            cantidadRealInput, observacionesInput,
                            new FormData(), fotosCameraLocal,
                            newHallazgo.id, isTemporal);

                        return resHallazgo;
                    } else
                        console.log("Error al guardar hallazgo", "Intente escribir nuevamente los datos.")
                }
            } catch (error) {
                console.log("test hallazgos 2", error.response);
                console.log("test hallazgos 2", error);
            }

        } else {
            console.log("Campos vacios", "Termine de completar los campos")
        }

        return null;
    }

    const contextValue = {
        levantamiento,
        setLevantamiento,
        typeAuditoria,
        setTypeAuditoria,
        listHallazgos,
        setListHallazgos,
        addHallazgo,
        estadoLevantamiento,
        setEstadoLevantamiento,
        cantidadRealRef,
        cantidadIdealRef,
        observacionesRef,
        hallazgoForm,
        setHallazgoForm,
        handleInput,
        handleInputImage
        /** AGREGAR MÁS FUNCIONES O CAMPOS ADICIONALES */
    };

    return (
        <HallazgosFormContext.Provider value={contextValue}>
            {children}
        </HallazgosFormContext.Provider>
    );
};
