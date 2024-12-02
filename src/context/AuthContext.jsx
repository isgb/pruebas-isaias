import { createContext, useContext, useEffect, useState } from "react";
import { 
    registerRequest,
    loginRequest,
    verifyTokenRequest,
    verifyRefreshTokenRequest,
    iniciarJornadaRequest,
    getTokensRequest
} from "../api/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthApi } from "../api/authApi";
import NetInfo from "@react-native-community/netinfo";
import { Alert, PermissionsAndroid, ToastAndroid } from "react-native";
import Geolocation from '@react-native-community/geolocation';
import { launchCamera } from 'react-native-image-picker';
import { GOOGLE_MAPS_URL, optionsCamera } from "../utils";
import { getToken } from "../helpers/levantamientos";
import { useSQLlite } from "./SQLliteContext";
import { 
    getJornadaOffline, 
    removeJornadaOffline, 
    setJornadaOffline, 
    transformToFormDataWithoutPhotoSelfie,
    addPropertiesToFormDataImages
} from "../helpers/jornadas";
import { obtenerFechaHora } from "../helpers";
import { uploadImagesRequest } from "../api/imagenes";

const authController = new AuthApi();

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth muts be used within an AuthProvider");
    }
    return context;
}

/**
 * Componente AuthProvider que proporciona el contexto de autenticación a sus hijos.
 * 
 * @component
 * @param {Object} props - Las propiedades del componente.
 * @param {React.ReactNode} props.children - Los componentes hijos que consumirán el contexto de autenticación.
 * 
 * @returns {JSX.Element} El componente AuthProvider.
 * 
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * @context
 * @property {Function} signup - Función para registrar un nuevo usuario.
 * @property {Function} signin - Función para iniciar sesión de un usuario.
 * @property {Object} user - El objeto del usuario autenticado.
 * @property {boolean} loading - Estado de carga para los procesos de autenticación.
 * @property {Function} logout - Función para cerrar sesión del usuario.
 * @property {boolean} isAuthenticated - Booleano que indica si el usuario está autenticado.
 * @property {Array} errors - Array de mensajes de error.
 * @property {Function} detectarTokenStorage - Función para detectar el almacenamiento de tokens.
 * @property {boolean} spinnerAuth - Booleano que indica si el spinner está activo.
 * @property {Function} setSpinnerAuth - Función para establecer el estado del spinner.
 * @property {Function} setAuthFormulario - Función para establecer el estado del formulario de autenticación.
 * @property {Function} checkRefreshWithForm - Función para verificar y actualizar el token con datos del formulario.
 * @property {Function} iniciarJornadaConSelfie - Función para iniciar una jornada con selfie.
 * @property {Function} requestCameraPermission - Función para solicitar permiso de cámara.
 * @property {Function} getNewPhotoSelfie - Función para obtener una nueva foto de selfie.
 * @property {Function} appendSelfiePhotosToFormData - Función para agregar fotos de selfie a un FormData.
 * @property {Function} getCurrenSelfieLocation - Función para obtener la ubicación actual de una selfie.
 * @property {Function} updateTipoJornada - Función para actualizar el tipo de jornada de un usuario.
 * @property {Function} handleOnlineJornada - Función para manejar una jornada en línea.
 * @property {Function} iniciarJornada - Función para iniciar una jornada.
 * @property {Function} getUserJornadaAbierta - Función para obtener si un usuario tiene una jornada abierta.
 * @property {Function} handleLoginOffline - Función para manejar el inicio de sesión sin conexión.
 * @property {Function} handleRegisterOffline - Función para manejar el registro sin conexión.
 * @property {Function} handleGetTokens - Función para obtener tokens de un usuario.
 * @property {Function} sendAndSaveDataSelfie - Función para enviar y guardar datos de selfie.
 * @property {Function} checkAndSendSelfiePhotos - Función para verificar y enviar fotos de selfie.
 * @property {Function} handleSendDataUsersOnConnectionRestored - Función para enviar datos de usuarios cuando se restablece la conexión.
 * @property {Function} handleSendAllDataUsersOnConnectionRestored - Función para enviar todos los datos de usuarios cuando se restablece la conexión.
 * @property {Function} sendPendingSelfies - Función para enviar selfies pendientes.
 */

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOnlineAuth, setIsOnlineAuth] = useState(false);
    const [spinnerAuth, setSpinnerAuth] = useState(false);
    const [authFormulario, setAuthFormulario] = useState(false);
    const [isConnected, setConnectedState] = useState(false);

    // 
    const { getUser, 
            validatePassword, 
            saveUser, 
            createUsersTable, 
            saveDataUser,
            createDataUsersTable, 
            getDataUserByFormDataAndEmail, 
            getDataUsersByEmail,
            hasNullTokenByEmail,
            updateTokensByUsername,
            removeDataUserById,
            updateTipoJornadaByEmail,
            getTipoJornadaByUsername,
            getAllDataUsers,
            createSelfiesTable,
            saveSelfiePhoto,
            getSelfiesByJornadaIdAndUsername,
            removeSelfiePhotoById,
            getSelfiesByJornadaIdAndUsernameAndTipoJornada,
            getSelfiesPhotos
        } = useSQLlite();

    // Función para iniciar jornada
    const iniciarJornada = async (formData, isReenvio = false) => {
        try {
            const respJornada = await iniciarJornadaRequest(formData);
            if (respJornada.data.status === "200") {
            return respJornada;
            } else {
            console.log("Error iniciarJornada 1", respJornada.status);
            }
        } catch (error) {
            console.error("Error iniciarJornada 2", error);
        } finally {
            if (!isReenvio) {
            setSpinnerAuth(false);
            }
        }

        return false;
    };

    // Función para detectar una jornada del usuario
    const getUserJornadaAbierta = async (user) => { 
        console.log("getUserJornadaAbierta", user);
        if (user?.statusJornada === 1) {
           return true;
        } else if (user?.email) {
            await createUsersTable();
            const jornadaAbierta = await getTipoJornadaByUsername(user.email);
            return jornadaAbierta === 1;
        }

        return false;
     }

    // Autenticación offline
    const handleLoginOffline = async (userLogin) => {
        try {
            await createUsersTable();
            const userOffline = await getUser(userLogin.email);
            if (userOffline && userOffline.username === userLogin.email) {
                const isPasswordValid = await validatePassword(userLogin.password, userOffline.password);
                if (isPasswordValid) {
                    await iniciarJornadaConSelfie(userLogin);
                } else {
                    Alert.alert('Credenciales incorrectas', 'Vuelva a intentarlo');
                }
            } else {
                Alert.alert('Credenciales incorrectas', 'Vuelva a intentarlo');
            }
        } catch (error) {
            console.error("Error during offline login", error);
            Alert.alert('Error', 'Ocurrió un error durante el inicio de sesión offline. Por favor, inténtelo de nuevo.');
        }
    };

    // Función para registrar un nuevo usuario offline
    const handleRegisterOffline = async (userLogin) => {
        try {
            await createUsersTable();
            const userExists = await getUser(userLogin.email);
            if (!userExists) {
                saveUser(userLogin.email, userLogin.password);
            }
        } catch (error) {
            Alert.alert('Registration Error', 'Hubo un error al registrar el usuario. Por favor, inténtelo de nuevo.');
        }
    };

    // 
    const handleGetTokens = async (user) => {
        try {
            const resGetTokensRequest = await getTokensRequest(user);
            console.log("EXITO resGetTokensRequest", resGetTokensRequest);
            if (resGetTokensRequest.data.data.status === "200") {
                await AsyncStorage.setItem('token', JSON.stringify(resGetTokensRequest.data.data.token));
                await AsyncStorage.setItem('refreshtoken', JSON.stringify(resGetTokensRequest.data.data.refreshtoken));
                return resGetTokensRequest;
            }
            return false;
        } catch (error) {
            console.log("ERROR resGetTokensRequest", error);
            return false;
        }
    };

    // Función para enviar y guardar datos de selfie
    const sendAndSaveDataSelfie = async (formDataUser, jornadaId, statusJornada , userData = null) => {
        try {
            await createSelfiesTable();
            const currentUser = user ? user : userData;
            const existingSelfies = await getSelfiesByJornadaIdAndUsernameAndTipoJornada(jornadaId, currentUser.email, statusJornada);

            if (existingSelfies && existingSelfies.length > 0) {
                for (const selfie of existingSelfies) {
                    const { formData } = selfie;
                    const respUploadImagesRequest = await uploadImagesRequest(formData);
                    if (respUploadImagesRequest && respUploadImagesRequest.status === '200') {
                        console.log("sendAndSaveDataSelfie EXITO uploadImagesRequest", respUploadImagesRequest);
                        await removeSelfiePhotoById(selfie.id);
                    } 
                }
                return true;
            } 

            const formDataToSend = formDataUser.formdata ? formDataUser.formdata : formDataUser;
            const formDataSelfie = await addPropertiesToFormDataImages(formDataToSend, "JORNADA", jornadaId, statusJornada);
            const respUploadImagesRequest = await uploadImagesRequest(formDataSelfie);

            if (respUploadImagesRequest && respUploadImagesRequest.status === '200') {
                console.log("sendAndSaveDataSelfie EXITO uploadImagesRequest", respUploadImagesRequest);
            } else {
                console.warn("sendAndSaveDataSelfie Error al enviar selfie:", currentUser.email);
                await saveSelfiePhoto(jornadaId, formDataSelfie, currentUser.email);
            }
            return true;

        } catch (error) {
            console.error("Error in sendAndSaveDataSelfie", error);
            return false;
        }
    };

    const checkAndSendSelfiePhotos = async (jornadaId, email) => {
        try {
            const selfies = await getSelfiesByJornadaIdAndUsername(jornadaId, email);
            if (selfies.length > 0) {
                for (const selfie of selfies) {
                    const { jornadaId, formData, email } = selfie;
                    const respUploadImagesRequest = await uploadImagesRequest(formData);
                    if (respUploadImagesRequest && respUploadImagesRequest.data.status === '200') {
                        console.log("checkAndSendSelfiePhotos EXITO uploadImagesRequest", respUploadImagesRequest);
                        await removeSelfiePhotoById(selfie.id);
                    } else {
                        console.warn("checkAndSendSelfiePhotos Error al enviar selfie:", email);
                    }
                }
            }
            return true;
        } catch (error) {
            console.error("Error checkAndSendSelfiePhotos", error);
            return false;
        }
    };

    // Función para enviar datos de usuarios cuando se restablece la conexión
    const handleSendDataUsersOnConnectionRestored = async (stateConnection) => {

        // console.log("handleSendDataUsersOnConnectionRestored", stateConnection, user?.email);

        //  Alert.alert('CREDENCIALES: ', user);
         
        if (stateConnection.isConnected && user?.email) {
            const jornadaAbierta = await getUserJornadaAbierta(user);
            const token = await AsyncStorage.getItem('token');

            // Alert.alert(
            //     "Jornada abierta" + jornadaAbierta, 
            // );

            if (jornadaAbierta && !token) {
                const dataUsers = await getDataUsersByEmail(user?.email);

                if (dataUsers) {
                    console.log(" ------- COMPROBAR DATOS --------")
                    const hasNull = hasNullTokenByEmail(user?.email);

                    if (hasNull) {
                        // HACER PETICION DE LOGIN PARA OBTENER TOKEN
                        const token = await AsyncStorage.getItem('token');
                        const refreshToken = await AsyncStorage.getItem('refreshtoken');
                        if (!token && !refreshToken) {
                            const respHandleGetTokens = await handleGetTokens(user);
                            if (respHandleGetTokens?.data?.data?.token) {
                                await updateTokensByUsername(user.email, JSON.stringify(respHandleGetTokens.data.data.token), JSON.stringify(respHandleGetTokens.data.data.refreshtoken));
                            } else {
                                console.warn('Error: No token received in response.');
                                return;
                            }
                        } else if (token && refreshToken) {
                            await updateTokensByUsername(user.email, token, refreshToken);
                        } else {
                            console.warn('Error: Missing token or refreshToken.');
                            return;
                        }
                    } 

                    // Validar si se llego actualizar u obtener un token
                    let nuevoToken = await AsyncStorage.getItem('token');
                    if (nuevoToken !== token) {
                        nuevoToken = await AsyncStorage.getItem('token');
                    }

                    await dataUsers.map(async dataUser => {

                        console.log("ID DATA USER : ", dataUser.id);

                        if(dataUser.endpoint === 'jornadasrequest'){
                           const formdataJornadaUser = transformToFormDataWithoutPhotoSelfie(dataUser.formdata);
                           formdataJornadaUser.append("password", user.password);
                           formdataJornadaUser.append("token", nuevoToken);
                           formdataJornadaUser.append("fechaEvento", dataUser.created_at);
                           
                           const respiniciarJornadaRequest = await iniciarJornada(formdataJornadaUser);
                           if (respiniciarJornadaRequest && 
                               respiniciarJornadaRequest.data.status === "200" &&
                               respiniciarJornadaRequest.data.jornada) {
                                
                               const jornadaId = respiniciarJornadaRequest.data.jornada.id;
                               const statusJornada = respiniciarJornadaRequest.data.statusJornada;

                                 console.log("EXITO:", dataUser.id);
                                // TODO: Enviar data de selfies al servidor
                                // Proceso de envio de selfies
                                await sendAndSaveDataSelfie(dataUser, jornadaId, statusJornada);
                                // Eliminar dataUser de la tabla
                                await removeDataUserById(dataUser.id);
                                // FIN TODO
                           } else {
                               console.warn("Error al guardar jornada para el usuario:", dataUser);
                               console.warn("Error formdataJornadaUser", formdataJornadaUser);
                               console.warn("Error respiniciarJornadaRequest", respiniciarJornadaRequest);
                               console.warn("Error TOKEN", token);
                            //    Alert.alert('Error DEV', 
                            //      'USUARIO: ' + dataUser.email + '\n' +
                            //      'CONTRASEÑA: ' + dataUser.password + '\n' +
                            //      'TOKEN: ' + token + '\n' +
                            //      'ERROR RESPUESTA DEL SERVIDOR: ' + respiniciarJornadaRequest + '\n' +
                            //      'DATOS QUE SE ENVIAN: ' + JSON.stringify(formdataJornadaUser) + '\n'
                            //    );
                           }
                        }

                    });
                    console.log(" ------- FIN COMPROBAR DATOS --------")
                    return;
                }
            }
        }
    };

    const handleSendAllDataUsersOnConnectionRestored = async (stateConnection) => {
        console.log("handleSendAllDataUsersOnConnectionRestored", stateConnection);
        if (stateConnection.isConnected) {
            const allDataUsers = await getAllDataUsers();
            if (allDataUsers.length > 0) {
                console.log(" ------- COMPROBAR TODOS LOS DATOS --------");
                for (const dataUser of allDataUsers) {
                    const user = await getUser(dataUser.email);
                    if (user) {
                        const hasNull = await hasNullTokenByEmail(user.email);
                        if (hasNull) {
                            const token = await AsyncStorage.getItem('token');
                            const refreshToken = await AsyncStorage.getItem('refreshtoken');
                            if (!token && !refreshToken) {
                                const respHandleGetTokens = await handleGetTokens(user);
                                if (respHandleGetTokens?.data?.data?.token) {
                                    await updateTokensByUsername(user.email, JSON.stringify(respHandleGetTokens.data.data.token), JSON.stringify(respHandleGetTokens.data.data.refreshtoken));
                                } else {
                                    console.warn('Error: No token received in response.');
                                    continue;
                                }
                            } else if (token && refreshToken) {
                                await updateTokensByUsername(user.email, token, refreshToken);
                            } else {
                                console.warn('Error: Missing token or refreshToken.');
                                continue;
                            }
                        }

                        let nuevoToken = await AsyncStorage.getItem('token');
                        if (nuevoToken !== token) {
                            nuevoToken = await AsyncStorage.getItem('token');
                        }

                        if (dataUser.endpoint === 'jornadasrequest') {
                            const formdataJornadaUser = transformToFormDataWithoutPhotoSelfie(dataUser.formdata);
                            formdataJornadaUser.append("password", user.password);
                            formdataJornadaUser.append("token", nuevoToken);

                            const respiniciarJornadaRequest = await iniciarJornada(formdataJornadaUser);
                            if (respiniciarJornadaRequest &&
                                respiniciarJornadaRequest.data.status === "200" &&
                                respiniciarJornadaRequest.data.jornada) {

                                const jornadaId = respiniciarJornadaRequest.data.jornada.id;
                                const statusJornada = respiniciarJornadaRequest.data.statusJornada;

                                console.log("EXITO:", formdataJornadaUser);
                                console.log("EXITO iniciarJornadaRequest", respiniciarJornadaRequest);

                                await sendAndSaveDataSelfie(dataUser, jornadaId, statusJornada);
                                await removeDataUserById(dataUser.id);
                            } else {
                                console.warn("Error al guardar jornada para el usuario:", dataUser);
                                console.warn("Error formdataJornadaUser", formdataJornadaUser);
                                console.warn("Error respiniciarJornadaRequest", respiniciarJornadaRequest);
                            }
                        }
                    }
                }
                console.log(" ------- FIN COMPROBAR TODOS LOS DATOS --------");
            }
        }
    };

    // Función para enviar selfies pendientes
    const sendPendingSelfies = async () => {
    try {
        const selfies = await getSelfiesPhotos();
        if (selfies.length > 0) {
        for (const selfie of selfies) {
            const { jornadaId, formData, email } = selfie;
            const respUploadImagesRequest = await uploadImagesRequest(formData);
            if (respUploadImagesRequest && respUploadImagesRequest.status === '200') {
                console.log("sendPendingSelfies EXITO uploadImagesRequest", respUploadImagesRequest);
                await removeSelfiePhotoById(selfie.id);
            } else {
                console.warn("sendPendingSelfies Error al enviar selfie:", email);
            }
        }
        }
        return true;
    } catch (error) {
        console.error("Error sendPendingSelfies", error);
        return false;
    }
    };

    useEffect(() => {
        const interval = setInterval(async () => {
            const dataUsers = await getAllDataUsers();
            // console.log("setInterval dataUsers", dataUsers);
            if (dataUsers.length > 0 ) {
                
                // ToastAndroid.showWithGravity(
                //     "Ejecutando metodo de envio de datos pendientes..." + JSON.stringify(dataUsers),
                //     ToastAndroid.SHORT,
                //     ToastAndroid.CENTER
                // );

                // Alert.alert(
                //     "Información",
                //     "Ejecutando metodo de envio de datos pendientes..." + JSON.stringify(dataUsers),
                // );

                await handleSendDataUsersOnConnectionRestored({ isConnected: isOnlineAuth });
                await sendPendingSelfies();
            } else {
                clearInterval(interval); // Limpiar el intervalo si no hay datos
            }
        }, 5000); // Ejecutar cada 5 segundos

        return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente

    }, [isOnlineAuth, isAuthenticated, user]);

    // useEffect(() => {
        
    //     const handleSendDataForConnectionRestored = async () => {
    //         console.log("CONEXION RESTABLECIDA", isOnlineAuth, user);
    //         if (isOnlineAuth && user?.email) {
    //             console.log("CONEXION RESTABLECIDA", isOnlineAuth, user);
    //             await handleSendDataUsersOnConnectionRestored({ isConnected: isOnlineAuth });
    //             await sendPendingSelfies();
    //         }
    //     };

    //     handleSendDataForConnectionRestored();
        
    // }, [isOnlineAuth, isAuthenticated, user]);

    useEffect(() => {
        // Subscribe
        const unsubscribe = NetInfo.addEventListener(async state => {
            // removeJornadaOffline();
            setIsOnlineAuth(state.isConnected);
        });

        return () => {
            // Unsubscribe
            unsubscribe();
        };
    }, []);

    useEffect(() => {

        async function checklogin() {

            const token = await AsyncStorage.getItem('token');
            const jornadaOffline = await getJornadaOffline();
            console.log("checklogin", token)
            console.log("jornadaOffline 1", jornadaOffline)

            if (!jornadaOffline || !token) {
                console.log("solo token y jornadaOffline");
                setIsAuthenticated(false);
                setLoading(false);
                setSpinnerAuth(false);
                setUser(null);
                return;
            }

            await NetInfo.fetch().then(state => {
                console.log("CONEXION ", state.isConnected)
                if (!state.isConnected) {
                    if (token) {
                        console.log("solo token y offline", isConnected);
                        setIsAuthenticated(true);
                        setLoading(false);
                        setSpinnerAuth(false);
                        return;
                    }

                    if (jornadaOffline) {
                        console.log("jornadaOffline 2", jornadaOffline);
                        setIsAuthenticated(true); 
                        setLoading(false);
                        setSpinnerAuth(false);
                        return;
                    }
                }
            });

            try {

                console.log("EMPIEZA RESPUESTA")
                console.log("EL TOKEN", token) 

                const res = await verifyTokenRequest(JSON.parse(token))
                    .catch((error) => {
                        console.log("RESPUESTA interna: ", error.response);
                    })
                    .finally(() => { });

                console.log("RESPUESTA 1", res)
                console.log("RESPUESTA 2", res.data.status)

                // ////////////////////////////
                try {
                    if (res.data.status == "401") {

                        console.log("ENTRO 401")

                        if (res.data.message == "Expired") {

                            console.log("ENTRO Expired", res.data.message)

                            const refreshToken = await AsyncStorage.getItem('refreshtoken');
                            // console.log("refreshToken:",refreshToken)

                            const responseRefresh = await verifyRefreshTokenRequest(refreshToken)
                                .catch((resp) => {
                                    console.log("verifyRefreshTokenRequest", resp)
                                })
                                .finally(() => {
                                    setSpinnerAuth(false)
                                });

                            console.log("responseRefresh", responseRefresh)

                            if (responseRefresh.data.status == "401") {
                                console.log("entro aqui 2");

                                if (responseRefresh.data.message == "Expired") {
                                    setIsAuthenticated(false)
                                    setUser(false)
                                    setLoading(false)
                                    const tokenStorage = await AsyncStorage.removeItem("token");
                                    const refreshTokenStorage = await AsyncStorage.removeItem("refreshtoken");
                                    setSpinnerAuth(false)
                                    return
                                }

                            }

                            if (!responseRefresh.data) {
                                console.log("entro aqui 1");
                                setIsAuthenticated(false)
                                setLoading(false)
                                setSpinnerAuth(false)
                                return;
                            }

                            try {
                                console.log("entro aqui 3");
                                await AsyncStorage.setItem('token', JSON.stringify(responseRefresh.data.token))
                                // await AsyncStorage.setItem('refreshtoken', JSON.stringify(res.data.data.refreshToken))
                                await AsyncStorage.setItem('refreshtoken', JSON.stringify(responseRefresh.data.refreshtoken))
                            } catch (error) {
                                console.log(error)
                                setSpinnerAuth(false)
                            }

                            setIsAuthenticated(true)
                            setUser(responseRefresh.data)
                            setLoading(false)
                            setSpinnerAuth(false)
                            return;

                        } else {
                            setIsAuthenticated(false)
                            setUser(false)
                            setLoading(false)
                            const tokenStorage = await AsyncStorage.removeItem("token");
                            const refreshTokenStorage = await AsyncStorage.removeItem("refreshtoken");
                            setSpinnerAuth(false)
                        }
                    }
                } catch (error) {
                    console.log(error.response);
                    setIsAuthenticated(false)
                    setUser(false)
                    setLoading(false)
                    const tokenStorage = await AsyncStorage.removeItem("token");
                    const refreshTokenStorage = await AsyncStorage.removeItem("refreshtoken");
                    setSpinnerAuth(false)
                }
                // ////////////////////////////

                if (!res.data) {
                    setIsAuthenticated(false)
                    setLoading(false)
                    setSpinnerAuth(false)
                    return;
                }

                setIsAuthenticated(true)
                setUser(res.data)
                setLoading(false)
                setSpinnerAuth(false)

            } catch (error) {

                try {

                    if (error.response.data.message == "Expired") {

                        const refreshToken = await AsyncStorage.getItem('refreshtoken');

                        const res = await verifyRefreshTokenRequest(refreshToken)
                            .finally(() => {
                                setSpinnerAuth(false)
                            });

                        if (!res.data) {
                            setIsAuthenticated(false)
                            setLoading(false)
                            setSpinnerAuth(false)
                            return;
                        }

                        try {
                            await AsyncStorage.setItem('token', JSON.stringify(res.data.token))
                            await AsyncStorage.setItem('refreshtoken', JSON.stringify(res.data.refreshtoken))
                        } catch (error) {
                            console.log(error)
                            setSpinnerAuth(false)
                        }

                        setIsAuthenticated(true)
                        setUser(res.data)
                        setLoading(false)
                        setSpinnerAuth(false)
                    }
                    else {
                        setIsAuthenticated(false)
                        setUser(false)
                        setLoading(false)
                        const tokenStorage = await AsyncStorage.removeItem("token");
                        const refreshTokenStorage = await AsyncStorage.removeItem("refreshtoken");
                        setSpinnerAuth(false)
                    }

                } catch (error) {
                    console.log(error);
                    setSpinnerAuth(false)
                }

                setSpinnerAuth(false)
            }
        }

        setSpinnerAuth(true)
        checklogin()

    }, [])

    // Funcion para pedir permiso de camara
    const requestCameraPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Permiso para usar la cámara',
                        message: 'Esta aplicación necesita acceso a tu cámara',
                        buttonNeutral: 'Preguntar más tarde',
                        buttonNegative: 'Cancelar',
                        buttonPositive: 'OK',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Permiso de cámara concedido');
                } else {
                    console.log('Permiso de cámara denegado');
                }
            }
        } catch (err) {
            console.warn(err);
        }
    };

    async function checkRefreshWithForm(response) {

        setSpinnerAuth(true)
        console.log("ENTRO A checkRefreshWithForm")
        // ////////////////////////////
        try {

            if (response.data.status == "401") {

                console.log("ENTRO 401")

                if (response.data.message == "Expired") {

                    console.log("ENTRO Expired")

                    const refreshToken = await AsyncStorage.getItem('refreshtoken');
                    // console.log("refreshToken:",refreshToken)

                    const responseRefresh = await verifyRefreshTokenRequest(refreshToken)
                        .finally(() => {
                            setSpinnerAuth(false)
                        });

                    if (responseRefresh.data.status == "401") {

                        if (responseRefresh.data.message == "Expired") {
                            setIsAuthenticated(false)
                            setUser(false)
                            setLoading(false)
                            const tokenStorage = await AsyncStorage.removeItem("token");
                            const refreshTokenStorage = await AsyncStorage.removeItem("refreshtoken");
                            setSpinnerAuth(false)
                            return false
                        }
                    }

                    if (!responseRefresh.data) {
                        setIsAuthenticated(false)
                        setLoading(false)
                        setSpinnerAuth(false)
                        return false;
                    }

                    try {

                        await AsyncStorage.setItem('token', JSON.stringify(responseRefresh.data.token))
                        await AsyncStorage.setItem('refreshtoken', JSON.stringify(responseRefresh.data.refreshtoken))
                        console.log("TODO OK")

                    } catch (error) {
                        console.log(error)
                        setSpinnerAuth(false)
                    }

                    setIsAuthenticated(true)
                    setUser(responseRefresh.data)
                    setLoading(false)
                    setSpinnerAuth(false)
                    return;

                } else {
                    setIsAuthenticated(false)
                    setUser(false)
                    setLoading(false)
                    const tokenStorage = await AsyncStorage.removeItem("token");
                    const refreshTokenStorage = await AsyncStorage.removeItem("refreshtoken");
                    setSpinnerAuth(false)
                    setAuthFormulario(false)
                }
            }

        } catch (error) {
            console.log(error.response);
            setIsAuthenticated(false)
            setUser(false)
            setLoading(false)
            const tokenStorage = await AsyncStorage.removeItem("token");
            const refreshTokenStorage = await AsyncStorage.removeItem("refreshtoken");
            setSpinnerAuth(false)
            setAuthFormulario(false)
        }
        // ///////////////////////////
    }

    // Función para construir un nuevo objeto de foto de selfie
    const getNewPhotoSelfie = (response) => {
        return response.assets.map(asset => ({
            uri: asset.uri,
            type: asset.type,
            fileName: asset.fileName,
            name: asset.fileName,
            fileSize: asset.fileSize,
            width: asset.width,
            height: asset.height,
        }));
    };

    // Función para agregar fotos de selfie a un FormData
    const appendSelfiePhotosToFormData = (response, formData) => {
        const newPhotoSelfie = getNewPhotoSelfie(response);
        newPhotoSelfie.forEach((photo, index) => {
            if (photo.fileName) {
                formData.append(`photoSelfie[]`, {
                    uri: photo.uri,
                    type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
                    name: `photo_${photo.fileName}`,
                });
            }
        });

        return formData;
    };

    // Función para obtener la ubicación actual de una selfie
    const getCurrenSelfieLocation = (formData) => {

        const MAX_RETRIES = 5; // Número máximo de reintentos
        const RETRY_DELAY = 1000; // Tiempo de espera inicial en milisegundos

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        return new Promise((resolve, reject) => {
            const attemptGeolocation = async (attempts = 0) => {
                Geolocation.getCurrentPosition(
                    async position => {
                        const { latitude, longitude } = position.coords;

                        if (latitude && longitude) {
                            try {
                                let latitud = latitude ? latitude : '';
                                let longitud = longitude ? longitude : '';
                                let url = (latitude && longitude) ? `${GOOGLE_MAPS_URL}${latitude},${longitude}` : '';

                                formData.append("url", url);
                                formData.append("latitud", latitud);
                                formData.append("longitud", longitud);
                                resolve(formData);

                            } catch (error) {
                                console.error("Error getCurrentSelfieLocation", error);
                                Alert.alert('Error al crear selfie, vuelva a intentarlo.');
                                resolve(false);
                            }
                        } else {
                            Alert.alert('Localizacion no disponible. Vuelva a intentarlo.');
                            resolve(false);
                        }
                    },
                    async error => {
                        if (attempts < MAX_RETRIES) {
                            ToastAndroid.showWithGravity(
                                `Reintentando obtener localización (${attempts + 1}/${MAX_RETRIES})...`,
                                ToastAndroid.SHORT,
                                ToastAndroid.CENTER
                            );
                            await sleep(RETRY_DELAY * (attempts + 1)); // Espera exponencial antes de reintentar
                            attemptGeolocation(attempts + 1);
                        } else {
                            Alert.alert('ERROR LOCALIZACIÓN', 'INTENTE NUEVAMENTE');
                            console.log("ERROR LOCALIZACIÓN", error);
                            setSpinnerAuth(false);
                            resolve(false);
                        }
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: 10000
                    }
                );
            };

            attemptGeolocation();
        });

    };

    // Función para actualizar el tipo de jornada de un usuario
    const updateTipoJornada = async (email, tipoJornada) => {
        try {
            await updateTipoJornadaByEmail(email, tipoJornada);
            console.log(`Tipo de jornada actualizado para el usuario ${email}`);
        } catch (error) {
            console.error("Error al actualizar el tipo de jornada", error);
        }
    };

    // Función para manejar una jornada en línea
    const handleOnlineJornada = async (respFormDataCurrentLocation, user) => {
        if (respFormDataCurrentLocation) {
            respFormDataCurrentLocation.append("password", user.password);
            let respJornada = await iniciarJornada(respFormDataCurrentLocation);
            console.log("respJornada iniciarJornadaConSelfie", respJornada);
            if (respJornada.data && respJornada.data.status === "200") {
                try {

                    ToastAndroid.showWithGravity(
                        `Se guardo la jornada correctamente`,
                        ToastAndroid.SHORT,
                        ToastAndroid.CENTER
                    );

                    await AsyncStorage.setItem('token', JSON.stringify(respJornada.data.token));
                    await AsyncStorage.setItem('refreshtoken', JSON.stringify(respJornada.data.refreshtoken));

                    const jornadaId = respJornada.data.jornada.id;
                    const statusJornada = respJornada.data.statusJornada;

                    console.log("user antes de selfie", user);
                    await sendAndSaveDataSelfie(respFormDataCurrentLocation, jornadaId, statusJornada, user);
                    console.log("SE GUARDO SELFIE INCIO JORNADA DE FORMA ONLINE");

                    setIsAuthenticated(true);
                    setUser({
                        ...respJornada.data,
                        email: user.email,
                        password: user.password
                    });
                    setAuthFormulario(true);
                    setSpinnerAuth(false);

                    // Registrar usuario offline
                    await handleRegisterOffline(user);
                } catch (error) {
                    console.log("ERROR signin", error);
                    setSpinnerAuth(false);
                }
            } else {
                console.log("Error respuesta iniciarJornada", respJornada);
                console.warn('Error al crear jornada, vuelva a intentarlo.', `ERROR ${respJornada?.data?.status}`);
                setSpinnerAuth(false);
            }
        }
    };

    // Función para iniciar jornada con selfie
    const iniciarJornadaConSelfie = async (user) => {

        const jornadaAbierta = await getUserJornadaAbierta(user);
        if (jornadaAbierta && 
            !isAuthenticated && 
            !isOnlineAuth) 
        {
            console.log("INICIAR JORNADA OFFLINE 1",user);
            setIsAuthenticated(true);
            setUser(user);
            setAuthFormulario(true);
            setSpinnerAuth(false);
            return;
        }

        await requestCameraPermission();
        setTimeout(async () => {
            await launchCamera(optionsCamera, async (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.error) {
                    console.log('ImagePicker Error: ', response.error);
                } else {
                    setSpinnerAuth(true);

                    const formData = new FormData();
                    const newPhotoSelfie = getNewPhotoSelfie(response);
                    newPhotoSelfie.forEach((photo) => {
                        if (photo.fileName) {
                            formData.append(`photoSelfie[]`, {
                                uri: photo.uri,
                                type: 'image/jpeg',
                                name: `photo_${photo.fileName}`,
                            });
                        }
                    });

                    formData.append("email", user.email);
                    formData.append("tipoJornada", 1);
                    formData.append("fechaHoraInicio", obtenerFechaHora());

                    const respFormDataCurrentLocation = await getCurrenSelfieLocation(formData);

                    if (!isOnlineAuth) {
                        await setJornadaOffline(respFormDataCurrentLocation);
                        const jornadaOffline = await getJornadaOffline();

                        // if (jornadaOffline) {
                            console.log("INICIAR JORNADA OFFLINE 2");

                            const token = await AsyncStorage.getItem('token');
                            const refreshToken = await AsyncStorage.getItem('refreshtoken');
                            const respcreateDataUsersTable = await createDataUsersTable();
                            if (respcreateDataUsersTable) {
                                const existingData = await getDataUserByFormDataAndEmail(user.email, JSON.stringify(respFormDataCurrentLocation));
                                console.log("existingData", existingData);
                                if (!existingData) {
                                    console.log("GUARDANDO DATA USER OFFLINE");
                                    const fechaHora = obtenerFechaHora();
                                    await saveDataUser(JSON.stringify(respFormDataCurrentLocation), 
                                                       'jornadasrequest', 
                                                       user.email, 
                                                       null, 
                                                       null, 
                                                       token,
                                                       refreshToken,
                                                       1,
                                                       fechaHora);
                                    await updateTipoJornada(user.email, 1);
                                }
                                setIsAuthenticated(true);
                                setUser(user);
                                setAuthFormulario(true);
                                setSpinnerAuth(false);
                            }

                        // } else {
                        //     Alert.alert('Error', 'Ocurrió un error al iniciar la jornada offline.');
                        //     setSpinnerAuth(false);
                        // }
                    }
                    else {
                        await handleOnlineJornada(respFormDataCurrentLocation, user);
                    }
                }
            });
        }, 500);

    };

    // Función para iniciar sesión 
    const signin = async (user) => {

        setSpinnerAuth(true)
        console.log("ENTRO A SIGNIN", user)
        try {
            const res = await loginRequest(user).finally(async (resp) => {
                if (resp === undefined) {
                    setSpinnerAuth(false)
                    if (!isOnlineAuth) {
                        // EMPIEZA LOGIN OFFLINE
                        await handleLoginOffline(user);
                        return;
                    }
                }
            })

            // console.log("signin res: ", res);
            if (res.data.data.status === "200" &&
                res.data.data.statusJornada === 0) 
            {

                ToastAndroid.showWithGravity(
                    `Se inicio sesión correctamente`,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );

                await iniciarJornadaConSelfie(user);
            }
            else if (res.data.data.status === "200" &&
                (res.data.data.statusJornada === 1 || res.data.data.statusJornada === 2)) 
            {
                //  --- JORNADA VALIDADA ---
                try {
                    await AsyncStorage.setItem('token', JSON.stringify(res.data.data.token))
                    await AsyncStorage.setItem('refreshtoken', JSON.stringify(res.data.data.refreshtoken))
                } catch (error) {
                    console.log("ERROR signin", error)
                    setSpinnerAuth(false)
                }

                console.log("EJECUTANDO JORNADA VALIDADA")
                setIsAuthenticated(true)
                setUser({
                    ...res.data.data,
                    email: user.email,
                    password: user.password
                })
                setSpinnerAuth(false)
                setAuthFormulario(true)
                // --- JORNADA VALIDADA ---    
            }

        } catch (error) {
            if (error && error.message) {
                console.log("ERROR signin", error.message);
            } else {
                console.log("ERROR signin", error);
            }
            if (error.message === "Network Error") {
                setSpinnerAuth(false);
                return;
            }
            if (error.response) {
                console.log(error.response);
                if (Array.isArray(error.response.data)) {
                    return setErrors(error.response.data);
                }
                if (error.response.status === 404) {
                    return setErrors([error.response.data.message]);
                }
                setErrors([error.response.data.message]);
            } else {
                setErrors(['Ocurrió un error inesperado.']);
            }

            setSpinnerAuth(false)
        }
    }

    // Función para guardar formdata de usuario
    const saveUserData = async (user, formData, tipoJornada = null) => {
        console.log("-------- ENTRANDO A saveUserData -------");
        const token = await AsyncStorage.getItem('token');
        const refreshToken = await AsyncStorage.getItem('refreshtoken');
        const respcreateDataUsersTable = await createDataUsersTable();
        console.log("respcreateDataUsersTable", respcreateDataUsersTable);
        if (respcreateDataUsersTable) {
            const existingData = await getDataUserByFormDataAndEmail(user.email, JSON.stringify(formData));
            console.log("existingData", existingData);
            if (!existingData) {
                console.log("GUARDANDO DATA USER");
                const fechaHora = obtenerFechaHora();
                await saveDataUser(JSON.stringify(formData), 'jornadasrequest', user.email, null, null, token, refreshToken, tipoJornada, fechaHora);
            }
        }
        console.log("-------- FIN ENTRANDO A saveUserData -------");
    };

    // Función para cerrar sesión de manera offline
    const logoutOffline = async () => {
        try {
            const jornadaAbierta = await getUserJornadaAbierta(user);
            if (jornadaAbierta) {
                await requestCameraPermission();
                
                launchCamera(optionsCamera, async (response) => {
                    if (response.didCancel) {
                        console.log('User cancelled image picker');
                    } else if (response.error) {
                        console.log('ImagePicker Error: ', response.error);
                    } else {

                        setSpinnerAuth(true);

                        let formData = new FormData();
                        formData = appendSelfiePhotosToFormData(response, formData);
                        formData.append("email", user.email);
                        formData.append("tipoJornada", 2);
                        formData.append("fechaHoraFin", obtenerFechaHora());
                        const respFormDataCurrentLocation = await getCurrenSelfieLocation(formData);
                        if (respFormDataCurrentLocation) {
                            
                            await setJornadaOffline(respFormDataCurrentLocation);
                            /////////////////////////////////////////
                            await saveUserData(user, respFormDataCurrentLocation, 2);
                            await updateTipoJornadaByEmail(user.email, 2);
                            /////////////////////////////////////////|

                            try {
                                await AsyncStorage.removeItem("token");
                                await AsyncStorage.removeItem("refreshtoken");
                                setIsAuthenticated(false);
                                setUser(null);
                                setSpinnerAuth(false);
                                setAuthFormulario(false);
                                removeJornadaOffline();
                            } catch (error) {
                                console.log("logout", error);
                                Alert.alert('Error', 'Ocurrió un error al cerrar sesión offline.');
                                setSpinnerAuth(false);
                            }
                        }
                        setSpinnerAuth(false);
                    }
                });
            } else {
                Alert.alert('Error', 'No puede proceder sin una jornada activa.');
                setSpinnerAuth(false);
            }
        } catch (error) {
            console.log(error);
            setSpinnerAuth(false);
        }
    };

    // Función para cerrar sesión de manera online
    const logoutOnline = async () => {

        console.log("Finalizar jornada");

        await requestCameraPermission();
        launchCamera(optionsCamera, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {

                setSpinnerAuth(true);

                const formData = new FormData();
                const newPhotoSelfie = getNewPhotoSelfie(response);
                newPhotoSelfie.forEach((photo) => {
                    if (photo.fileName) {
                        formData.append(`photoSelfie[]`, {
                            uri: photo.uri,
                            type: 'image/jpeg',
                            name: `photo_${photo.fileName}`,
                        });
                    }
                });

                const token = await getToken();
                formData.append("token", token);
                formData.append("tipoJornada", 2);

                const respFormDataCurrentLocation = await getCurrenSelfieLocation(formData);
                if (respFormDataCurrentLocation) {
                    console.log("respFormDataCurrentLocation", respFormDataCurrentLocation);
                    let respJornada = await iniciarJornada(respFormDataCurrentLocation);
                    console.log("respJornada logoutOnline", respJornada);
                    if (respJornada.data.status === "200") {
                        try {
                            await AsyncStorage.removeItem("token");
                            await AsyncStorage.removeItem("refreshtoken");

                            const jornadaId = respJornada.data.jornada.id;
                            const statusJornada = respJornada.data.statusJornada;
                            await sendAndSaveDataSelfie(respFormDataCurrentLocation, jornadaId, statusJornada, user);
                            console.log("SE GUARDO SELFIE FIN JORNADA DE FORMA ONLINE");
                            setIsAuthenticated(false);
                            setUser(null);
                            setSpinnerAuth(false);
                            setAuthFormulario(false);
                        } catch (error) {
                            console.log("logout", error);
                            setSpinnerAuth(false);
                        }
                    }
                }
                setSpinnerAuth(false);
            }
        });
    };
    
    // Función para confirmar al usuario cierre de sesión
    const confirmLogout = async (handleLogout) => {
        Alert.alert(
            "Terminar Jornada",
            "¿Está seguro que desea terminar la jornada?",
            [
                {
                    text: "No, solo cerrar sesión.",
                    onPress: async () => {
                        console.log("Cerrar sesión", user);
                        try {
                            setIsAuthenticated(false);
                            setUser(null);
                            setSpinnerAuth(false);
                            setAuthFormulario(false);
                        } catch (error) {
                            console.log(error);
                            setSpinnerAuth(false);
                        }
                    },
                    style: "cancel"
                },
                {
                    text: "Aceptar",
                    onPress: async () => {
                        handleLogout();
                    }
                }
            ],
        );
    };

    // Función para iniciar cerrado de sesión
    const logout = async () => {

        // Si user?.statusJornada == 1 se obtuvo cuando el usuario esta online
        const jornadaAbierta = await getUserJornadaAbierta(user);
        
        console.log(" ---- CERRANDO SESION ----");
        console.log("jornadaAbierta", jornadaAbierta);  
        console.log("user", user);
        console.log("isOnlineAuth", isOnlineAuth);
        console.log(" ---- FIN CERRANDO SESION ----");

        if ((isOnlineAuth && user?.statusJornada == 1) ||
            (isOnlineAuth && jornadaAbierta)) {
            console.log("ONLINE ENTRO AQUI");
            confirmLogout(logoutOnline);
        }
        else {
            console.log("OFFLINE ENTRO AQUI")
            confirmLogout(logoutOffline);
        }
    }

    const signup = async (user) => {
        try {
            const res = await registerRequest(user)
            setUser(res.data.data);
            setIsAuthenticated(true);
        } catch (error) {
            setErrors(error.response.data)
        }
    }

    const detectarTokenStorage = async () => {
        try {

            const tokenStorage = await AsyncStorage.getItem('token').then((response) => {
                return response
            })

            if (!tokenStorage) {
                return null
            } else {
                return;
            }

        } catch (error) {
            console.log(error)
            setSpinnerAuth(false)
        }
    }

    return (
        <AuthContext.Provider value={{
            signup,
            signin,
            user,
            loading,
            logout,
            isAuthenticated,
            errors,
            detectarTokenStorage,
            spinnerAuth,
            setSpinnerAuth,
            setAuthFormulario,
            checkRefreshWithForm
        }}>
            {children}
        </AuthContext.Provider>
    )
}