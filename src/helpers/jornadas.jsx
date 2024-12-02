import AsyncStorage from '@react-native-async-storage/async-storage';

export const setJornadaOffline = async (formData) => {
    try {
        const jsonValue = JSON.stringify(formData);
        await AsyncStorage.setItem('jornada_offline', jsonValue);
        console.log('Data saved successfully');
    } catch (e) {
        console.error('Failed to save data', e);
    }
};

export const getJornadaOffline = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem('jornada_offline');
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Failed to fetch data', e);
    }
};

export const removeJornadaOffline = async () => {
    try {
        await AsyncStorage.removeItem('jornada_offline');
        console.log('Data removed successfully');
    } catch (e) {
        console.error('Failed to remove data', e);
    }
};

export const getTipoJornadaOffline = async () => {
    try {
        const jornadaOffline = await getJornadaOffline();
        if (jornadaOffline) {
            const formData = new FormData();
            jornadaOffline._parts.forEach(([key, value]) => {
                formData.append(key, value);
            });
            const statusJornada = jornadaOffline._parts.find(([key, value]) => key === 'tipoJornada')[1];
            return statusJornada;
        }
        return null;
    } catch (e) {
        console.error('Failed to get status', e);
    }
};

export const getFormDataFromJornadaOffline = async () => {
    try {
        const jornadaOffline = await getJornadaOffline();
        if (jornadaOffline) {
            const formData = new FormData();
            jornadaOffline._parts.forEach(([key, value]) => {
                formData.append(key, value);
            });
            return formData;
        }
        return null;
    } catch (e) {
        console.error('Failed to create FormData', e);
    }
};

export const transformToFormData = (data) => {
    try {
        const jornadaOffline = JSON.parse(data)
        if (jornadaOffline) {
            const formData = new FormData();
            jornadaOffline._parts.forEach(([key, value]) => {
                formData.append(key, value);
            });
            return formData;
        }
        return null;
    } catch (e) {
        console.error('Failed to create FormData', e);
    }
};

export const transformToFormDataWithoutPhotoSelfie = (data) => {
    try {
        const jornadaOffline = JSON.parse(data);
        if (jornadaOffline) {
            const formData = new FormData();
            jornadaOffline._parts.forEach(([key, value]) => {
                if (key !== 'photoSelfie') {
                    formData.append(key, value);
                }
            });
            return formData;
        }
        return null;
    } catch (e) {
        console.error('Failed to create FormData', e);
    }
};

export const addPropertiesToFormDataImages = (existingFormData, objectText, jornadaId, tipoJornada) => {
    try {
        const parsedData = existingFormData instanceof FormData 
                            ? existingFormData
                            : JSON.parse(existingFormData);

        const formData = new FormData();
        if (parsedData) {
            parsedData._parts.forEach(([key, value]) => {
                if (key === 'photoSelfie[]') {
                    formData.append(key, value);
                }
            });
        }

        formData.append('object', objectText);
        formData.append('id', jornadaId);
        formData.append('tipoJornada', tipoJornada);

        return formData;
    } catch (e) {
        console.error('Failed to add properties to FormData', e);
        return null;
    }
};