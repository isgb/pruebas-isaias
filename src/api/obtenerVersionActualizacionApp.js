
import {  APP_ENV } from '@env';
import { Alert } from 'react-native';

export const obtenerVersionActualizacionApp = async () => {
    try {
        console.log("APP_ENV", APP_ENV);
        const response = await fetch(APP_ENV === 'dev' 
                                    ? 'https://elm.zentro.com.mx/version-dev.json'
                                    : 'https://erp.elmseguridad.com.mx/version-prod.json');
        if (response.ok) {
            const data = await response.json();
            return data;
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
            Alert.alert('SIN CONEXIÓN', 'No se pudo conectar al servidor para detectar actualizaciones de la aplicación. Por favor, verifica tu conexión a Internet');
        } else if (error.code === 'ERR_NETWORK') {
            console.error('Error de red:', error.message);
            Alert.alert('ERROR DE RED', 'Hubo un problema con la red al descargar actualizar app. Por favor, intenta nuevamente.');
        } else {
            console.error('Error en la solicitud:', error.message);
        }
        return null;
    };
};