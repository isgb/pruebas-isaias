// network.js
import NetInfo from '@react-native-community/netinfo';
import { saveRequest, getPendingRequests, removeRequest } from './database';

export const sendRequest = async (endpoint, method, body, headers) => {
  saveRequest(endpoint, method, body, headers);
  
  NetInfo.fetch().then(state => {
    if (state.isConnected) {
      fetch(endpoint, {
        method: method,
        headers: headers,
        body: JSON.stringify(body)
      }).then(response => response.json())
        .then(data => {
          console.log('Respuesta recibida:', data);
          // Puedes llamar a `removeRequest` pasando el id de la petición para eliminarla
        })
        .catch(error => {
          console.error('Error en la petición:', error);
          // Maneja el error si es necesario
        });
    } else {
      console.log('Conexión a Internet no disponible. Petición guardada para reintento.');
    }
  });
};

export const reattemptPendingRequests = () => {
  getPendingRequests((requests) => {
    requests.forEach(request => {
      const { id, endpoint, method, body, headers } = request;
      fetch(endpoint, {
        method: method,
        headers: JSON.parse(headers),
        body: body
      }).then(response => response.json())
        .then(data => {
          console.log('Respuesta recibida para petición pendiente:', data);
          removeRequest(id);
        })
        .catch(error => {
          console.error('Error en la petición pendiente:', error);
        });
    });
  });
};

NetInfo.addEventListener(state => {
  if (state.isConnected) {
    reattemptPendingRequests();
  }
});
