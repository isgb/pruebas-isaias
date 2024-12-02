import AsyncStorage from "@react-native-async-storage/async-storage"
import { getLevantamientosListRequest } from "../api/levantamientos"

export const guardarLevantamientosLocalStorage = async (levantamientosList) => {
  try {
    await AsyncStorage.setItem('levantamientos_localstorage', JSON.stringify(levantamientosList));
  } catch (error) {
    console.log("guardarLevantamientosLocalStorage", error.response)
  }
}

export const guardarLevantamientosLocalStorageForSendBD = async (newLevantamiento) => {
  try {
    const levantamientosLocalStorageSendbd = await AsyncStorage.getItem('levantamientos_localstorage_sendbd');
    console.log("levantamientosLocalStorageSendbd", levantamientosLocalStorageSendbd);

    if (levantamientosLocalStorageSendbd === null) {
      await AsyncStorage.setItem('levantamientos_localstorage_sendbd', JSON.stringify([newLevantamiento]));
    }
    else {

      const levantamientosList = JSON.parse(levantamientosLocalStorageSendbd);
      
      const newLevantamientosList = [
        ...levantamientosList,
        newLevantamiento
      ]

      console.log("guardarLevantamientosLocalStorageForSendBD ", newLevantamientosList);
      await AsyncStorage.setItem('levantamientos_localstorage_sendbd', JSON.stringify(newLevantamientosList));
    }

  } catch (error) {
    console.log("guardarLevantamientosLocalStorageForSendBD", error.response)
  }
}

export const actualizarLevantamientosListLocalStorageForSendBD = async (levantamientosList) => {
  try {
    await AsyncStorage.setItem('levantamientos_localstorage_sendbd', JSON.stringify(levantamientosList));
  } catch (error) {
    console.log("actualizarLevantamientosListLocalStorageForSendBD", error.response)
  }
}

export const updateLevantamientoOnLevantamientosListLocalStorage = async (dataLevantamiento) => {

  try {
    const levantamientosData = await getLevantamientosListLocalStorage();
    const levantamientosActualizados = levantamientosData.map(
      (levantamiento) => (levantamiento.id === dataLevantamiento.id ? dataLevantamiento : levantamiento)
    );

    // console.log("levantamientosActualizados", JSON.stringify(levantamientosActualizados));
    await guardarLevantamientosLocalStorage(levantamientosActualizados);

    return levantamientosActualizados;
    
  } catch (error) {
    console.log("error guardarLevantamientosLocalStorage", error);
    return false;
  }

}

export const guardarEstadoLevantamientoForSendDB = async (dataLevantamiento) => {
  try {
  
    const levantamientosToSendBD = await getLevantamientosListToSendBD();
    console.log("levantamientosToSendBD", levantamientosToSendBD);

    if (levantamientosToSendBD === undefined) {
      // await AsyncStorage.setItem('levantamientos_localstorage_sendbd', JSON.stringify([newLevantamiento]));
      await actualizarLevantamientosListLocalStorageForSendBD([dataLevantamiento]);
    }else{
      const dataLevantamientoId = dataLevantamiento.id;
      const levantamientoEnLista = levantamientosToSendBD.find(item => item.id === dataLevantamientoId);

      if (levantamientoEnLista) {
        levantamientoEnLista.estado = 2;
      }
      
      const updatedLevantamientosList = levantamientosToSendBD.map(levantamiento => {
        if (levantamiento.id === dataLevantamientoId) {
          return levantamientoEnLista;
        }
        return levantamiento;
      });
    
      console.log("guardarEstadoLevantamientoForSendDB updatedLevantamientosList", updatedLevantamientosList);
      await actualizarLevantamientosListLocalStorageForSendBD(updatedLevantamientosList);
    }

  } catch (error) {
    console.log("guardarEstadoLevantamientoForSendDB", error)
  }
}

export const getLevantamientosListOffline = async () => {
  try {
    const levantamientosList = await AsyncStorage.getItem('levantamientos_localstorage');
    return levantamientosList ? JSON.parse(levantamientosList).reverse() : []
  } catch (error) {
    console.log("getLevantamientosListOffline", error.response);
    return false;
  }
}

export const getLevantamientosListToSendBD = async () => {
  try {
    const levantamientosList = await AsyncStorage.getItem('levantamientos_localstorage_sendbd');
    return levantamientosList ? JSON.parse(levantamientosList) : undefined
  } catch (error) {
    console.log("getLevantamientosListToSendBD", error.response);
    return false;
  }
}

export const getEstadosLevantamientosListToSendDB = async () => {
  try {
    const estadosLevantamientosList = await AsyncStorage.getItem('levantamientos_estados_localstorage_sendDB');
    return estadosLevantamientosList ? JSON.parse(estadosLevantamientosList) : undefined
  } catch (error) {
    console.log("getEstadosLevantamientosListToSendBD", error.response);
    return false;
  }
}

