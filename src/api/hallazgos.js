import { Alert } from 'react-native';
import axios from './axios';

const createHallazgoRequest = async (formData) => {
    try {
        if (!(formData instanceof FormData)) {
            console.error('formData no es una instancia de FormData');
            return;
        }

        console.log("Datos del formulario:", formData);

        const response = await axios.post(`/creahallazgo`, formData, {
            timeout: 30000, // Aumenta el tiempo de espera a 30 segundos
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            withCredentials: true, // Asegura que las credenciales se envíen con la solicitud
        });

        if (response.status === 200) {
            // console.log("Respuesta del servidor:", response.data);
            return response.data;
        } else {
            console.error("Error en la respuesta del servidor:", response.status);
            return null;
        }
    } catch (error) {
        if (error.message === 'Request canceled') {
            console.warn('Solicitud cancelada:', error.message);
        } else if (error.code === 'ECONNABORTED') {
            console.error('Tiempo de espera excedido');
        } else if (!error.response) {
            console.log("No se pudo conectar al servidor", JSON.stringify(error));
            Alert.alert('ERROR DE RED', 'No se pudo conectar al servidor. Por favor, vuelva a intentarlo o verifica tu conexión a Internet');
        } else if (error.code === 'ERR_NETWORK') {
            console.error('Error de red:', error.message);
            Alert.alert('ERROR DE RED', 'Hubo un problema con la red. Por favor, intenta nuevamente.');
        } else {
            console.error('Error en la solicitud:', error.response);
        }
        return null;
    }
};

// Ejemplo de cómo limitar el número de solicitudes simultáneas
const MAX_CONCURRENT_REQUESTS = 5;
let ongoingRequests = 0;

export const createHallazgoRequestWithLimit = async (formData) => {
    if (ongoingRequests >= MAX_CONCURRENT_REQUESTS) {
        console.warn('Demasiadas solicitudes simultáneas. Esperando...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
        return createHallazgoRequestWithLimit(formData);
    }

    ongoingRequests++;
    const result = await createHallazgoRequest(formData);
    ongoingRequests--;
    return result;
};
