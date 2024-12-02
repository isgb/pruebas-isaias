import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
    View,
    TouchableOpacity,
    Image,
    Text,
    Modal,
    SafeAreaView,
    ScrollView
} from 'react-native';

const GaleriaFotos = ({
    capturedImages,
    estadoLevantamiento,
    modalImageVisible,
    selectedImage,
    abrirModalConImagen,
    eliminarImagen,
    cerrarModal,
    styles
}) => {
    return (
        <View>

            <View style={styles.containerImages}>
                {capturedImages.length > 0 &&
                    capturedImages.map((image, index) => (image !== null) &&
                        (<View key={index} style={{ flexDirection: 'column', marginHorizontal: 3 }}>
                            <TouchableOpacity onPress={() => abrirModalConImagen(image)}>

                                <Image
                                    source={{
                                        uri: (image && image.uri) ? image.uri : (image.ruta ? image.ruta : image)
                                    }}
                                    style={{ width: 110, height: 110, margin: 5, marginBottom: 0 }}
                                />

                            </TouchableOpacity>
                            {estadoLevantamiento && (
                                <TouchableOpacity onPress={() => eliminarImagen(index, (image && image.uri) ? image.uri : (image.ruta ? image.ruta : image))}>
                                    <Text style={{ width: 110, backgroundColor: '#dc3545', color: 'white', textAlign: 'center', paddingVertical: 6, margin: 5, marginBottom: 18, marginTop: 0 }}>
                                        <FontAwesomeIcon style={{color: 'white'}} icon={faTrashCan} />
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>)
                    )}
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
                                        source={{
                                            uri: (selectedImage && selectedImage.uri) ? selectedImage.uri : (selectedImage.ruta ? selectedImage.ruta : selectedImage)
                                        }}
                                        style={styles.modalImage}
                                    />
                                )}
                                <TouchableOpacity
                                    style={styles.btnCancelar}
                                    onPress={cerrarModal}
                                >
                                    <Text style={{ paddingVertical: 8}}>X CERRAR</Text>
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