export const getLevantamientosListOnline = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    let levantamientosList = await getLevantamientosListRequest(token);
    return levantamientosList ? levantamientosList.data.data : []
  } catch (error) {
    console.log("getLevantamientosListOnline", error.response);
    return [];
  }
}

export const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token ? token : false
  } catch (error) {
    console.log("getToken", error);
    return false;
  }
}

export const getLevantamientosListLocalStorage = async () => {
  try {
    const levantamientosList = await AsyncStorage.getItem('levantamientos_localstorage');
    return levantamientosList ? JSON.parse(levantamientosList) : false
  } catch (error) {
    console.log("getLevantamientosListLocalStorage", error.response);
    return false;
  }
}

export const updateLevantamientos = async (levantamientosData, levantamientoId, 
                                           hallazgoPrincipalId, cantidadIdealInput, 
                                           cantidadRealInput, observacionesInput, 
                                           fotosCamera, fotosCameraLocal, 
                                           hallazgoId,isTemporal = false) => {

  try {

    // console.log("levantamientosData", levantamientosData);
    // console.log("levantamientoId", levantamientoId);

    let dataLevantamiento = levantamientosData.find((levantamiento) => levantamiento.id === levantamientoId);
    let dataHallazgoPrincipal = dataLevantamiento.hallazgosPrincipales.find((hallazgo) => hallazgo.id === hallazgoPrincipalId);

    dataHallazgoPrincipal = {
      ...dataHallazgoPrincipal,
      cantidadIdeal: cantidadIdealInput,
      cantidadReal: cantidadRealInput,
      observaciones: observacionesInput,
      fotos: fotosCamera,
      fotosLocal: fotosCameraLocal,
      hallazgoId,
      isTemporal
    };

    const dataHallazgosPrincipalesActualizados = dataLevantamiento.hallazgosPrincipales.map(
      (dataHallazgoState) => (dataHallazgoState.id === dataHallazgoPrincipal.id ? dataHallazgoPrincipal : dataHallazgoState)
    );

    dataLevantamiento = {
      ...dataLevantamiento,
      hallazgosPrincipales: dataHallazgosPrincipalesActualizados,
    };

    const levantamientosActualizados = levantamientosData.map(
      (levantamiento) => (levantamiento.id === dataLevantamiento.id ? dataLevantamiento : levantamiento)
    );

    console.log("levantamientosActualizados", JSON.stringify(levantamientosActualizados));

    await guardarLevantamientosLocalStorage(levantamientosActualizados);

    return true;

  } catch (error) {
    console.log("error updateLevantamientos levantamientos.jsx", error.response);
    return false;
  }

};

export const guardarEstadoLevantamientoOnListLocalStorageForSendToDB= async (dataLevantamiento) => {
console.log("guardarEstadoLevantamientoOnListLocalStorageForSendToDB", dataLevantamiento);
  try {
    const levantamientosEstadosLocalstorageSendbd = await AsyncStorage.getItem('levantamientos_estados_localstorage_sendDB');
    console.log("levantamientosEstadosLocalstorageSendbd", levantamientosEstadosLocalstorageSendbd);

    if (levantamientosEstadosLocalstorageSendbd === null) {
      await AsyncStorage.setItem('levantamientos_estados_localstorage_sendDB', JSON.stringify([dataLevantamiento]));
    }
    else {
      const levantamientosEstadosList = JSON.parse(levantamientosEstadosLocalstorageSendbd);

      const newLevantamientosEstadosList = [
        ...levantamientosEstadosList,
        dataLevantamiento
      ]

      console.log("guardarEstadoLevantamientoLocalStorageForSendToDB", newLevantamientosEstadosList);
      await AsyncStorage.setItem('levantamientos_estados_localstorage_sendDB', JSON.stringify(newLevantamientosEstadosList));
    }

  } catch (error) {
    console.log("guardarEstadoLevantamientoLocalStorageForSendToDB", error.response)
  }

}

const getDataLevantamiento = async (newLevantamiento, isOnline = true) => {
  try {
    const levantamientos = (isOnline) ? await getLevantamientosListOnline() : await getLevantamientosListOffline(); 
    const dataHallazgo = levantamientos.find( (levantamiento) =>  (isOnline) 
                                                                  ? ( levantamiento.id === newLevantamiento.id ? levantamiento.id : null) 
                                                                  : ( levantamiento.sucursal === newLevantamiento.sucursal ? levantamiento.sucursal : null));

    if (dataHallazgo !== undefined) {

      try {
         return dataHallazgo;
      } catch (error) {
          console.log("findDataLevantamiento",error);
          return false;
      }

    }else{
      return false;
    }
    
    
  } catch (error) {
    console.error("findDataLevantamiento",error);
    return false;
  }
}