import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Modal,
    SafeAreaView,
    ScrollView,
    Alert,
    PermissionsAndroid
}
    from 'react-native'
import React, { useCallback, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { grayElm, orangeElm } from '../Login/Constants';
import { reporteEspecialRequest } from '../../api/reportesEspeciales';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLevantamientosListLocalStorage, guardarLevantamientosLocalStorage } from '../../helpers/levantamientos';
import CamaraButtons from './Camara/CamaraButtons';
import { request } from 'react-native-permissions';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ModalGaleriaFotos from './GaleriaFotos/ModalGaleriaFotos';

const ReporteEspecialForm = ({ cerrarModal,
    modalVisible,
    levantamiento,
    setLevantamientoReporteEspecial,
    reporteEspecial = null
}) => {

    console.log("Levantamiento ReporteEspecialForm: ", levantamiento?.reportesEspeciales);

    const fechaReporteArray = reporteEspecial?.fecha_ocurrio ? reporteEspecial.fecha_ocurrio.split(' ') : [];
    const fechaReporte = fechaReporteArray.length === 2
        ? new Date(`${fechaReporteArray[0]}T${fechaReporteArray[1]}`)
        : new Date();

    const appendExistingPhotos = () => {
        console.log("reporteEspecial", reporteEspecial?.fotosLocal);
        if (reporteEspecial?.fotosLocal && reporteEspecial?.fotosLocal.length > 0) {
            const formData = new FormData();
            reporteEspecial?.fotosLocal.forEach((photo, index) => {
                console.log("NOMBRE photo", photo);
                formData.append(`photos[]`, {
                    uri: photo.ruta,
                    type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
                    name: `${photo.ruta}`,
                    id: photo.id
                });
            });
            return formData;
        }
        return null;
    };

    const [capturedImages, setCapturedImages] = useState(appendExistingPhotos());
    const [selectedTipo, setSelectedTipo] = useState(reporteEspecial?.tipo_incidente_id?.toString() || '');
    const [date, setDate] = useState(fechaReporte);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [titulo, setTitulo] = useState(reporteEspecial?.titulo || '');
    const [descripcion, setDescripcion] = useState(reporteEspecial?.descripcion || '');
    const [modalGaleriaImagenesVisible, setModalGaleriaImagenesVisible] = useState(false);

    const abrirModalGaleriaImagenes = useCallback(() => {
        setModalGaleriaImagenesVisible(true);
    }, []);

    const appendCapturedImagesToFormData = (formData = new FormData()) => {
        if (capturedImages !== null && capturedImages._parts) {
            if (capturedImages._parts.length > 0) {
                for (const [key, value] of capturedImages._parts) {
                    if (value !== undefined && value !== null) {
                        formData.append(key, value);
                    }
                }
            } else {
                console.error("formDataObject does not have _parts property");
                Alert.alert('Error', 'No se pudieron agregar las imágenes al formulario.');
            }
        }
        return formData;
    };

    const getNewPhotosInfo = (response) => {
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

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
        if (event.type !== 'dismissed') {
            setShowTimePicker(true); // Mostrar el selector de hora después de seleccionar la fecha
        }
    };

    const onChangeTime = (event, selectedTime) => {
        const currentTime = selectedTime || date;
        setShowTimePicker(false);
        setDate(currentTime);
    };

    const generateConsecutiveNumber = (() => {
        // levantamiento.reportesEspeciales.length + 1
        let counter = 0;
        return () => {
            counter =
                levantamiento.reportesEspeciales.length > 0
                    ? parseInt(levantamiento.reportesEspeciales[levantamiento.reportesEspeciales.length - 1].numero_reporte.slice(-3)) + 1
                    : 1;
            return String(counter).padStart(3, '0');
        };
    })();

    const generateReportNumber = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const number = generateConsecutiveNumber();
        return `${year}${month}${day}${number}`;
    };

    const createReportData = async () => {

        const token = await AsyncStorage.getItem('token');
        console.log("reporteEspecial: ", reporteEspecial);
        const reporte = {
            id: reporteEspecial?.id || null,
            levantamiento_id: levantamiento.id,
            fecha: reporteEspecial?.fecha || new Date().toLocaleString('es-ES', { hour12: false }),
            // personal_id: 1,
            titulo,
            tipo_incidente_id: selectedTipo,
            numero_reporte: reporteEspecial?.numero_reporte || generateReportNumber(),
            fecha_ocurrio: `${date.toLocaleDateString('en-CA')} ${date.toLocaleTimeString('es-ES', { hour12: false })}`,
            descripcion,
            token,
            fotosLocal: capturedImages && capturedImages instanceof FormData
                ? capturedImages._parts.map(([key, value]) => value.uri)
                : []
        };

        // console.log("capturedImages", capturedImages);
        const formData = capturedImages instanceof FormData ? capturedImages : new FormData();
        formData.append('id', reporte.id);
        formData.append('levantamiento_id', reporte.levantamiento_id);
        formData.append('fecha', reporte.fecha);
        formData.append('titulo', reporte.titulo);
        formData.append('tipo_incidente_id', reporte.tipo_incidente_id);
        formData.append('numero_reporte', reporte.numero_reporte);
        formData.append('fecha_ocurrio', reporte.fecha_ocurrio);
        formData.append('descripcion', reporte.descripcion);
        formData.append('token', reporte.token);
        formData.append('fotosLocal', reporte.fotosLocal);

        return formData;
    };

    const createReportDataEliminarFotos = async (fotosEliminadas, capturedImagesData) => {

        const token = await AsyncStorage.getItem('token');

        const reporte = {
            id: reporteEspecial?.id || null,
            levantamiento_id: levantamiento.id,
            token,
            fotosEliminadas: fotosEliminadas
        };

        const formData = capturedImagesData instanceof FormData ? capturedImagesData : new FormData();
        formData.append('id', reporte.id);
        formData.append('levantamiento_id', reporte.levantamiento_id);
        formData.append('token', reporte.token);
        formData.append('fotosEliminadas', reporte.fotosEliminadas);

        return formData;
    };

    const handlerSubmitSaveReport = async () => {

        if (!descripcion.trim() || !titulo.trim() || !selectedTipo.trim()) {
            switch (true) {
                case !descripcion.trim():
                    Alert.alert(`Descripción`, 'Por favor, ingrese una descripción.');
                    return;
                case !titulo.trim():
                    Alert.alert(`Título`, 'Por favor, ingrese un título.');
                    return;
                case !selectedTipo.trim():
                    Alert.alert(`Tipo de Incidente`, 'Por favor, seleccione un tipo de incidente.');
                    return;
                default:
                    break;
            }
        }

        try {

            // Guardar el reporte
            const reportData = await createReportData();
            console.log("reportData", reportData);
            const resp = await reporteEspecialRequest(reportData);
            console.log("Respuesta del servidor:", resp);

            if (resp.status === 200) {

                Alert.alert('Reporte guardado', 'El reporte se guardó correctamente');
                console.log("Reporte guardado correctamente: ", resp.data);

                // Actualizar el levantamiento
                const newLevantamiento = {
                    ...levantamiento,
                    reportesEspeciales: reporteEspecial?.id
                        ? levantamiento.reportesEspeciales.map((reporte) =>
                            reporte.id === reporteEspecial.id ? resp.data : reporte
                        )
                        : [...levantamiento.reportesEspeciales, resp.data]
                };

                console.log("Levantamiento actualizado: ", newLevantamiento);

                try {

                    const levantamientosData = await getLevantamientosListLocalStorage();
                    const levantamientosActualizados = levantamientosData.map(
                        (levantamiento) => (levantamiento.id === newLevantamiento.id ? newLevantamiento : levantamiento)
                    );

                    await guardarLevantamientosLocalStorage(levantamientosActualizados);
                    setLevantamientoReporteEspecial(newLevantamiento);

                } catch (error) {
                    console.log("error guardarLevantamientosLocalStorage", error);
                }

                if (newLevantamiento) {
                    console.log("Levantamiento actualizado correctamente: ", newLevantamiento);
                } else {
                    console.log("Error al actualizar el levantamiento");
                }

                cerrarModal();
            }
            else {
                Alert.alert('Error', 'No se pudo guardar el reporte. Por favor, inténtelo de nuevo.');
            }

        } catch (error) {
            console.log("Error al guardar el reporte: ", error);
            Alert.alert('Error en guardar', 'No se pudo guardar el reporte. Por favor, inténtelo de nuevo.');
        }
    };

    const requestPermissions = async () => {
        try {
            const cameraStatus = await request('camera');

            if (cameraStatus === 'granted') {
                console.log('Permisos de cámara y micrófono concedidos');
                tomarFoto();
            } else {
                const requestCameraPermission = async () => {
                    try {
                        const granted = await PermissionsAndroid.request(
                            PermissionsAndroid.PERMISSIONS.CAMERA,
                            {
                                title: 'App Camera Permission',
                                message: 'App needs access to your camera',
                                buttonNeutral: 'Ask Me Later',
                                buttonNegative: 'Cancel',
                                buttonPositive: 'OK',
                            }
                        );

                        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                            console.log('Camera permission granted');
                            tomarFoto();

                        } else {
                            console.log('Camera permission denied');
                        }
                    } catch (err) {
                        console.warn(err);
                    }
                };
                requestCameraPermission();
            }
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
        }
    };

    const getCameraOptions = (origenFoto, opcion) => {
        return {
            mediaType: 'photo',
            includeExtra: true,
            quality: 0.5, // Reduce la calidad de la imagen
            maxWidth: 800, // Establece el ancho máximo de la imagen
            maxHeight: 600, // Establece el alto máximo de la imagen
            ...opcion,
        };
    };

    const tomarFoto = async () => {

        const options = getCameraOptions('camera', { saveToPhotos: true, multiple: true, });

        try {
            const response = await launchCamera(options);
            if (!response.didCancel && !response.error) {

                const newPhotoInfo = getNewPhotosInfo(response);
                let formData = new FormData();

                if (capturedImages !== null) {
                    
                    // Iterar sobre los pares clave-valor y agregarlos a la instancia de FormData
                    // if (capturedImages !== null && capturedImages._parts) {
                    //     if (capturedImages._parts.length > 0) {
                    //         for (const [key, value] of capturedImages._parts) {
                    //             if (value !== undefined && value !== null) {
                    //                 formData.append(key, value);
                    //             }
                    //         }
                    //     } else {
                    //         console.error("formDataObject does not have _parts property");
                    //     }
                    // }

                    formData = appendCapturedImagesToFormData();

                    newPhotoInfo.forEach((photo, index) => {
                        if (photo.fileName) {
                            formData.append(`photos[]`, {
                                uri: photo.uri,
                                type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
                                name: `photo_1_${photo.fileName}`,
                            });
                        }
                    });

                } else {
                    newPhotoInfo.forEach((photo, index) => {
                        if (photo.fileName) {
                            formData.append(`photos[]`, {
                                uri: photo.uri,
                                type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
                                name: `photo_1_${photo.fileName}`,
                            });
                        }
                    });
                }

                console.log("formData_1", formData);
                setCapturedImages(formData);
            }
        } catch (error) {
            console.error("Error taking photo", error);
        }
    };

    const handleSelectMultipleImages = async () => {

        try {

            const options = getCameraOptions('gallery', { selectionLimit: 0 });

            const response = await launchImageLibrary(options);
            if (!response.didCancel && !response.error) {

                const newPhotosInfo = getNewPhotosInfo(response);
                let formData = new FormData();

                if (capturedImages !== null) {

                    newPhotosInfo.forEach((photo, index) => {
                        if (photo.fileName) {
                            formData.append(`photos[]`, {
                                uri: photo.uri,
                                type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
                                name: `photo_2_${photo.fileName}`,
                            });
                        }
                    });

                    // const uniquePhotos = newPhotosInfo.filter((photo) => {
                    //     return !Array.from(capturedImages._parts).some(
                    //         ([, capturedPhoto]) =>
                    //             capturedPhoto.fileSize === photo.fileSize &&
                    //             capturedPhoto.width === photo.width &&
                    //             capturedPhoto.height === photo.height
                    //     );
                    // });
   
                    formData = appendCapturedImagesToFormData(formData);

                } else {
                    newPhotosInfo.forEach((photo, index) => {
                        if (photo.fileName) {
                            formData.append(`photos[]`, {
                                uri: photo.uri,
                                type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
                                name: `photo_2_${photo.fileName}`,
                            });
                        }
                    });
                }

                console.log("formData_2", formData);
                setCapturedImages(formData);
            }
        } catch (error) {
            console.error('Error al seleccionar imágenes:', error);
            Alert.alert('Error al seleccionar imágenes, vuelva a intentarlo.');
        }
    };

    return (
        <>
            <Modal
                animationType='slide'
                visible={modalVisible}
            >
                <SafeAreaView style={styles.contenido}>
                    <ScrollView>
                        <TouchableOpacity
                            style={styles.btnCancelar}
                            onPress={() => {
                                cerrarModal();
                            }}
                        >
                            <Text style={styles.btnCancelarTexto}>X Cerrar</Text>
                        </TouchableOpacity>

                        {/* ******** */}
                        <CamaraButtons
                            requestPermissions={requestPermissions}
                            handleSelectMultipleImages={handleSelectMultipleImages}
                        />
                        
                        <TouchableOpacity
                            style={styles.btnVerFotos}
                            onPress={() => {
                                abrirModalGaleriaImagenes()
                            }}
                        >
                            <Text style={styles.btnVerFotosTexto}>VER FOTOS</Text>
                        </TouchableOpacity>
                        {/* ******** */}

                        <View style={styles.campo}>
                            <Text style={styles.label}>Título de Incidente</Text>
                            {
                                levantamiento?.estado < 2
                                    ?
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ingrese el título de Incidente"
                                        placeholderTextColor="#666"
                                        onChangeText={(value) => setTitulo(value)}
                                        value={titulo}
                                    />
                                    : <Text style={styles.input}>
                                        {reporteEspecial?.titulo}
                                    </Text>
                            }
                        </View>

                        <View style={styles.campo}>

                            <Text style={styles.label}>Fecha y Hora del Incidente</Text>

                            {
                                levantamiento?.estado < 2
                                    ?
                                    <View>
                                        <TouchableOpacity
                                            style={styles.fechaContenedor}
                                            onPress={() => setShowDatePicker(true)}
                                        >
                                            <Text style={styles.input}>
                                                {
                                                    date.toLocaleDateString('en-CA') + ' ' + date.toLocaleTimeString()
                                                }
                                            </Text>
                                        </TouchableOpacity>
                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={date}
                                                mode="date"
                                                display="default"
                                                onChange={onChangeDate}
                                            />
                                        )}
                                        {showTimePicker && (
                                            <DateTimePicker
                                                value={date}
                                                mode="time"
                                                display="default"
                                                onChange={onChangeTime}
                                            />
                                        )}
                                    </View>
                                    :
                                    <Text style={styles.input}>
                                        {
                                            date.toLocaleDateString('en-CA') + ' ' + date.toLocaleTimeString()
                                        }
                                    </Text>
                            }

                        </View>

                        <View style={styles.campo}>
                            <Text style={styles.label}>Tipo de Incidente</Text>
                            {
                                levantamiento?.estado < 2
                                    ?
                                    <View style={styles.pickerContainer}>
                                        {
                                            levantamiento?.tipos_incidentes && levantamiento.tipos_incidentes.length > 0
                                                ?
                                                <Picker
                                                    selectedValue={selectedTipo}
                                                    onValueChange={(itemValue) => setSelectedTipo(itemValue)}
                                                    style={styles.picker}
                                                >
                                                    <Picker.Item label="Seleccione un tipo" value="" />
                                                    {
                                                        levantamiento?.tipos_incidentes.map((tipo) => (
                                                            <Picker.Item key={tipo.id} label={tipo.nombre} value={tipo.id.toString()} />
                                                        ))
                                                    }
                                                </Picker>
                                                :
                                                <Text style={styles.label}>No hay tipos de incidentes</Text>
                                        }
                                    </View>

                                    : <Text style={styles.input}>
                                        {levantamiento?.tipos_incidentes.find(
                                            tipo => tipo.id === parseInt(selectedTipo))?.nombre
                                        }
                                    </Text>
                            }
                        </View>

                        <View style={styles.campo}>
                            <Text style={styles.label}>Descripción del Incidente</Text>

                            {
                                levantamiento?.estado < 2
                                    ?
                                    <TextInput
                                        style={[styles.input, styles.sintomasInput]}
                                        placeholder="Ingrese una descripción"
                                        placeholderTextColor="#666"
                                        multiline
                                        onChangeText={(value) => setDescripcion(value)}
                                        value={descripcion}
                                    />
                                    :
                                    <Text style={[styles.input, styles.observacionesTextArea]}>
                                        {descripcion}
                                    </Text>
                            }

                        </View>

                        {
                            levantamiento.estado < 2 &&
                            <TouchableOpacity
                                style={styles.btnCancelar}
                                onPress={() => {
                                    // Handle form submission
                                    handlerSubmitSaveReport();
                                }}
                            >
                                <Text style={styles.btnCancelarTexto}>Guardar</Text>
                            </TouchableOpacity>
                        }

                        {modalGaleriaImagenesVisible && (
                            <Modal
                                animationType='slide'
                                visible={modalGaleriaImagenesVisible}
                            >
                                <ModalGaleriaFotos
                                    setModalGaleriaImagenesVisible={setModalGaleriaImagenesVisible}
                                    capturedImages={capturedImages}
                                    setCapturedImages={setCapturedImages}
                                    reporteEspecial={reporteEspecial}
                                    createReportDataEliminarFotos={createReportDataEliminarFotos}
                                    setLevantamientoReporteEspecial={setLevantamientoReporteEspecial}
                                />
                            </Modal>
                        )}

                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    contenido: {
        backgroundColor: grayElm,
        flex: 1,
    },
    titulo: {
        fontSize: 30,
        fontWeight: '600',
        textAlign: 'center',
        marginVertical: 10,
        color: '#FFF'
    },
    tituloBold: {
        fontWeight: '900'
    },
    btnCancelar: {
        marginTop: 30,
        marginBottom: 10,
        backgroundColor: orangeElm,
        marginHorizontal: 30,
        padding: 15,
        borderRadius: 10,
    },
    btnCancelarTexto: {
        color: '#FFF',
        textAlign: 'center',
        fontWeight: '900',
        fontSize: 16,
        textTransform: 'uppercase',
    },
    campo: {
        marginVertical: 11,
        marginHorizontal: 30,
    },
    label: {
        color: '#FFF',
        marginBottom: 10,
        marginTop: 15,
        fontSize: 20,
        fontWeight: '600'
    },
    input: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 10,
        marginVertical: 3
    },
    sintomasInput: {
        height: 100
    },
    fechaContenedor: {
        backgroundColor: '#FFF',
        borderRadius: 10
    },
    spinnerTextStyle: {
        color: '#FFF'
    },
    pickerContainer: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginVertical: 3
    },
    picker: {
        height: 50,
        width: '100%'
    },
    observacionesTextArea: {
        height: 'auto'
    },
    btnVerFotos: {
        marginVertical: 10,
        backgroundColor: "#DA6B1B",
        marginHorizontal: 30,
        padding: 15,
        borderRadius: 10,
      },
      btnVerFotosTexto: {
        color: '#FFF',
        textAlign: 'center',
        fontWeight: '900',
        fontSize: 16,
        textTransform: 'uppercase',
      },
})

export default ReporteEspecialForm