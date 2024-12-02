import {
    Modal,
    Text,
    SafeAreaView,
    StyleSheet,
    View,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { grayElm, orangeElm } from '../Login/Constants';
import CardHeaderInformationLevantamiento from './CardHeaderInformationLevantamiento';
import { useState } from 'react';
import ReportesEspecialesList from './ReportesEspecialesList';

const ModalReporteEspecial = ({ cerrarModal, modalVisible, levantamiento }) => {

    console.log("Levantamiento ModalReporteEspecial: ", levantamiento);
    const [levantamientoReporteEspecial, setLevantamientoReporteEspecial] = useState(levantamiento);
    
    return (
        <Modal
            animationType='slide'
            visible={modalVisible}
        >
            <SafeAreaView style={styles.contenido}>
                <ScrollView>
                    <View>
                        <TouchableOpacity
                            style={styles.btnCancelar}
                            onPress={() => {
                                cerrarModal();
                            }}
                        >
                            <Text style={styles.btnCancelarTexto}>X Cerrar</Text>
                        </TouchableOpacity>

                        <CardHeaderInformationLevantamiento 
                            levantamiento={levantamientoReporteEspecial} 
                            setLevantamientoReporteEspecial={setLevantamientoReporteEspecial}
                        />

                        <View style={{marginVertical:15}}>
                            {
                                <ReportesEspecialesList
                                    reportesEspeciales={levantamientoReporteEspecial.reportesEspeciales}
                                    setLevantamientoReporteEspecial={setLevantamientoReporteEspecial}
                                    levantamientoReporteEspecial={levantamientoReporteEspecial}
                                />
                            }
                        </View>

                    </View>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    contenido: {
        backgroundColor: grayElm,
        flex: 1,
    },
    titulo: {
        fontSize: 25,
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
})

export default ModalReporteEspecial
