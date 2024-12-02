import { Alert, Linking } from 'react-native';
import { APP_VERSIONS } from '@env';
import { obtenerVersionActualizacionApp } from '../../api/obtenerVersionActualizacionApp';

const checkForUpdate = async () => {
  try {
    const response = await obtenerVersionActualizacionApp();

    if (!response) {
      Alert.alert('Error en la respuesta de la actualización de app:', response.status);
      return;
    }

    const { latestVersion, apkUrl } = response;
    const currentVersion = APP_VERSIONS;

    if (currentVersion !== latestVersion) {
      Alert.alert(
        'Actualización disponible',
        `Hay una nueva versión disponible (${latestVersion}). ¿Deseas actualizar?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Actualizar', onPress: () => Linking.openURL(apkUrl) }
        ],
        { cancelable: false }
      );
    }
  } catch (error) {
    console.log('Error verificando actualizaciones:', error);
  }
};

export default checkForUpdate;