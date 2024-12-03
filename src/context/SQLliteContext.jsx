import React, { createContext, useContext } from 'react';
import SQLite from 'react-native-sqlite-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import CryptoJS from 'react-native-crypto-js';
import { obtenerFechaHora } from '../helpers';
import { Alert } from 'react-native';

const SQLliteContext = createContext();

export const useSQLlite = () => {
    return useContext(SQLliteContext);
};

export const SQLliteProvider = ({ children }) => {

    // Abrir la base de datos SQLite
    const db = SQLite.openDatabase(
        { name: 'userDatabase.db', location: 'default' },
        () => {
            console.log('Database opened');
            createUsersTable();
            createDataUsersTable();
        },
        error => console.log(error)
    );

    // Crear la tabla de usuarios si no existe
    const createUsersTable = () => {
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    username TEXT, 
                    password TEXT,
                    tipojornada INTEGER
                );`,
                [],
                () => console.log('Tabla users created'),
                error => console.log(error)
            );
        });
    };

    const createSelfiesTable = () => {
        db.transaction(tx => {
            tx.executeSql(
                `CREATE TABLE IF NOT EXISTS selfies_photos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    jornadaId INTERGER, 
                    formdata TEXT,
                    username TEXT,
                    tipojornada INTEGER
                );`,
                [],
                () => console.log('Tabla selfies_photos creada.'),
                error => console.log(error)
            );
        });
    };

    // Crear la tabla data_users si no existe
    const createDataUsersTable = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `CREATE TABLE IF NOT EXISTS data_users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    formdata TEXT,
                    endpoint TEXT,
                    email TEXT,
                    usuarioId INTEGER,
                    jornadaId INTEGER,
                    token TEXT,
                    refreshtoken TEXT,
                    tipojornada INTEGER,
                    created_at DATETIME
                    );`,
                    [],
                    () => {
                        console.log('data_users tabla creada');
                        resolve(true);
                    },
                    error => {
                        console.log(error);
                        reject(error);
                    }
                );
            });
        });
    };

    // Guardar usuario en SQLite con contraseña encriptada
    const saveUser = (username, password, tipojornada = null) => {
        // Encriptar la contraseña usando CryptoJS
        const secretKey = 'a5dcbf8e-3f2b-4e6d-9f8e-2b3d4e6f9a8b';
        const hashedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO users (username, password, tipojornada) VALUES (?, ?, ?);',
                [username, hashedPassword, tipojornada],
                () => console.log('User guardado exitosamente en tabla users!'),
                error => console.log(error)
            );
        });

        // También almacenar el nombre de usuario en EncryptedStorage (si es necesario)
        EncryptedStorage.setItem('username', username);
        EncryptedStorage.setItem('password', hashedPassword);
    };

    // Recuperar usuario desde SQLite
    const getUser = (username) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM users WHERE username = ?;',
                    [username],
                    (tx, results) => {
                        console.log('Obteniendo user...', username);
                        const user = results.rows.length > 0 ? results.rows.item(0) : null;
                        resolve(user);
                    },
                    error => reject(error)
                );
                // if (db) {
                //   db.close();
                //   console.log('Base de datos cerrada');
                // }
            });
        });
    };

    // Validar la contraseña comparando el hash
    const validatePassword = (inputPassword, storedHash) => {
        const secretKey = 'a5dcbf8e-3f2b-4e6d-9f8e-2b3d4e6f9a8b';
        const bytes = CryptoJS.AES.decrypt(storedHash, secretKey);
        const decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        return inputPassword === decryptedPassword;
    };

    // Guardar datos en la tabla data_users
    const saveDataUser = (formdata = null, endpoint = null, email = null, usuarioId = null, jornadaId = null, token = null, refreshtoken = null, tipojornada = null, createdAt = null) => {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO data_users (formdata, endpoint, email, usuarioId, jornadaId, token, refreshtoken, tipojornada, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);',
                [formdata, endpoint, email, usuarioId, jornadaId, token, refreshtoken, tipojornada, createdAt],
                () => console.log('data_users salvado!'),
                error => console.log(error)
            );
        });
    };

    // Consultar registro en la tabla data_users por formdata
    const getDataUserByFormDataAndEmail = (email, formdata) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM data_users WHERE formdata = ? AND email = ?;',
                    [formdata, email],
                    (tx, results) => {

                        const dataUser = results.rows.length > 0 ? results.rows.item(0) : null;
                        resolve(dataUser);
                    },
                    error => reject(error)
                );
            });
        });
    };

    // Consultar registro en la tabla data_users
    const getDataUsersByEmail = (email) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM data_users WHERE email = ? ORDER BY id ASC;',
                    [email],
                    (tx, results) => {
                        console.log('Obteniendo data user por email...', email);
                        const dataUsers = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            dataUsers.push(results.rows.item(i));
                        }
                        resolve(dataUsers);
                    },
                    error => reject(error)
                );
            });
        });
    };

    

    // Consultar si hay registros en la tabla data_users con el email dado y token no nulo
    const hasNullTokenByEmail = (email) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM data_users WHERE email = ? AND token IS NULL;',
                    [email],
                    (tx, results) => {
                        const hasNonNullToken = results.rows.length > 0;
                        resolve(hasNonNullToken);
                    },
                    error => reject(error)
                );
            });
        });
    };


    // Actualizar el campo token en la tabla data_users por username
    const updateTokensByUsername = (username, newToken, newRefreshToken) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'UPDATE data_users SET token = ?, refreshtoken = ? WHERE email = ?;',
                    [newToken, newRefreshToken, username],
                    () => {
                        console.log('Token and refresh token actualizados exitosamente!');
                        resolve(true);
                    },
                    error => {
                        console.log(error);
                        reject(error);
                    }
                );
            });
        });
    };

    // Obtener todos los registros de la tabla data_users
    const getAllDataUsers = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM data_users;',
                    [],
                    (tx, results) => {
                        const dataUsers = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            dataUsers.push(results.rows.item(i));
                        }
                        resolve(dataUsers);
                    },
                    error => reject(error)
                );
            });
        });
    };

    const removeDataUserById = (id) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'DELETE FROM data_users WHERE id = ?;',
                    [id],
                    () => {
                        console.log('Data user borrado exitosamente!');
                        resolve(true);
                    },
                    error => {
                        console.error('Error borrando data user', error);
                        Alert.alert('Error borrando data user', error);
                        reject(error);
                    }
                );
            });
        });
    };

    // Consultar registro en la tabla data_users por tipojornada y email
    const getDataUserByTipoJornadaAndEmail = (tipojornada, email) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM data_users WHERE tipojornada = ? AND email = ?;',
                    [tipojornada, email],
                    (tx, results) => {
                        const dataUser = results.rows.length > 0 ? results.rows.item(0) : null;
                        resolve(dataUser);
                    },
                    error => reject(error)
                );
            });
        });
    };

    const updateTipoJornadaByEmail = (email, newTipoJornada) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'UPDATE users SET tipojornada = ? WHERE username = ?;',
                    [newTipoJornada, email],
                    () => {
                        console.log('Tipo jornada actualizado exitosamente!');
                        resolve(true);
                    },
                    error => {
                        console.log(error);
                        reject(error);
                    }
                );
            });
        });
    };

    const getTipoJornadaByUsername = (username) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT tipojornada FROM users WHERE username = ?;',
                    [username],
                    (tx, results) => {
                        const tipojornada = results.rows.length > 0 ? results.rows.item(0).tipojornada : null;
                        resolve(tipojornada);
                    },
                    error => reject(error)
                );
            });
        });
    };

    // Consultar registros en la tabla selfies_photos por jornadaId
    const getSelfiesByJornadaId = (jornadaId) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM selfies_photos WHERE jornadaId = ?;',
                    [jornadaId],
                    (tx, results) => {
                        const selfies = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            selfies.push(results.rows.item(i));
                        }
                        resolve(selfies);
                    },
                    error => {
                        reject(error);
                    }
                );
            });
        });
    };

    const getSelfiesByJornadaIdAndUsername = (jornadaId, username) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM selfies_photos WHERE jornadaId = ? AND username = ?;',
                    [jornadaId, username],
                    (tx, results) => {
                        const selfies = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            selfies.push(results.rows.item(i));
                        }
                        resolve(selfies);
                    },
                    error => {
                        reject(error);
                    }
                );
            });
        });
    };

    const getSelfiesByJornadaIdAndUsernameAndTipoJornada = (jornadaId, username, tipoJornada) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM selfies_photos WHERE jornadaId = ? AND username = ? AND tipojornada = ?;',
                    [jornadaId, username, tipoJornada],
                    (tx, results) => {
                        const selfies = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            selfies.push(results.rows.item(i));
                        }
                        resolve(selfies);
                    },
                    error => {
                        reject(error);
                    }
                );
            });
        });
    };

    // Guardar registros en la tabla selfies_photos
    const saveSelfiePhoto = (jornadaId, formdata, username) => {
        db.transaction(tx => {
            tx.executeSql(
                'INSERT INTO selfies_photos (jornadaId, formdata, username) VALUES (?, ?, ?);',
                [jornadaId, formdata, username],
                () => console.log('Selfie guardado exitosamente en tabla selfies_photos!'),
                error => console.log(error)
            );
        });
    };

    const removeSelfiePhotoById = (id) => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'DELETE FROM selfies_photos WHERE id = ?;',
                    [id],
                    () => {
                        console.log('Selfie photo borrado exitosamente!');
                        resolve(true);
                    },
                    error => {
                        console.error('Error borrando selfie photo', error);
                        reject(error);
                    }
                );
            });
        });
    };


    const getSelfiesPhotos = () => {
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    'SELECT * FROM selfies_photos;',
                    [],
                    (tx, results) => {
                        const selfiesPhotos = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            selfiesPhotos.push(results.rows.item(i));
                        }
                        resolve(selfiesPhotos);
                    },
                    error => reject(error)
                );
            });
        });
    };

    const contextValue = {
        createUsersTable,
        saveUser,
        getUser,
        validatePassword,
        createDataUsersTable,
        saveDataUser,
        getDataUserByFormDataAndEmail,
        getDataUsersByEmail,
        updateTokensByUsername,
        getAllDataUsers,
        hasNullTokenByEmail,
        removeDataUserById,
        getDataUserByTipoJornadaAndEmail,
        updateTipoJornadaByEmail,
        getTipoJornadaByUsername,
        createSelfiesTable,
        getSelfiesByJornadaId,
        saveSelfiePhoto,
        getSelfiesByJornadaIdAndUsername,
        removeSelfiePhotoById,
        getSelfiesByJornadaIdAndUsernameAndTipoJornada,
        getSelfiesPhotos
    };

    return (
        <SQLliteContext.Provider value={contextValue}>
            {children}
        </SQLliteContext.Provider>
    );
};
