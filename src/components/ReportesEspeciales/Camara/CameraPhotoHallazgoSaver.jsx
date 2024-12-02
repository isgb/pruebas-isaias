import React, { memo, useCallback, useEffect, useState } from 'react';
import { StyleSheet, PermissionsAndroid, View, Alert, Text, Modal, TouchableOpacity } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { request } from 'react-native-permissions';
// import { orangeElm } from '../Login/Constants';
import ModalGaleriaFotos from '../GaleriaFotos/ModalGaleriaFotos';

const CameraPhotoHallazgoSaver = ({ hallazgoForm,
  handleInput,
  estadoLevantamiento = false,
  handleInputImage,
  tituloNombreHallazgo = "Nombre del hallazgo"
}) => {

  const [capturedImages, setCapturedImages] = useState((hallazgoForm.fotosLocal) ? hallazgoForm.fotosLocal : []);
  const [modalGaleriaImagenesVisible, setModalGaleriaImagenesVisible] = useState(false);

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

  const crearObjetoFoto = (photo) => {
    return {
      uri: photo.uri,
      type: photo.type,
      fileName: photo.fileName,
      name: photo.fileName,
      fileSize: photo.fileSize,
      width: photo.width,
      height: photo.height,
    };

    // return new File([photo.uri], photo.name, { type: photo.type });
  }

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
      quality: 0.5, // Reduce la calidad de la imagen
      maxWidth: 800, // Establece el ancho máximo de la imagen
      maxHeight: 600, // Establece el alto máximo de la imagen
      saveToPhotos: true,
      multiple: true,
      // includeBase64: true, // Opcional: incluye la imagen en formato base64 en la respuesta
    };

    try {
      const response = await launchCamera(options);
      if (!response.didCancel && !response.error) {

        console.log("resplaunchCamera", response.assets);

        const newPhotoInfo = getNewPhotosInfo(response);

        // setCapturedImages(prevCapturedImages => [...prevCapturedImages, ...newPhotoInfo]);

        const formData = new FormData();
        // if (capturedImages.length > 0) {
        //   capturedImages.forEach((photo, index) => {
        //     if (photo.fileName) {
        //       formData.append(`photos[]`, {
        //         uri: photo.uri,
        //         type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
        //         name: `photo_${photo.fileName}`,
        //       });
        //     }
        //   });
        // }

        //  ******* TESTTING *******
        // const formData = new FormData();
        // console.log("capturedImages", capturedImages);  
        // capturedImages.forEach((image, index) => {

        //   console.log(`Image ${index} is of type:`, typeof image);
        //   if(typeof image === "string"){
        //     formData.append(`photos[]`, {
        //       uri: image,
        //       type: 'image/jpeg',
        //       name: `${image}`,
        //       });
        //   }else{
        //     formData.append(`photos[]`, {
        //       uri: image.uri,
        //       type: 'image/jpeg',
        //       name: `${image.fileName}`,
        //       });
        //   }

        // }); 
        //  ******* ******** *******

        newPhotoInfo.forEach((photo, index) => {
          if (photo.fileName) {
            formData.append(`photos[]`, {
              uri: photo.uri,
              type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
              name: `photo_${photo.fileName}`,
            })
          }
        });

        console.log("formData_1", formData);

        const capturedImagesWithNewPhotos = capturedImages.map(photo => photo.uri ? photo.uri : photo);
        let fotosLocal = [...capturedImagesWithNewPhotos, newPhotoInfo[0].uri];
        console.log("TETSING DE NUEVA FOTO", fotosLocal);

        const respNewPhotoInfo = await handleInputImage(formData, "fotos", fotosLocal);
        console.log("RESPUESTA DE IMAGENES", respNewPhotoInfo);

        if (respNewPhotoInfo) {
          console.log("entro al primero");
          setCapturedImages(prevCapturedImages => {
            const uniquePhotos = newPhotoInfo.filter(photo => {
              return !prevCapturedImages.some(capturedPhoto => capturedPhoto.uri === photo.uri);
            });
            return [...prevCapturedImages, ...uniquePhotos];
          });
        }
        else {
          setCapturedImages(prevCapturedImages => [...prevCapturedImages, ...newPhotoInfo]);
        }

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
        quality: 0.5, // Reduce la calidad de la imagen
        maxWidth: 800, // Establece el ancho máximo de la imagen
        maxHeight: 600, // Establece el alto máximo de la imagen
        selectionLimit: 0,
        // includeBase64: true, // Opcional: incluye la imagen en formato base64 en la respuesta
      };

      const response = await launchImageLibrary(options);
      if (!response.didCancel && !response.error) {
        const newPhotosInfo = getNewPhotosInfo(response);

        const formData = new FormData();
        capturedImages.forEach((photo, index) => {
          if (photo.fileName) {
            formData.append(`photos[]`, {
              uri: photo.uri,
              type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
              name: `photo_${photo.fileName}`,
            });
          }
        });

        // console.log("FOTOS CAPTURADAS", capturedImages);

        const uniquePhotos = newPhotosInfo.filter((photo) => {
          return !capturedImages.some(
            (capturedPhoto) =>
              capturedPhoto.fileSize === photo.fileSize &&
              capturedPhoto.width === photo.width &&
              capturedPhoto.height === photo.height
          );
        });

        if (uniquePhotos.length > 0) {
          // setCapturedImages((prevCapturedImages) => [
          //   ...prevCapturedImages,
          //   ...uniquePhotos,
          // ]);

          uniquePhotos.forEach((photo, index) => {
            if (photo.fileName) {
              formData.append(`photos[]`, {
                uri: photo.uri,
                type: 'image/jpeg', // Asegúrate de que el tipo coincida con tu imagen
                name: `photo_${photo.fileName}`,
              });
            }
          });
        }

        let fotosLocal = uniquePhotos.map((photo) => { return photo.uri });
        const capturedImagesWithNewPhotos = capturedImages.map(photo => photo.uri);
        fotosLocal = [...capturedImagesWithNewPhotos, ...fotosLocal];
        // console.log("TESTING DE NUEVAS FOTOS", fotosLocal);

        const respNewPhotosInfo = await handleInputImage(formData, 'fotos', fotosLocal);
        // console.log("RESPUESTA DE IMAGENES", respNewPhotosInfo);

        if (respNewPhotosInfo && uniquePhotos.length > 0) {
          // console.log("entro al primero");

          hallazgoForm.imagenes = respNewPhotosInfo;

          setCapturedImages(prevCapturedImages => {
            const uniquePhotos = respNewPhotosInfo.filter(photo => {
              return !prevCapturedImages.some(capturedPhoto => capturedPhoto.uri === photo.uri);
            });
            return [...prevCapturedImages, ...uniquePhotos];
          });
        }
        else if (uniquePhotos.length > 0) {
          setCapturedImages(prevCapturedImages => [...prevCapturedImages, ...uniquePhotos]);
        }

      }
    } catch (error) {
      console.error('Error al seleccionar imágenes:', error);
      Alert.alert('Error al seleccionar imágenes, vuelva a intentarlo.');
    }
  };

  return (
    <View style={{ flexDirection: "column", justifyContent: 'space-between', }}>

      {/* ************************** */}
      {/* <TouchableOpacity
        style={styles.btnVerFotos}
        onPress={() => {
          abrirModalGaleriaImagenes()
        }}
      >
        <Text style={styles.btnVerFotosTexto}>VER FOTOS</Text>
      </TouchableOpacity>

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
            estadoLevantamiento={estadoLevantamiento}
            hallazgoFormFotos={hallazgoForm}
            tituloNombreHallazgo={tituloNombreHallazgo}
          />
        </Modal>
      )} */}
      {/* ************************** */}

    </View>
  );
};

const styles = StyleSheet.create({
  containerBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 5
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalImage: {
    width: 300,
    height: 300,
  },
  closeButton: {
    marginTop: 15,
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
});

export default memo(CameraPhotoHallazgoSaver);