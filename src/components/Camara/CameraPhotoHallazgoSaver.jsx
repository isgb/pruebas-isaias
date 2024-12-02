import React, { useCallback, useEffect, useState } from 'react';
import { PermissionsAndroid, View, Alert, Modal } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { request } from 'react-native-permissions';
import ModalGaleriaFotos from '../GaleriaFotos/ModalGaleriaFotos';
import CustomButton from '../Custom/CustomButton';
import { faCameraRetro } from '@fortawesome/free-solid-svg-icons';
import { useHallazgo } from '../../context/HallazgosFormContext';

const CameraPhotoHallazgoSaver = ({
    hallazgoForm,
    tituloNombreHallazgo = "Fotos del hallazgo",
    setFormInputs
}) => {
    
    useEffect(() => {
        setHallazgoFormFotos(hallazgoForm);
    }, [hallazgoForm]);

    const { handleInputImage } = useHallazgo();

    const [capturedImages, setCapturedImages] = useState((hallazgoForm.fotosLocal) ? hallazgoForm.fotosLocal : []);
    const [modalGaleriaImagenesVisible, setModalGaleriaImagenesVisible] = useState(false);
    const [hallazgoFormFotos, setHallazgoFormFotos] = useState(hallazgoForm);

    const abrirModalGaleriaImagenes = useCallback(() => {
        setModalGaleriaImagenesVisible(true);
    }, []);

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

    const optionsCamera = {
        mediaType: 'photo',
        includeExtra: true,
        quality: 0.5, // Reduce la calidad de la imagen
        maxWidth: 800, // Establece el ancho máximo de la imagen
        maxHeight: 600, // Establece el alto máximo de la imagen
        // includeBase64: true, // Opcional: incluye la imagen en formato base64 en la respuesta
    };

    const tomarFoto = async () => {

        const options = {
            mediaType: 'photo',
            includeExtra: true,
            quality: 1.0,
            maxWidth: 1024, // Ancho máximo de la imagen
            maxHeight: 768, // Alto máximo de la imagen
            saveToPhotos: true,
            multiple: true,
        };

        try {
            const response = await launchCamera(options);
            if (!response.didCancel && !response.error) {

                const newPhotoInfo = getNewPhotosInfo(response);

                const formData = new FormData();

                newPhotoInfo.forEach((photo, index) => {
                    if (photo.fileName) {
                        formData.append(`photos[]`, {
                            uri: photo.uri,
                            type: 'image/jpeg',
                            name: `photo_${photo.fileName}`,
                        })
                    }
                });

                const capturedImagesWithNewPhotos = capturedImages.map(photo => photo.uri ? photo.uri : photo);
                let fotosLocal = [...capturedImagesWithNewPhotos, newPhotoInfo[0].uri];

                const respNewPhotoInfo = await handleInputImage(formData, "fotos", fotosLocal, false, [], hallazgoFormFotos);

                if (respNewPhotoInfo) {

                    // const uniquePhotos = newPhotoInfo.filter(photo =>
                    //     !capturedImages.some(capturedPhoto => capturedPhoto.uri === photo.uri)
                    // );

                    // setCapturedImages(prevCapturedImages => [
                    //     ...prevCapturedImages,
                    //     ...uniquePhotos,
                    // ]);

                    setCapturedImages(respNewPhotoInfo.imagenes);

                    setHallazgoFormFotos(prevHallazgoFormFotos => ({
                        ...prevHallazgoFormFotos,
                        hallazgoId: respNewPhotoInfo.data.id,
                    }));

                    /** Se actualiza el hallazgoId para no crear un hallazgo duplicado */
                    setFormInputs(prevState => ({
                        ...prevState,
                        hallazgoId: respNewPhotoInfo.data.id,
                    }))

                } else
                    setCapturedImages(prevCapturedImages => [...prevCapturedImages, ...newPhotoInfo]);
            }
        } catch (error) {
            console.error("Error taking photo", error);
        }
    };

    const handleSelectMultipleImages = async () => {
        try {
            const options = {
                mediaType: 'photo',
                includeExtra: true,
                quality: 1.0,
                maxWidth: 1024, // Ancho máximo de la imagen
                maxHeight: 768, // Alto máximo de la imagen
                selectionLimit: 0,
            };

            const response = await launchImageLibrary(options);
            if (!response.didCancel && !response.error) {
                const newPhotosInfo = getNewPhotosInfo(response);

                const formData = new FormData();
                capturedImages.forEach((photo, index) => {
                    if (photo.fileName) {
                        formData.append(`photos[]`, {
                            uri: photo.uri,
                            type: 'image/jpeg',
                            name: `photo_${photo.fileName}`,
                        });
                    }
                });

                const uniquePhotos = newPhotosInfo.filter((photo) => {
                    return !capturedImages.some(
                        (capturedPhoto) =>
                            capturedPhoto.fileSize === photo.fileSize &&
                            capturedPhoto.width === photo.width &&
                            capturedPhoto.height === photo.height
                    );
                });

                if (uniquePhotos.length > 0) {
                    uniquePhotos.forEach((photo, index) => {
                        if (photo.fileName) {
                            formData.append(`photos[]`, {
                                uri: photo.uri,
                                type: 'image/jpeg',
                                name: `photo_${photo.fileName}`,
                            });
                        }
                    });
                }
                let fotosLocal = uniquePhotos.map((photo) => { return photo.uri });
                const capturedImagesWithNewPhotos = capturedImages.map(photo => photo.uri);
                fotosLocal = [...capturedImagesWithNewPhotos, ...fotosLocal];
                const respNewPhotosInfo = await handleInputImage(formData, "fotos", fotosLocal, false, [], hallazgoFormFotos);

                if (respNewPhotosInfo) {
                    
                    setCapturedImages(respNewPhotosInfo.imagenes);

                    setHallazgoFormFotos(prevHallazgoFormFotos => ({
                        ...prevHallazgoFormFotos,
                        hallazgoId: respNewPhotosInfo.data.id,
                    }));

                    setFormInputs(prevState => ({
                        ...prevState,
                        hallazgoId: respNewPhotosInfo.data.id,
                    }))

                } else if (uniquePhotos.length > 0) {
                    setCapturedImages((prevCapturedImages) => [
                        ...prevCapturedImages,
                        ...uniquePhotos,
                    ]);
                }
            }
        } catch (error) {
            console.error('Error al seleccionar imágenes:', error);
            Alert.alert('Error al seleccionar imágenes, vuelva a intentarlo.');
        }
    };

    return (
        <View style={{ flexDirection: "column", justifyContent: 'space-between', }}>

            {/* BOTÓN PARA VISUALIZAR LAS FOTOS DEL HALLAZGO */}
            <CustomButton
                title="Fotos"
                onPress={() => { abrirModalGaleriaImagenes() }}
                type="elm"
                widthButton="100%"
                marginTop={10}
                icon={faCameraRetro}
            />

            {modalGaleriaImagenesVisible && (
                <Modal
                    animationType='slide'
                    visible={modalGaleriaImagenesVisible}
                >
                    <ModalGaleriaFotos
                        setModalGaleriaImagenesVisible={setModalGaleriaImagenesVisible}
                        capturedImages={capturedImages}
                        setCapturedImages={setCapturedImages}
                        requestPermissions={requestPermissions}
                        handleSelectMultipleImages={handleSelectMultipleImages}
                        handleInput={handleInputImage}
                        hallazgoFormFotos={hallazgoFormFotos}
                        tituloNombreHallazgo={tituloNombreHallazgo}
                    />
                </Modal>
            )}
            {/* ************************** */}

        </View>
    );
};

export default CameraPhotoHallazgoSaver;