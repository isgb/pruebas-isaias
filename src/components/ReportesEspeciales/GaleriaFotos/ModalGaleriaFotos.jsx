import {
    Modal,
    Text, SafeAreaView,
    StyleSheet,
    View,
    ScrollView,
    Image,
    TouchableOpacity
} from 'react-native';
// import { useState } from 'react';
// import CamaraButtons from '../Camara/CamaraButtons';
// import GaleriaFotos from './GaleriaFotos';
import { orangeElm,grayElm } from '../../Login/Constants';
import GaleriaFotos from './GaleriaFotos';

const ModalGaleriaFotos = ({
    setModalGaleriaImagenesVisible,
    capturedImages,
    setCapturedImages,
    reporteEspecial,
    createReportDataEliminarFotos,
    setLevantamientoReporteEspecial
}) => {

    return (
        <SafeAreaView style={styles.contenido}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

                <TouchableOpacity
                    style={styles.btnCancelar}
                    onPress={() => {
                        setModalGaleriaImagenesVisible(false);
                    }}
                >
                    <Text style={styles.btnCancelarTexto}>X CERRAR GALERIA</Text>
                </TouchableOpacity>

                <GaleriaFotos
                    capturedImages={capturedImages}
                    setCapturedImages={setCapturedImages}
                    reporteEspecial={reporteEspecial}
                    createReportDataEliminarFotos={createReportDataEliminarFotos}
                    setLevantamientoReporteEspecial={setLevantamientoReporteEspecial}
                    styles={styles}
                />
                
            </ScrollView>
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
    btnCancelar: {
        marginVertical: 10,
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
    label: {
        color: '#FFF',
        marginBottom: 5,
        marginTop: 5,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center', 
        fontSize: 24, 
        fontWeight: 'bold', 
        width: '50%',
        backgroundColor:orangeElm,
        alignSelf: 'center',
        borderRadius:5
    },
})

export default ModalGaleriaFotos
