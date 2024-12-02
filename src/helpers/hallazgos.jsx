import AsyncStorage from "@react-native-async-storage/async-storage"
import { gethallazgosListRequest } from "../api/levantamientos"
import { useMemo } from "react"

export const guardarHallazgosLocalStorage = async (hallazgosList) => {
  try {
    await AsyncStorage.setItem('hallazgos_localstorage', JSON.stringify(hallazgosList))
  } catch (error) {
    console.log(error)
  }
}

export const guardarHallazgosLocalStorageForSendBD = async (newHallazgos) => {
  try {
    const hallazgosLocalStorageSendbd = await AsyncStorage.getItem('hallazgos_localstorage_sendbd');
    console.log("hallazgosLocalStorageSendbd", hallazgosLocalStorageSendbd);

    if (hallazgosLocalStorageSendbd === null) {
      console.log("AGREGANDO HALLAZGO 1", newHallazgos);
      await AsyncStorage.setItem('hallazgos_localstorage_sendbd', JSON.stringify([newHallazgos]));
    }
    else 
    {
      let newHallazgosList = [];
      const hallazgosList = JSON.parse(hallazgosLocalStorageSendbd);

      if(hallazgosList.some(hallazgo => (hallazgo.hallazgoId === newHallazgos.hallazgoId && 
                                         hallazgo.levantamientoId === newHallazgos.levantamientoId && 
                                         hallazgo.hallazgoPrincipalId === newHallazgos.hallazgoPrincipalId && 
                                         hallazgo.cantidadReal === newHallazgos.cantidadReal && 
                                         hallazgo.observaciones === newHallazgos.observaciones)))
      {

        // console.log("HALLAZGO YA EXISTE", newHallazgos);
        const updatedHallazgosList = hallazgosList.map(hallazgo => {
          if (hallazgo.hallazgoId === newHallazgos.hallazgoId &&
              hallazgo.levantamientoId === newHallazgos.levantamientoId &&
              hallazgo.hallazgoPrincipalId === newHallazgos.hallazgoPrincipalId &&
              hallazgo.cantidadReal === newHallazgos.cantidadReal &&
              hallazgo.observaciones === newHallazgos.observaciones) {
            return newHallazgos;
          }
          return hallazgo;
        });

        // console.log("updatedHallazgosList", updatedHallazgosList);
        newHallazgosList = updatedHallazgosList;
        
      }else{

        newHallazgosList = [
          ...hallazgosList,
          newHallazgos
        ]

      }
    
      console.log("AGREGANDO HALLAZGO 2", newHallazgosList);
      // console.log("guardarHallazgosLocalStorageForSendBD ", newHallazgosList);
      await AsyncStorage.setItem('hallazgos_localstorage_sendbd', JSON.stringify(newHallazgosList));
    }

  } catch (error) {
    console.log(error)
  }
}

export const getHallazgosListOffline = async () => {
  try {
    const hallazgosList = await AsyncStorage.getItem('hallazgos_localstorage');
    return hallazgosList ? JSON.parse(hallazgosList) : false
  } catch (error) {
    console.log(error);
    return false;
  }
}

export const getHallazgosListToSendBD = async () => {
    try {
      const hallazgosList = await AsyncStorage.getItem('hallazgos_localstorage_sendbd');
      return hallazgosList ? JSON.parse(hallazgosList) : undefined
    } catch (error) {
      console.log(error);
      return false;
    }
  }

export const processedDataHallazgos = (hallazgosPrincipales) => {

  const processData = (hallazgos) => {
    return hallazgos.map(hallazgo => (
        {
            id            : hallazgo.id,
            hallazgo      : hallazgo.hallazgo,
            cantidadIdeal : hallazgo.cantidadIdeal,
            cantidadReal  : hallazgo.cantidadReal,
            observaciones : hallazgo.observaciones,
            fotos         : [],
        }
    ));
  };
  
  const processedDataHallazgos = useMemo(() => processData(hallazgosPrincipales), [hallazgosPrincipales]);

  return processedDataHallazgos;
  
}

export const deleteHallazgosToSendBDByLevantamientoId = async (levantamientoId) => {
  try {
      let hallazgos = await getHallazgosListToSendBD();
      console.log("deleteHallazgosToSendBDByLevantamientoId levantamientoId", levantamientoId);
      const hallazgosFiltered = hallazgos.filter((hallazgo) => hallazgo.levantamientoId !== levantamientoId);
      console.log("deleteHallazgosToSendBDByLevantamientoId", hallazgosFiltered);
      // await guardarHallazgosLocalStorageForSendBD(hallazgosFiltered);
      await AsyncStorage.setItem('hallazgos_localstorage_sendbd', JSON.stringify(hallazgosFiltered));
  } catch (error) {
      console.log("deleteLevantamiento", error)
  }
}

export const guardarImagenesHallazgoOnLocal = ({ imagenes, fotosLocal }, online = false) => {
        
  if (online) {
      if (imagenes && imagenes.length > 0) {
          const rutas = imagenes.map(imagen => imagen.ruta);
          console.log("guardarImagenesHallazgoOnLocal Rutas:", rutas);
          return rutas;
      }
  } else {
      return fotosLocal;
  }
  return [];

}