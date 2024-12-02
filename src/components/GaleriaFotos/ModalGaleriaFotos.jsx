import {
    Text, SafeAreaView,
    StyleSheet,
    View,
    ScrollView,
} from 'react-native';
import { grayElm } from '../Login/Constants';
import { useEffect, useState } from 'react';
import CamaraButtons from '../Camara/CamaraButtons';
import GaleriaFotos from './GaleriaFotos';
import { useHallazgo } from '../../context/HallazgosFormContext';
import Style from '../../styles/Style';
import CustomButton from '../Custom/CustomButton';
import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';

const ModalGaleriaFotos = ({
    setModalGaleriaImagenesVisible,
    capturedImages,
    requestPermissions,
    handleSelectMultipleImages,
    handleInput,
    setCapturedImages,
    hallazgoFormFotos,
    tituloNombreHallazgo = "Fotos de Hallazgo" }) => {

    useEffect(() => {
        setCapturedImages(capturedImages);
    }, [capturedImages]);

    const { setHallazgoForm, estadoLevantamiento } = useHallazgo();

    const [modalImageVisible, setModalImageVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const abrirModalConImagen = (image) => {
        setSelectedImage(image);
        setModalImageVisible(true);
    };

    const cerrarModal = () => {
        setModalImageVisible(false);
    };

    const eliminarImagen = async (indexImage, ruta) => {

        const newImages = capturedImages.filter((image, i) => i !== indexImage);

        let formData = new FormData();

        if (hallazgoFormFotos.fotos.length === 0 || !hallazgoFormFotos.fotos || hallazgoFormFotos.imagenes.length === 0) {

            hallazgoFormFotos.fotos = new FormData();
            capturedImages.forEach((image, index) => {

                let imageUri = image && (image.uri || image.ruta) ? (image.uri || image.ruta) : image;

                let fileName = (imageUri && imageUri.split('/').pop()) || null;

                if (imageUri && imageUri !== ruta) {
                    hallazgoFormFotos.fotos.append(`photos[]`, {
                        uri: imageUri,
                        type: 'image/jpeg',
                        name: fileName,
                    });
                }
            });

            formData = hallazgoFormFotos.fotos;
        } else {

            if (Array.isArray(hallazgoFormFotos.fotos)) {
                hallazgoFormFotos.fotos.map(foto => {
                    if (foto.ruta !== ruta) {
                        formData.append("id", foto.id);
                        formData.append("ruta", foto.ruta);
                    }
                });
            }
        }

        const fotoEliminada = hallazgoFormFotos.imagenes.find(foto => foto.ruta === ruta);

        if (fotoEliminada) {
            if (fotoEliminada && fotoEliminada.id) {
                formData.append("fotosEliminadas", JSON.stringify(hallazgoFormFotos.fotosEliminadas.push(fotoEliminada.id)));
            }
        }
        else {

            const fotoEliminada = capturedImages.find(foto => foto?.ruta === ruta || foto?.uri === ruta || foto === ruta);
            if (fotoEliminada) {
                hallazgoFormFotos.fotosEliminadas.push(fotoEliminada.id || fotoEliminada);
            }
        }

        const fotosLocal = newImages.map((photo) => photo);

        setCapturedImages(newImages);

        await handleInput(formData, 'fotos', fotosLocal, true, hallazgoFormFotos.fotosEliminadas, hallazgoFormFotos);
    };

    useEffect(() => {
        if (hallazgoFormFotos) {
            setHallazgoForm(hallazgoFormFotos);
        }
    }, [hallazgoFormFotos, setHallazgoForm]);

    return (
        <SafeAreaView style={styles.contenido}>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

                <Text style={Style.titleGaleria}>
                    {tituloNombreHallazgo}
                </Text>

                <View style={[Style.alignCenter, Style.marginBottom10]}>

                    {
                        estadoLevantamiento && (
                            <CamaraButtons
                                requestPermissions={requestPermissions}
                                handleSelectMultipleImages={handleSelectMultipleImages}
                            />
                        )
                    }
                </View>

                <GaleriaFotos
                    capturedImages={capturedImages}
                    estadoLevantamiento={estadoLevantamiento}
                    modalImageVisible={modalImageVisible}
                    selectedImage={selectedImage}
                    abrirModalConImagen={abrirModalConImagen}
                    eliminarImagen={eliminarImagen}
                    cerrarModal={cerrarModal}
                    styles={styles}
                />

            </ScrollView>

            <View style={[Style.alignCenter, Style.marginBottom20]}>
                <CustomButton
                    title='Cerrar Galería'
                    type='cancel'
                    icon={faCircleChevronLeft}
                    widthButton='90%'
                    onPress={() => {
                        setModalGaleriaImagenesVisible(false);
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    containerButtons: {
        flexDirection: "row",
        justifyContent: 'space-around',
    },
    containerBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 5
    },
    containerImages: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
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
    focusedCerrarGaleria: {
        boxShadow: '0px 0px 0px 1px blue'
    },
    pressedCerrarGaleria: {
        backgroundColor: '#F23C00'
    },
    btn: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 5
    },
    campo: {
        marginVertical: 11,
        marginHorizontal: 30,
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
        padding: '50%',
        width: '100%',
        height: 300,
    },
    closeButton: {
        marginTop: 15,
    },
})

export default ModalGaleriaFotos
