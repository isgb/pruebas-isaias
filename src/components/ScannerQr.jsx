
import React, { useContext, useRef, useState } from 'react';
import Geolocation from '@react-native-community/geolocation';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    View,
    Text,
    Pressable,
    PermissionsAndroid,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import { createLevantamientoRequest, selfieLevantamientoRequest } from '../api/levantamientos';
import { DataContext } from '../context/DataContext';
import { GOOGLE_MAPS_URL } from '../utils';
import ModalHallazgos from './Hallazgos/ModalHallazgos';
import { guardarLevantamientosLocalStorageForSendBD } from '../helpers/levantamientos';
import uuid from 'react-native-uuid';
import { obtenerFechaActual } from '../helpers';
import { launchCamera } from 'react-native-image-picker';

const ScannerQr = ({ navigation }) => {

    const {
        isOnline,
        findLevantamiento,
        setEstadoScanner,
        updateLevantamiento
    } = useContext(DataContext)

    //   AsyncStorage.clear();

    const [hallazgos, setHallazgos] = useState([]);
    const [levantamiento, setLevantamiento] = useState({});
    const [modalHallazgosVisible, setModalHallazgosVisible] = useState(false);
    const [spinnerScanner, setSpinnerScanner] = useState(false);;
    const inputRef = useRef(null);

    const cerrarModal = () => {
        setModalHallazgosVisible(false)
        inputRef.current.reactivate()
    }

    const requestCameraPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Permiso para usar la cámara',
                        message: 'Esta aplicación necesita acceso a tu cámara',
                        buttonNeutral: 'Preguntar más tarde',
                        buttonNegative: 'Cancelar',
                        buttonPositive: 'OK',
                    }
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Permiso de cámara concedido');
                } else {
                    console.log('Permiso de cámara denegado');
                }
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const guardarLevantamientoLocalStorage = async (newLevantamiento, isOnline = true) => {
        try {

            if (!isOnline) {

                const newLevantamientoId = uuid.v4();
                const obtenerFecha = obtenerFechaActual();

                let newLevantamientoLocal = {
                    cliente: newLevantamiento.clavecliente,
                    clienteId: 4,
                    fecha: obtenerFecha,
                    id: newLevantamientoId,
                    sucursal: `${newLevantamiento.clavecliente} ${newLevantamiento.numerosucursal} - ${newLevantamiento.nombresucursal}`,
                    sucursalId: 1,
                    levantamientoTemporalId: newLevantamientoId,
                    hallazgosPrincipales: [
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "AGUAS",
                            "id": 1,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "CAJA GH",
                            "id": 30,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "CAJA MED",
                            "id": 26,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "CAJA PER",
                            "id": 28,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "CAJAS FAM",
                            "id": 23,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "CIERRE DE LOTE",
                            "id": 35,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "DIDI",
                            "id": 38,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "DIDI PEDIDOS",
                            "id": 39,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "FACTURA FEMSA VS SIMPHONY",
                            "id": 43,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "FACTURA PFS VS SIMPHONY",
                            "id": 44,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "FONDO FIJO",
                            "id": 2,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "HARINA",
                            "id": 20,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "JAMÓN",
                            "id": 32,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "MASA FAM PAN",
                            "id": 22,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "MASA FAM TRAD",
                            "id": 21,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "MASA GH",
                            "id": 29,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "MASA MED PAN",
                            "id": 25,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "MASA MED TRAD",
                            "id": 24,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "MASA PER",
                            "id": 27,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PEPPERONI",
                            "id": 33,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET COCA COLA",
                            "id": 3,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET COCA COLA LIGHT",
                            "id": 5,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET COCA COLA S/AZUCAR",
                            "id": 4,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET DEL VALLE",
                            "id": 12,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET FANTA",
                            "id": 8,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET FRESCA",
                            "id": 13,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET FUZE TEA DURAZNO",
                            "id": 10,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET FUZE TEA LIMÓN",
                            "id": 11,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET FUZE TEA NARANJA",
                            "id": 9,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET SIDRAL MUNDET",
                            "id": 6,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "PET SPRITE",
                            "id": 7,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "QUESO",
                            "id": 31,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "RAPPI",
                            "id": 40,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "RAPPI PEDIDOS",
                            "id": 41,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "REF. 2L COCA COLA",
                            "id": 14,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "REF. 2L COCA COLA LIGHT",
                            "id": 15,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "REF. 2L FANTA",
                            "id": 19,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "REF. 2L FRESCA",
                            "id": 18,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "REF. 2L SIDRAL MUNDET",
                            "id": 16,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "REF. 2L SPRITE",
                            "id": 17,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "UBER EFECTIVO",
                            "id": 36,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "UBER PEDIDOS",
                            "id": 37,
                            "observaciones": "",
                            "isTemporal": true
                        },
                        {
                            "cantidadIdeal": "",
                            "cantidadReal": "",
                            "hallazgo": "VALORES",
                            "id": 34,
                            "observaciones": "",
                            "isTemporal": true
                        }
                    ],
                    estado: 1,
                    selfiePhotoFormData: newLevantamiento.selfiePhotoFormData,
                    selfie: newLevantamiento.selfie
                }

                await guardarLevantamientosLocalStorageForSendBD({
                    ...newLevantamiento,
                    id: newLevantamientoId,
                    levantamientoTemporalId: newLevantamientoId,
                    estado: 1
                });

                newLevantamientoLocal = await findLevantamiento(newLevantamientoLocal, isOnline);
                if (newLevantamientoLocal) {
                    setLevantamiento(newLevantamientoLocal);
                    setHallazgos(newLevantamientoLocal.hallazgosPrincipales);
                    setModalHallazgosVisible(true);
                    setEstadoScanner((newLevantamientoLocal.estado === 1) ? false : true);
                }

            }

        } catch (error) {
            console.log(error)
        }
    }

    const getStorage = async () => {
        try {
            const dataStorage = await AsyncStorage.getItem('data');
            return dataStorage;
        } catch (error) {
            console.log(error)
            return false
        }
    }

    const saveStorage = async (item) => {
        try {
            const dataStorage = await AsyncStorage.setItem('data', item);
            return dataStorage;
        } catch (error) {
            console.log(error)
            return false
        }
    }

    onSuccess = async (e) => {

        Alert.alert(
            '¿Desea registar este levantamiento?',
            'Esta acción no se puede deshacer.',
            [
                {
                    text: 'Cancelar', onPress: async () => {
                        inputRef.current.reactivate()
                    }
                },
                {
                    text: 'Si, Aceptar', onPress: async () => {
                        const info = e.data
                        setSpinnerScanner(true)

                        const obtener = await getStorage()
                        if (obtener == null) {
                            console.log('null', obtener);
                            // saveStorage(info);
                            getCurrenLocation(info);
                        } else {
                            if (obtener.replace(/['"]+/g, '') !== info) {
                                console.log("es diferente codigo")
                                // saveStorage(info);
                                getCurrenLocation(info);
                            }
                            else {
                                console.log("es el mismo codigo");

                                Alert.alert(
                                    'MISMO QR',
                                    'INTENTE ESCANEAR OTRO DIFERENTE.',
                                    [
                                        {
                                            text: 'Aceptar', onPress: () => {
                                                inputRef.current.reactivate()
                                                setSpinnerScanner(false)
                                            }
                                        }
                                    ]
                                );

                            }
                        }
                    }
                }
            ]
        )
    }

    const getCurrenSelfieLocation = () => {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                async position => {
                    const { latitude, longitude } = position.coords;

                    if (latitude && longitude) {
                        try {
                            resolve(position.coords)
                        } catch (error) {
                            console.error("Error getCurrentSelfieLocation", error);
                            Alert.alert('Error al crear selfie, vuelva a intentarlo.');
                            resolve(false);
                        }

                    } else {
                        Alert.alert('Localizacion no disponible. Vuelva a intentarlo.');
                        resolve(false);
                    }
                },
                error => {
                    Alert.alert('ERROR LOCALIZACIÓN', 'INTENTE ESCANEAR NUEVAMENTE');
                    resolve(false);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 1000,
                    // maximumAge: 10000

                    // enableHighAccuracy: false,
                    // timeout: 10000,
                    // maximumAge: 10000
                }
            );
        });
    };

    const processHallazgosPrincipales = (levantamiento) => {
        let auditoriasPorHallazgos = {};

        for (const clave in levantamiento.hallazgosPrincipales) {
            if (levantamiento.hallazgosPrincipales.hasOwnProperty(clave)) {
                auditoriasPorHallazgos[clave] = levantamiento.hallazgosPrincipales[clave];
            }
        }

        for (const clave in auditoriasPorHallazgos) {
            if (auditoriasPorHallazgos.hasOwnProperty(clave)) {
                const auditoria = auditoriasPorHallazgos[clave];

                for (const grupoFamilia in auditoria) {
                    if (auditoria.hasOwnProperty(grupoFamilia)) {
                        const dataHallazgoMain = auditoria[grupoFamilia];

                        for (const hallazgoPrincipal in dataHallazgoMain) {
                            if (dataHallazgoMain.hasOwnProperty(hallazgoPrincipal)) {
                                const hallazgo = dataHallazgoMain[hallazgoPrincipal];

                                for (const key in hallazgo) {
                                    if (hallazgo.hasOwnProperty(key)) {
                                        const value = hallazgo[key];
                                        console.log(`Key: ${key}, Value: ${value}`);
                                        hallazgo[key] = {
                                            ...hallazgo[key],
                                            isTemporal: false
                                        }
                                    }
                                }

                            }
                        }
                    }
                }
            }
        }

        return auditoriasPorHallazgos;
    }

    const processSelfieAndFormData = async (response, newLevantamiento, numerosucursal, clavecliente) => {
        console.log('newLevantamiento', newLevantamiento);

        const getNewPhotoSelfie = (response) => {
            return response.assets.map(asset => ({
                uri: asset.uri,
                type: asset.type,
                fileName: asset.fileName,
                name: asset.fileName,
                fileSize: asset.fileSize,
                width: asset.width,
                height: asset.height,
            }));
        };

        const formData = new FormData();
        const newPhotoSelfie = getNewPhotoSelfie(response);

        newPhotoSelfie.forEach((photo, index) => {
            if (photo.fileName) {
                if (photo.type && photo.type.startsWith('image/')) {
                    formData.append(`photoSelfie`, {
                        uri: photo.uri,
                        type: photo.type,
                        name: `photo_${photo.fileName}`,
                    });
                } else {
                    console.error('Invalid image type:', photo.type);
                }
            }
        });

        let levantamientoData = {
            ...levantamiento,
            selfiePhotoFormData: formData
        };

        console.log("levantamiento", levantamientoData);

        const respCurrenSelfieLocation = await getCurrenSelfieLocation();

        const { latitude, longitude } = respCurrenSelfieLocation;
        let latitudSelfie = latitude ? latitude : '';
        let longitudSelfie = longitude ? longitude : '';
        let urlSelfie = (latitude, longitude) ? `${GOOGLE_MAPS_URL}${latitudSelfie},${longitudSelfie}` : '';

        const token = await AsyncStorage.getItem('token');
        formData.append("numerosucursal", numerosucursal);
        formData.append("url", urlSelfie);
        formData.append("latitud", latitudSelfie);
        formData.append("longitud", longitudSelfie);
        formData.append("cliente", newLevantamiento.cliente);
        formData.append("clienteId", newLevantamiento.clienteId);
        formData.append("id", newLevantamiento.id);
        formData.append("sucursalId", newLevantamiento.sucursalId);
        formData.append("token", token);
        formData.append("clavecliente", clavecliente);
        formData.append("estadoSelfie", 1);

        console.log("selfiePhotoFormData", formData);

        return formData;
    };

    const getCurrenLocation = (info) => {

        Geolocation.getCurrentPosition(

            async position => {

                const { latitude, longitude } = position.coords;

                if (latitude, longitude) {

                    info = info.trim();
                    let cadena = info.split(" ");
                    let nombresucursal = cadena.splice(2, cadena.length - 2).join(" ");
                    nombresucursal = (nombresucursal !== undefined) ? nombresucursal.trim() : "";

                    let clavecliente = cadena[1];
                    let numerosucursal = cadena[0];
                    let latitud = latitude ? latitude : '';
                    let longitud = longitude ? longitude : '';
                    let url = (latitude, longitude) ? `${GOOGLE_MAPS_URL}${latitude},${longitude}` : '';

                    if (nombresucursal !== null && nombresucursal !== "") {

                        // *********
                        // HABILITAR CAMARA DE DISPOSITIVO PARA TOMAR UNA SELFIE
                        const options = {
                            mediaType: 'photo',
                            cameraType: 'front',
                            saveToPhotos: true,                           
                            quality: 1.0,
                            maxWidth: 1024, // Ancho máximo de la imagen
                            maxHeight: 768, // Alto máximo de la imagen
                        };

                        await requestCameraPermission();
                        launchCamera(options, async (response) => {
                            if (response.didCancel) {
                                console.log('User cancelled image picker');
                                setSpinnerScanner(false);
                                inputRef.current.reactivate();
                                navigation.navigate("CheckInPage")
                            } else if (response.error) {
                                console.log('ImagePicker Error: ', response.error);
                                setSpinnerScanner(false);
                                inputRef.current.reactivate();
                            } else {

                                // ******** TEST ********
                                try {
                                    const token = await AsyncStorage.getItem('token');

                                    let resLevantamiento = await createLevantamientoRequest(clavecliente, nombresucursal,
                                        numerosucursal, latitud,
                                        longitud, url, token)
                                    try {

                                        if (resLevantamiento.data.status === 200) {
                                            const code = resLevantamiento.data.code;

                                            if (code != 1) {

                                                let newLevantamiento = resLevantamiento.data.data;
                                                console.info("TEST newLevantamiento", newLevantamiento);
                                                const hallazgosPrincipalesData = processHallazgosPrincipales(newLevantamiento);

                                                newLevantamiento = {
                                                    ...newLevantamiento,
                                                    hallazgosPrincipales: hallazgosPrincipalesData,
                                                    estado: 1
                                                };

                                                newLevantamiento = await findLevantamiento(newLevantamiento);

                                                if (newLevantamiento) {

                                                    if (response.didCancel) {
                                                        console.log('User cancelled image picker');

                                                        setSpinnerScanner(false);
                                                        inputRef.current.reactivate();
                                                        navigation.navigate("CheckInPage")
                                                    }

                                                    const formData = await processSelfieAndFormData(response, newLevantamiento, numerosucursal, clavecliente);

                                                    try {
                                                        let resSelfieLevantamiento = await selfieLevantamientoRequest(formData)
                                                        console.log("resSelfieLevantamiento", resSelfieLevantamiento);

                                                        if (resSelfieLevantamiento.status === 200 && resSelfieLevantamiento.selfie) {

                                                            newLevantamiento = {
                                                                ...newLevantamiento,
                                                                selfie: resSelfieLevantamiento.selfie,
                                                                hallazgosPrincipales: hallazgosPrincipalesData,
                                                                estado: 1
                                                            };

                                                            // console.log("ANTES DE ENTRAR A updateLevantamiento", newLevantamiento);
                                                            newLevantamiento = await findLevantamiento(newLevantamiento);
                                                            console.log("newLevantamiento TESTTING 2", newLevantamiento);

                                                            setHallazgos(newLevantamiento.hallazgosPrincipales);
                                                            setLevantamiento(newLevantamiento);
                                                            setSpinnerScanner(false);
                                                            setEstadoScanner((newLevantamiento.estado === 1) ? false : true);
                                                            navigation.navigate("CheckInPage");
                                                        }
                                                        else {
                                                            setSpinnerScanner(false);
                                                            inputRef.current.reactivate();
                                                            navigation.navigate("CheckInPage")
                                                            console.log("Error selfieLevantamientoRequest", resSelfieLevantamiento);
                                                            Alert.alert('Error al crear selfie, vuelva a intentarlo.');
                                                        }

                                                    } catch (error) {
                                                        setSpinnerScanner(false);
                                                        inputRef.current.reactivate();
                                                        console.log("Error selfieLevantamientoRequest", error);
                                                        Alert.alert('Error al crear selfie, vuelva a intentarlo.');
                                                    }


                                                    // *********

                                                } else {
                                                    Alert.alert(
                                                        'ERROR AL GUARDAR DATOS LOCALMENTE',
                                                        'VUELVA A INTENTARLO.');

                                                    setSpinnerScanner(false);
                                                    inputRef.current.reactivate();
                                                }

                                            } else {
                                                const messageLevantamientoExist = resLevantamiento.data.message.toUpperCase();
                                                Alert.alert(
                                                    messageLevantamientoExist,
                                                    'INTENTE CON OTRO LEVANTAMIENTO.',
                                                    [
                                                        {
                                                            text: 'Aceptar', onPress: () => {
                                                                inputRef.current.reactivate()
                                                                setSpinnerScanner(false)
                                                            }
                                                        }
                                                    ]
                                                );
                                            }

                                        } else {
                                            Alert.alert(
                                                'ERROR EN GUARDADO DE DATOS.',
                                                'VUELVA A INTENTARLO.');

                                            setSpinnerScanner(false);
                                            inputRef.current.reactivate();
                                        }

                                    } catch (error) {
                                        console.error(error);
                                    }

                                } catch (error) {
                                    console.log("ERROR: ", error.response)

                                    if (!isOnline) {

                                        // *********
                                        // HABILITAR CAMARA DE DISPOSITIVO PARA TOMAR UNA SELFIE
                                        const options = {
                                            mediaType: 'photo',
                                            cameraType: 'front',
                                            saveToPhotos: true,                           
                                            quality: 1.0,
                                            maxWidth: 1024, // Ancho máximo de la imagen
                                            maxHeight: 768, // Alto máximo de la imagen
                                        };

                                        await requestCameraPermission();
                                        launchCamera(options, async (response) => {
                                            if (response.didCancel) {
                                                console.log('User cancelled image picker');
                                                setSpinnerScanner(false);
                                                inputRef.current.reactivate();
                                                navigation.navigate("CheckInPage")
                                            } else if (response.error) {
                                                console.log('ImagePicker Error: ', response.error);
                                                setSpinnerScanner(false);
                                                inputRef.current.reactivate();
                                            } else {

                                                const getNewPhotoSelfie = (response) => {
                                                    return response.assets.map(asset => ({
                                                        uri: asset.uri,
                                                        type: asset.type,
                                                        fileName: asset.fileName,
                                                        name: asset.fileName,
                                                        fileSize: asset.fileSize,
                                                        width: asset.width,
                                                        height: asset.height,
                                                    }));
                                                };

                                                const formData = new FormData();
                                                const newPhotoSelfie = getNewPhotoSelfie(response);
                                                newPhotoSelfie.forEach((photo, index) => {
                                                    if (photo.fileName) {
                                                        formData.append(`photoSelfie`, {
                                                            uri: photo.uri,
                                                            type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
                                                            name: `photo_${photo.fileName}`,
                                                        })
                                                    }
                                                });

                                                await guardarLevantamientoLocalStorage({
                                                    clavecliente,
                                                    nombresucursal,
                                                    numerosucursal,
                                                    latitud,
                                                    longitud,
                                                    url,
                                                    selfiePhotoFormData: formData,
                                                    selfie: newPhotoSelfie.uri
                                                }, isOnline);
                                                setSpinnerScanner(false)

                                            }
                                        });
                                        // *********
                                    }
                                }
                                // ******** TEST ********

                            }
                        });
                        // *********
                        
                    } else {
                        Alert.alert(
                            'ERROR QR',
                            'INTENTE ESCANEAR NUEVAMENTE');
                        inputRef.current.reactivate()
                        setSpinnerScanner(false)
                    }

                }
                else {
                    Alert.alert('Localizacion no disponible. Vuelva a intentarlo.')
                    inputRef.current.reactivate()
                    setSpinnerScanner(false)
                }

            },
            error => {
                Alert.alert(
                    'ERROR LOCALIZACIÓN',
                    'INTENTE ESCANEAR NUEVAMENTE'), inputRef.current.reactivate(), setSpinnerScanner(false)
            },
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 10000
            },
        )
    }

    return (
        <SafeAreaView>

            <Spinner
                visible={spinnerScanner}
                textContent={'Enviando datos...'}
                textStyle={styles.spinnerTextStyle}
            />

            <ScrollView>

                <View>
                    <QRCodeScanner
                        onRead={this.onSuccess}
                        reactivateTimeout={500}
                        showMarker={true}
                        ref={(node) => { inputRef.current = node }}
                    />
                </View>

                <Pressable
                    onPress={() => navigation.navigate("CheckInPage")}
                    style={[styles.btn, styles.btnRegresar]}
                >
                    <Text style={styles.btnTexto}>
                        Regresar a Lista de Levantamientos
                    </Text>
                </Pressable>

            </ScrollView>

        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777'
    },
    textBold: {
        fontWeight: '500',
        color: '#000'
    },
    buttonText: {
        fontSize: 21,
        color: 'rgb(0,122,255)'
    },
    buttonTouchable: {
        padding: 16
    },
    spinnerTextStyle: {
        color: '#FFF'
    },
    btn: {
        marginTop: "25%",
        marginHorizontal: "10%",
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 5
    },
    btnRegresar: {
        backgroundColor: '#F5841E'
    },
    btnTexto: {
        textTransform: 'uppercase',
        fontWeight: '700',
        fontSize: 12,
        textAlign: 'center',
        color: '#FFF',
    },
});

export default ScannerQr;
