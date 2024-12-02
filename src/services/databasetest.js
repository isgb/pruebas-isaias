// database.js
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'requests.db', location: 'default' });

export const setupDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS Requests (id INTEGER PRIMARY KEY AUTOINCREMENT, endpoint TEXT, method TEXT, body TEXT, headers TEXT)',
      [],
      () => { console.log('Tabla Requests creada con éxito'); },
      error => { console.error('Error al crear la tabla Requests', error); }
    );
  });
};

export const saveRequest = (endpoint, method, body, headers) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO Requests (endpoint, method, body, headers) VALUES (?, ?, ?, ?)',
      [endpoint, method, JSON.stringify(body), JSON.stringify(headers)],
      () => { console.log('Petición guardada con éxito'); },
      error => { console.error('Error al guardar la petición', error); }
    );
  });
};

export const getPendingRequests = (callback) => {
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM Requests', [], (tx, results) => {
      let requests = [];
      for (let i = 0; i < results.rows.length; i++) {
        requests.push(results.rows.item(i));
      }
      callback(requests);
    });
  });
};

export const removeRequest = (id) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM Requests WHERE id = ?',
      [id],
      () => { console.log('Petición eliminada con éxito'); },
      error => { console.error('Error al eliminar la petición', error); }
    );
  });
};
