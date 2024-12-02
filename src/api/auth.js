import { Alert } from "react-native";
import axios from "./axios";
import { ToastAndroid } from "react-native";

// export const loginRequest = async (user) => {
//     try {
//         console.log("Datos del usuario:", user);

//         const response = await axios.post(`/login`, user, {
//             timeout: 30000, // Aumenta el tiempo de espera a 30 segundos
//             headers: {
//                 'Content-Type': 'text/plain'
//                 // 'Content-Type': 'application/json'
//             },
//             withCredentials: true, // Asegura que las credenciales se envíen con la solicitud
//         });

//         if (response.status === 200) {
//             console.log("Respuesta del servidor:", response.data);
//             return response;
//         } else {
//             console.error("Error en la respuesta del servidor:", response.status);
//             return null;
//         }
//     } catch (error) {
//         if (error.response) {
//             console.error('Error en la solicitud:', error.response.data);
//             Alert.alert('ERROR', `Error en la solicitud: ${error.response.data.message || error.response.data}`);
//         } else if (error.message === 'Request canceled') {
//             console.warn('Solicitud cancelada:', error.message);
//             Alert.alert('SOLICITUD CANCELADA', 'La solicitud ha sido cancelada. Por favor, intenta nuevamente.');
//         } else if (error.code === 'ECONNABORTED') {
//             console.error('Tiempo de espera excedido');
//             Alert.alert('ERROR', 'El tiempo de espera de la solicitud ha sido excedido. Por favor, intenta nuevamente.');
//         } else if (!error.response) {
//             console.log("No se pudo conectar al servidor", JSON.stringify(error));
//             console.log("Status de la respuesta:", error.response ? error.response.status : 'No disponible');
//             Alert.alert('ERROR DE RED', 'No se pudo conectar al servidor. Por favor, vuelva a intentarlo o verifica tu conexión a Internet', `ERROR ${error.code}`);
//         } else if (error.code === 'ERR_NETWORK') {
//             console.error('Error de red:', error.message);
//             Alert.alert('ERROR DE RED', 'Hubo un problema con la red. Por favor, intenta nuevamente.');
//         } else {
//             console.error('Error en la solicitud:', error.message);
//             Alert.alert('ERROR', 'Ocurrió un error en la solicitud. Por favor, intenta nuevamente.');
//         }
//         return null;
//     }
// };

const MAX_RETRIES = 5; // Número máximo de reintentos
const RETRY_DELAY = 1000; // Tiempo de espera inicial en milisegundos

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const loginRequest = async (user) => {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            console.log("Datos del usuario:", user);

            const response = await axios.post(`/login`, user, {
                timeout: 30000, // Aumenta el tiempo de espera a 30 segundos
                headers: {
                    'Content-Type': 'text/plain'
                    // 'Content-Type': 'application/json'
                },
                withCredentials: true, // Asegura que las credenciales se envíen con la solicitud
            });

            if (response.status === 200) {
                console.log("Respuesta del servidor:", response.data);
                return response;
            } else {
                console.error("Error en la respuesta del servidor:", response.status);
                return null;
            }
        } catch (error) {
            attempts++;
            if (attempts >= MAX_RETRIES) {
                if (error.response) {
                    console.error('Error en la solicitud:', error.response.data);
                    Alert.alert('ERROR', `Error en la solicitud: ${error.response.data.message || error.response.data}`);
                } else if (error.message === 'Request canceled') {
                    console.warn('Solicitud cancelada:', error.message);
                    Alert.alert('SOLICITUD CANCELADA', 'La solicitud ha sido cancelada. Por favor, intenta nuevamente.');
                } else if (error.code === 'ECONNABORTED') {
                    console.error('Tiempo de espera excedido');
                    Alert.alert('ERROR', 'El tiempo de espera de la solicitud ha sido excedido. Por favor, intenta nuevamente.');
                } else if (!error.response) {
                    console.log("No se pudo conectar al servidor", JSON.stringify(error));
                    console.log("Status de la respuesta:", error.response ? error.response.status : 'No disponible');
                    Alert.alert('ERROR DE RED', 'No se pudo conectar al servidor. Por favor, vuelva a intentarlo o verifica tu conexión a Internet', `ERROR ${error.code}`);
                } else if (error.code === 'ERR_NETWORK') {
                    console.error('Error de red:', error.message);
                    Alert.alert('ERROR DE RED', 'Hubo un problema con la red. Por favor, intenta nuevamente.');
                } else {
                    console.error('Error en la solicitud:', error.message);
                    Alert.alert('ERROR', 'Ocurrió un error en la solicitud. Por favor, intenta nuevamente.');
                }
                return null;
            } else {
                // console.warn(`Reintentando solicitud (${attempts}/${MAX_RETRIES})...`);
                ToastAndroid.showWithGravity(
                    `Reintentando solicitud (${attempts}/${MAX_RETRIES})...`,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );
                await sleep(RETRY_DELAY * attempts); // Espera exponencial antes de reintentar
            }
        }
    }
};

