import { useState } from 'react';
import { 
    View,
     TouchableOpacity,
     Image,
     Text,
     Modal,
     SafeAreaView,
     ScrollView 
} from 'react-native';
import { eliminarFotosReporteEspecialRequest } from '../../../api/reportesEspeciales';
import { getLevantamientosListLocalStorage, guardarLevantamientosLocalStorage } from '../../../helpers/levantamientos';

const GaleriaFotos = ({
  capturedImages,
  setCapturedImages,
  reporteEspecial,
  createReportDataEliminarFotos,
  setLevantamientoReporteEspecial,
  styles
}) => {

  const [modalImageVisible, setModalImageVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const abrirModalConImagen = (image) => {
    console.log("abrirModalConImagen", image);
    setSelectedImage(image);
    setModalImageVisible(true);
  };

  const cerrarModal = () => {
    setModalImageVisible(false);
  };

  const eliminarImagen = async (indexImage, ruta, fotoId) => {
    console.log("eliminarImagen indexImage", indexImage);
    console.log("eliminarImagen ruta", ruta);
    
    const capturedNewImages = { ...capturedImages };
    capturedNewImages._parts = capturedNewImages._parts.filter((_, index) => index !== indexImage);
    console.log("capturedNewImages", capturedNewImages);
    setCapturedImages(capturedNewImages);

    if(reporteEspecial){

      try {
        const formDataReportDataEliminarFotos = await createReportDataEliminarFotos(`${fotoId},`, capturedNewImages);
        const resp = await eliminarFotosReporteEspecialRequest(formDataReportDataEliminarFotos);

        if (resp) {

          const levantamientosData = await getLevantamientosListLocalStorage();
          const levantamientosActualizados = levantamientosData.map(
              (levantamiento) => (levantamiento.id === newLevantamiento.id ? newLevantamiento : levantamiento)
          );

          await guardarLevantamientosLocalStorage(levantamientosActualizados);
          setLevantamientoReporteEspecial(newLevantamiento);

          console.log("Fotos eliminadas correctamente", resp.data);
        } else {
          console.error("Error al eliminar las fotos", resp);
        }

      } catch (error) {
        console.error("Error al eliminar las fotos", error);
      }

    }

  };

  console.log("capturedImages", capturedImages);

  return (
    <View>
      <View style={styles.containerImages}>
        {
          capturedImages !== null && capturedImages._parts !== undefined && capturedImages._parts.length > 0 &&
          capturedImages._parts.map((image, index) => (
            <View key={index} style={{ flexDirection: 'column', marginHorizontal: 3 }}>
              <TouchableOpacity onPress={() => abrirModalConImagen(image[1])}>
              {/* <TouchableOpacity onPress={() => {}}> */}
                <Image
                  source={{ uri: image[1].uri }}
                  style={{ width: 100, height: 100, margin: 5 }}
                />
              </TouchableOpacity>
              {/* {estadoLevantamiento && ( */}
                <TouchableOpacity onPress={() => eliminarImagen(index, image[1].uri,image[1].id)}>
                {/* <TouchableOpacity onPress={() => {}}> */}
                  <Text style={{ backgroundColor: 'red', color: 'white', textAlign: 'center' }}>Eliminar</Text>
                </TouchableOpacity>
              {/* )} */}
            </View>
          ))  
        }

      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalImageVisible}
        onRequestClose={cerrarModal}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <SafeAreaView style={{ width: '100%', maxHeight: '80%' }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
              <View style={styles.modalView}>
                {selectedImage && (
                  <Image
                    source={{ uri: (selectedImage && selectedImage.uri) ? selectedImage.uri : selectedImage }}
                    style={styles.modalImage}
                  />
                )}
                <TouchableOpacity
                  style={styles.btnCancelar}
                  onPress={cerrarModal}
                >
                  <Text style={styles.btnCancelarTexto}>X CERRAR</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
      
    </View>
  );
};

export default GaleriaFotos;