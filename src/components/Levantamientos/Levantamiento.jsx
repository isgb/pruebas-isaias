import {
    View,
    Text,
    Pressable,
    Modal,
    Alert,
    PermissionsAndroid,
} from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { formatearFecha, showAlertMessageError } from '../../helpers';
import ModalHallazgos from '../Hallazgos/ModalHallazgos';
import InformacionLevantamiento from './InformacionLevantamiento';
import {
    guardarEstadoLevantamientoForSendDB,
    guardarEstadoLevantamientoOnListLocalStorageForSendToDB,
    updateLevantamientoOnLevantamientosListLocalStorage
} from '../../helpers/levantamientos';
import { DataContext } from '../../context/DataContext';
import { selfieLevantamientoRequest, terminarLevantamientoRequest } from '../../api/levantamientos';
import { launchCamera } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_MAPS_URL, optionsCamera } from '../../utils';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import CustomButton from '../Custom/CustomButton';
import { faClipboardCheck, faFileLines } from '@fortawesome/free-solid-svg-icons';
import uuid from 'react-native-uuid';
import Style from '../../styles/Style';

const Levantamiento = ({ levantamiento }) => {

    const {
        setLevantamientos,
        setEstadoScanner,
        isOnline,
        updateLevantamiento
    } = useContext(DataContext);

    const guardarImagenesHallazgoOnLocal = ({ imagenes, fotosLocal }) => {

        return (!isOnline && fotosLocal && fotosLocal.length > 0)
            ? fotosLocal
            : (imagenes && imagenes.length > 0
                ? imagenes.map(imagen => (imagen.ruta))
                : [])
    };

    const hallazgosPrincipalesData = () => {

        auditoriasPorHallazgos = [];

        for (const clave in levantamiento.hallazgosPrincipales) {
            if (levantamiento.hallazgosPrincipales.hasOwnProperty(clave)) {

                auditoriasPorHallazgos.push({
                    [clave]: levantamiento.hallazgosPrincipales[clave]
                });
            }
        }

        auditoriasPorHallazgos.map((dataAuditorias) => {

            const auditoria = dataAuditorias[Object.keys(dataAuditorias)[0]];

            for (const clave in auditoria) {
                if (auditoria.hasOwnProperty(clave)) {

                    const dataFamiliaMain = auditoria[clave];

                    for (const grupoFamilia in dataFamiliaMain) {
                        if (dataFamiliaMain.hasOwnProperty(grupoFamilia)) {

                            const dataHallazgoMain = dataFamiliaMain[grupoFamilia];

                            for (const hallazgoPrincipal in dataHallazgoMain) {
                                if (dataHallazgoMain.hasOwnProperty(hallazgoPrincipal)) {

                                    const hallazgo = dataHallazgoMain[hallazgoPrincipal];

                                    dataHallazgoMain[hallazgoPrincipal] = {
                                        id: hallazgo.id,
                                        idUnique: uuid.v4(),
                                        hallazgo: hallazgo.hallazgo,
                                        hallazgoPrincipalId: (hallazgo.id !== undefined)
                                            ? hallazgo.id : null,
                                        cantidadIdeal: (hallazgo.cantidadIdeal !== undefined && hallazgo.cantidadIdeal !== "" && hallazgo.cantidadReal !== null)
                                            ? hallazgo.cantidadIdeal.toString() : "0",
                                        cantidadReal: (hallazgo.cantidadReal !== undefined && hallazgo.cantidadReal !== "" && hallazgo.cantidadReal !== null)
                                            ? hallazgo.cantidadReal.toString() : "0",
                                        observaciones: hallazgo.observaciones,
                                        fotos: (hallazgo.imagenes !== undefined && hallazgo.imagenes.length > 0)
                                            ? hallazgo.imagenes : [],
                                        fotosLocal: guardarImagenesHallazgoOnLocal(hallazgo),
                                        hallazgoId: (hallazgo.hallazgoId !== undefined)
                                            ? hallazgo.hallazgoId : "",
                                        isTemporal: (hallazgo.isTemporal !== undefined)
                                            ? hallazgo.isTemporal : false,
                                        imagenes: (hallazgo.imagenes !== undefined)
                                            ? hallazgo.imagenes : [],
                                        test: guardarImagenesHallazgoOnLocal(hallazgo),
                                        fotosEliminadas: [],
                                        camposAdicionales: (hallazgo.camposAdicionales !== undefined) ? hallazgo.camposAdicionales : [],
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        return auditoriasPorHallazgos;
    };

    const [modalVisible, setModalVisible]                     = useState(false);
    const [modalRefresh, setModalRefresh]                     = useState(false);
    const [hallazgos]                                         = useState(hallazgosPrincipalesData);
    const [auditoria, setAuditoria]                           = useState("");
    const [levantamientoTerminado, setLevantamientoTerminado] = useState((levantamiento.estado === 1) ? 1 : 0);

    const cerrarModal = () => {
        setModalVisible(false);
    }

    const abrirModal = () => {
        setModalVisible(true);
    }

    const actualizarEstadoLevantamiento = async (dataLevantamiento, errorRequest = false) => {
        try {

            setLevantamientoTerminado(0);
            setEstadoScanner(true);

            const responseUpdatedLevantamientos = await updateLevantamientoOnLevantamientosListLocalStorage(dataLevantamiento);
            if (responseUpdatedLevantamientos) {

                setLevantamientos(responseUpdatedLevantamientos);

                if (!isOnline || errorRequest === true) {
                    console.log("antes de guardarEstadoLevantamientoOnListLocalStorageForSendToDB", dataLevantamiento);
                    await guardarEstadoLevantamientoOnListLocalStorageForSendToDB(dataLevantamiento);

                    /** */
                    if (dataLevantamiento && dataLevantamiento.levantamientoTemporalId) {
                        await guardarEstadoLevantamientoForSendDB(dataLevantamiento);
                    }
                    /** */
                }
            }

        } catch (error) {
            console.log("actualizarEstadoLevantamiento", error);
        }
    }

    const handleTakeSelfie = async (estado) => {

        // const options = {
        //     mediaType: 'photo',
        //     cameraType: 'front',
        //     saveToPhotos: true,                           
        //     quality: 1.0,
        //     maxWidth: 1024, // Ancho máximo de la imagen
        //     maxHeight: 768, // Alto máximo de la imagen
        // };

        launchCamera(optionsCamera, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                console.log('Image URI: 2', response);

                const formData = new FormData();
                const newPhotoSelfie = getNewPhotoSelfie(response);
                newPhotoSelfie.forEach((photo, index) => {
                    if (photo.fileName) {
                        formData.append(`photoSelfie`, {
                            uri: photo.uri,
                            type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
                            name: `photo_${photo.fileName}`,
                        });
                    }
                });

                let levantamientoData = {
                    ...levantamiento,
                    selfiePhotoFormData: formData
                };

                console.log("levantamiento", levantamientoData);
                const resp = await getCurrenSelfieLocation(levantamientoData, estado);

                if (resp) {
                    handleTerminarLevantamiento();
                }
            }
        });
    };

    const handleTerminarLevantamiento = async () => {
        if (levantamientoTerminado === 1) {
            try {
                const dataLevantamiento = {
                    ...levantamiento,
                    estado: 2
                };

                console.log("terminarLevantamiento dataLevantamiento", dataLevantamiento);

                if (isOnline) {
                    const respTerminarLevantamiento = await terminarLevantamientoRequest(levantamiento.id);

                    if (respTerminarLevantamiento.data.status === "success") {
                        await actualizarEstadoLevantamiento(dataLevantamiento);
                    } else {
                        console.log("respTerminarLevantamiento", respTerminarLevantamiento);
                        showAlertMessageError("No se pudo terminar el levantamiento, vuelva a intentarlo.");
                        await actualizarEstadoLevantamiento(dataLevantamiento, true);
                    }
                } else {
                    console.log("GUARDAR EN LOCALSTORAGE");
                    await actualizarEstadoLevantamiento(dataLevantamiento);
                }
            } catch (error) {
                console.error("ERROR terminarLevantamiento", error);
            }
        }
    };

    const terminarLevantamiento = () => {
        Alert.alert(
            '¿Desea terminar este levantamiento?',
            'Esta acción no se puede deshacer.',
            [
                {
                    text: 'Cancelar'
                },
                {
                    text: 'Si, Aceptar', onPress: async () => {
                        handleTakeSelfie(2);
                    }
                }
            ]
        )
    }

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

    const getCurrenSelfieLocation = (levantamiento, estadoSelfie = 1) => {
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                async position => {
                    const { latitude, longitude } = position.coords;

                    if (latitude && longitude) {
                        try {
                            const { cliente, clienteId, estado, fecha, id, sucursalId, sucursal, selfiePhotoFormData } = levantamiento;

                            let sucursalNombre = sucursal.trim();
                            let cadena = sucursalNombre.split(" ");
                            let nombresucursal = cadena.splice(2, cadena.length - 2).join(" ");
                            nombresucursal = (nombresucursal !== undefined) ? nombresucursal.trim() : "";
                            let numerosucursal = cadena[1];
                            let clavecliente = cadena[0];
                            let latitud = latitude ? latitude : '';
                            let longitud = longitude ? longitude : '';
                            let url = (latitude && longitude) ? `${GOOGLE_MAPS_URL}${latitude},${longitude}` : '';

                            const token = await AsyncStorage.getItem('token');
                            selfiePhotoFormData.append("numerosucursal", numerosucursal);
                            selfiePhotoFormData.append("url", url);
                            selfiePhotoFormData.append("latitud", latitud);
                            selfiePhotoFormData.append("longitud", longitud);
                            selfiePhotoFormData.append("cliente", cliente);
                            selfiePhotoFormData.append("clienteId", clienteId);
                            selfiePhotoFormData.append("estado", estado);
                            selfiePhotoFormData.append("fecha", fecha);
                            selfiePhotoFormData.append("id", id);
                            selfiePhotoFormData.append("sucursalId", sucursalId);
                            selfiePhotoFormData.append("token", token);
                            selfiePhotoFormData.append("clavecliente", clavecliente);
                            selfiePhotoFormData.append("estadoSelfie", estadoSelfie);

                            console.log("selfiePhotoFormData", selfiePhotoFormData);

                            let resSelfieLevantamiento = await selfieLevantamientoRequest(selfiePhotoFormData);
                            console.log("resSelfieLevantamiento", resSelfieLevantamiento);

                            if (resSelfieLevantamiento.status === 200) {
                                levantamiento = {
                                    ...levantamiento,
                                    selfie: resSelfieLevantamiento.selfie
                                };
                                levantamiento = await updateLevantamiento(levantamiento);
                                console.log("ABRIENDO MODAL");
                                resolve(true);
                            } else {
                                console.log("Error selfieLevantamientoRequest", resSelfieLevantamiento);
                                Alert.alert('Error al crear selfie, vuelva a intentarlo.');
                                resolve(false);
                            }
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
                    console.log("ERROR LOCALIZACIÓN", error);
                    resolve(false);
                },
                {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 10000
                }
            );
        });
    };

    const abrirModalHallazgos = (auditoriaValue) => {

        setAuditoria(auditoriaValue);

        if (levantamiento.selfie === "") {

            // const options = {
            //     mediaType: 'photo',
            //     cameraType: 'front',
            //     saveToPhotos: true,                           
            //     quality: 1.0,
            //     maxWidth: 1024, // Ancho máximo de la imagen
            //     maxHeight: 768, // Alto máximo de la imagen
            // };

            launchCamera(optionsCamera, async (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.error) {
                    console.log('ImagePicker Error: ', response.error);
                } else {
                    console.log('Image URI: 1', response);

                    const formData = new FormData();
                    const newPhotoSelfie = getNewPhotoSelfie(response);
                    newPhotoSelfie.forEach((photo) => {
                        if (photo.fileName) {
                            formData.append(`photoSelfie`, {
                                uri: photo.uri,
                                type: 'image/jpeg',
                                name: `photo_${photo.fileName}`,
                            });
                        }
                    });

                    let levantamientoData = {
                        ...levantamiento,
                        selfiePhotoFormData: formData,
                    };

                    const resp = await getCurrenSelfieLocation(levantamientoData);

                    if (resp) {
                        abrirModal();
                    }
                }
            });
            // *********
        } else
            setModalVisible(true);
    }

    useEffect(() => {
        const requestCameraPermission = async () => {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Permiso de Cámara',
                        message: 'Esta aplicación necesita acceso a la cámara',
                        buttonNegative: 'Cancelar',
                        buttonPositive: 'OK',
                    },
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('Permiso de cámara denegado');
                }
            } else {
                const result = await request(PERMISSIONS.IOS.CAMERA);
                if (result !== RESULTS.GRANTED) {
                    console.log('Permiso de cámara denegado');
                }
            }
        };

        requestCameraPermission();
    }, []);

    return (
        <>
            <Pressable
                onLongPress={() => {
                    setModalRefresh(true);
                }}
            >
                <View style={Style.containerLevantamiento} >
                    <View>
                        <Text style={Style.titleLevantamiento}>Levantamiento {levantamiento.id}</Text>
                        <Text style={Style.subTitleLevantamiento}>Fecha: {formatearFecha(levantamiento.fecha)}</Text>
                        <Text style={Style.subTitleLevantamiento}>Sucursal: {levantamiento.sucursal} </Text>

                        <View style={[Style.alignCenter, Style.marginTop20]}>

                            {hallazgos.map((auditoria, index) => {

                                const auditoriaValue = Object.keys(auditoria)[0];

                                return (
                                    <CustomButton
                                        key={index}
                                        title={auditoriaValue}
                                        widthButton='80%'
                                        icon={faFileLines}
                                        marginTop={10}
                                        onPress={() => {
                                            abrirModalHallazgos(auditoriaValue);
                                        }}
                                    />
                                );
                            })}

                            {
                                levantamientoTerminado === 1 && (
                                    <CustomButton
                                        title='Terminar Levantamiento'
                                        widthButton='80%'
                                        icon={faClipboardCheck}
                                        marginTop={10}
                                        type='save'
                                        onPress={() => {
                                            terminarLevantamiento();
                                        }}
                                    />
                                )
                            }

                        </View>
                    </View>
                </View>
            </Pressable>

            <ModalHallazgos
                modalVisible={modalVisible}
                cerrarModal={cerrarModal}
                hallazgos={hallazgos}
                typeAuditoria={auditoria}
                levantamiento={levantamiento}
            />

            <Modal
                visible={modalRefresh}
                animationType='slide'
            >
                <InformacionLevantamiento
                    setModalRefresh={setModalRefresh}
                    levantamiento={levantamiento}
                />
            </Modal>
        </>
    )
}

export default Levantamiento;