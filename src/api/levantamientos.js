import { Alert } from 'react-native';
import axios from './axios';

export const createLevantamientoRequest = async (clavecliente, nombresucursal,
    numerosucursal, latitud,
    longitud, url,
    token,
    levantamientoTemporalId = null) => {
    try {
        const response = await axios.post(`/nuevolevantamiento`,
            {
                clavecliente,
                nombresucursal,
                numerosucursal,
                latitud,
                longitud,
                url,
                token,
                levantamientoTemporalId
            }, {
            headers: {
                // 'Content-Type': 'application/json'
                'Content-Type': 'text/plain'
            }
        });

        if (response.status === 200) {
            console.log("Respuesta del servidor:", response);
            return response.data;
        } else {
            console.error("Error en la respuesta del servidor:", response.status);
            return null;
        }
    } catch (error) {
        if (error.response) {
            console.error('Error en la solicitud:', error.response.data);
        } else if (error.message === 'Request canceled') {
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
            console.error('Error en la solicitud:', error.message);
        }
        return null;
    }
};

export const getLevantamientosListRequest = (token) =>
    axios.post(`/getlist`,
        {
            token
        }, {
        headers: {
            // 'Content-Type': 'application/json'
            'Content-Type': 'text/plain'
        }
    })

export const terminarLevantamientoRequest = (levantamientoId = null) =>
    axios.post(`/terminalevantamiento`,
        {
            levantamientoId
        }, {
        headers: {
            // 'Content-Type': 'application/json'
            'Content-Type': 'text/plain'
        }
    })

export const selfieLevantamientoRequest = async (formData) => {
    try {
        if (!(formData instanceof FormData)) {
            console.error('formData no es una instancia de FormData');
            return;
        }

        console.log("Datos del formulario:", formData);

        const response = await axios.post(`/selfielevantamiento`, formData, {
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
        if (error.response) {
            console.error('Error en la solicitud:', error.response.data);
        } else if (error.message === 'Request canceled') {
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
            console.error('Error en la solicitud:', error.message);
        }
        return null;
    }
};