export const verifyTokenRequest = (token) => axios.post(`/verify`, {token: token}, {
    headers: {
        // 'Content-Type': 'application/json'
        'Content-Type': 'text/plain'
    }
})

export const verifyRefreshTokenRequest = (token) => axios.post(`/verifyrefresh`, {token: token}, {
    headers: {
        // 'Content-Type': 'application/json'
        'Content-Type': 'text/plain'
    }
})

// export const iniciarJornadaRequest = async (formData) => {
//     try {
//         if (!(formData instanceof FormData)) {
//             console.error('formData no es una instancia de FormData');
//             return;
//         }

//         console.log("Datos del formulario:", formData);

//         const response = await axios.post(`/jornadasrequest`, formData, {
//             timeout: 30000, // Aumenta el tiempo de espera a 30 segundos
//             headers: {
//                 'Content-Type': 'multipart/form-data'
//             },
//             withCredentials: true, // Asegura que las credenciales se envíen con la solicitud
//         });

//         if (response.status === 200) {
//             console.log("Respuesta del servidor:", response.data);
//             return response.data;
//         } else {
//             console.error("Error en la respuesta del servidor:", response.status);
//             return null;
//         }
//     } catch (error) {
//         if (error.response) {
//             console.error('Error en la solicitud:', error.response.data);
//         } else if (error.message === 'Request canceled') {
//             console.warn('Solicitud cancelada:', error.message);
//         } else if (error.code === 'ECONNABORTED') {
//             console.error('Tiempo de espera excedido');
//         } else if (!error.response) {
//             console.log("No se pudo conectar al servidor", JSON.stringify(error));
//             console.log("Status de la respuesta:", error.response ? error.response.status : 'No disponible');
//             Alert.alert('ERROR DE RED', 'No se pudo conectar al servidor. Por favor, vuelva a intentarlo o verifica tu conexión a Internet',`ERROR ${error.code}`);
//         } else if (error.code === 'ERR_NETWORK') {
//             console.error('Error de red:', error.message);
//             Alert.alert('ERROR DE RED', 'Hubo un problema con la red. Por favor, intenta nuevamente.');
//         } else {
//             console.error('Error en la solicitud:', error.message);
//         }
//         return null;
//     }
// };

