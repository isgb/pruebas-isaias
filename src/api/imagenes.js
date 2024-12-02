import { Alert } from "react-native";
import axios from "./axios";
import { ToastAndroid } from "react-native";

const MAX_RETRIES = 5; // Número máximo de reintentos
const RETRY_DELAY = 1000; // Tiempo de espera inicial en milisegundos

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const uploadImagesRequest = async (imageData) => {
    let attempts = 0;

    while (attempts < MAX_RETRIES) {
        try {
            console.log("Datos de la imagen:", imageData);

            const response = await axios.post(`/uploadimage`, imageData, {
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