export const iniciarJornadaRequest = async (formData) => {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            if (!(formData instanceof FormData)) {
                console.error('formData no es una instancia de FormData');
                return;
            }

            console.log("Datos del formulario:", formData);

            const response = await axios.post(`/jornadasrequest`, formData, {
                timeout: 30000, // Aumenta el tiempo de espera a 30 segundos
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true, // Asegura que las credenciales se envíen con la solicitud
            });

            if (response.status === 200) {
                console.log("Respuesta del servidor:", response.data);
                return response.data;
            } else {
                console.error("Error en la respuesta del servidor:", response.status);
                return null;
            }
        } catch (error) {
            attempts++;
            if (attempts >= MAX_RETRIES) {
                if (error.response) {
                    console.error('Error en la solicitud:', error.response.data);
                } else if (error.message === 'Request canceled') {
                    console.warn('Solicitud cancelada:', error.message);
                } else if (error.code === 'ECONNABORTED') {
                    console.error('Tiempo de espera excedido');
                } else if (!error.response) {
                    console.log("No se pudo conectar al servidor", JSON.stringify(error));
                    console.log("Status de la respuesta:", error.response ? error.response.status : 'No disponible');
                    Alert.alert('ERROR DE RED', 'No se pudo conectar al servidor. Por favor, vuelva a intentarlo o verifica tu conexión a Internet',`ERROR ${error.code}`);
                } else if (error.code === 'ERR_NETWORK') {
                    console.error('Error de red:', error.message);
                    Alert.alert('ERROR DE RED', 'Hubo un problema con la red. Por favor, intenta nuevamente.');
                } else {
                    console.error('Error en la solicitud:', error.message);
                }
                return null;
            } else {
                console.warn(`Reintentando solicitud (${attempts}/${MAX_RETRIES})...`);
                ToastAndroid.showWithGravity(
                    `Reintentando solicitud (${attempts}/${MAX_RETRIES})...`,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );
                await sleep(RETRY_DELAY * attempts); // Espera exponencial antes de reintentar
            }
        }
    }
};


export const getTokensRequest = async (user) => {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            console.log("Datos del usuario:", user);

            const response = await axios.post(`/obtenertokens`, user, {
                timeout: 30000, // Aumenta el tiempo de espera a 30 segundos
                headers: {
                    'Content-Type': 'text/plain'
                    // 'Content-Type': 'application/json'
                },
                withCredentials: true, // Asegura que las credenciales se envíen con la solicitud
            });

            if (response.status === 200) {
                console.log("Respuesta del servidor:", response.data);
                return response;
            } else {
                console.error("Error en la respuesta del servidor:", response.status);
                return null;
            }
        } catch (error) {
            attempts++;
            if (attempts >= MAX_RETRIES) {
                if (error.response) {
                    console.error('Error en la solicitud:', error.response.data);
                    Alert.alert('ERROR', `Error en la solicitud: ${error.response.data.message || error.response.data}`);
                } else if (error.message === 'Request canceled') {
                    console.warn('Solicitud cancelada:', error.message);
                    Alert.alert('SOLICITUD CANCELADA', 'La solicitud ha sido cancelada. Por favor, intenta nuevamente.');
                } else if (error.code === 'ECONNABORTED') {
                    console.error('Tiempo de espera excedido');
                    Alert.alert('ERROR', 'El tiempo de espera de la solicitud ha sido excedido. Por favor, intenta nuevamente.');
                } else if (!error.response) {
                    console.log("No se pudo conectar al servidor", JSON.stringify(error));
                    console.log("Status de la respuesta:", error.response ? error.response.status : 'No disponible');
                    Alert.alert('ERROR DE RED', 'No se pudo conectar al servidor. Por favor, vuelva a intentarlo o verifica tu conexión a Internet', `ERROR ${error.code}`);
                } else if (error.code === 'ERR_NETWORK') {
                    console.error('Error de red:', error.message);
                    Alert.alert('ERROR DE RED', 'Hubo un problema con la red. Por favor, intenta nuevamente.');
                } else {
                    console.error('Error en la solicitud:', error.message);
                    Alert.alert('ERROR', 'Ocurrió un error en la solicitud. Por favor, intenta nuevamente.');
                }
                return null;
            } else {
                // console.warn(`Reintentando solicitud (${attempts}/${MAX_RETRIES})...`);
                ToastAndroid.showWithGravity(
                    `Reintentando solicitud (${attempts}/${MAX_RETRIES})...`,
                    ToastAndroid.SHORT,
                    ToastAndroid.CENTER
                );
                await sleep(RETRY_DELAY * attempts); // Espera exponencial antes de reintentar
            }
        }
    }
};