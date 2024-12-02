import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
import ReporteEspecialForm from './ReporteEspecialForm'
import useModalFormVisible from '../../hooks/ReportesEspeciales/useModalFormVisible'

const CardHeaderInformationLevantamiento = ({ levantamiento, 
                                              setLevantamientoReporteEspecial, 
                                            }) => 
{

    const { cliente, sucursal } = levantamiento;
    const { modalFormVisible, abrirModalForm, cerrarModalForm } = useModalFormVisible();

    return (
        <View>
            <View style={styles.contenidoInformacion} >

                {
                   levantamiento.estado < 2 && (
                    <View style={{
                        flexDirection: "row",
                        justifyContent: 'space-between',
                    }}>
                        <Text style={styles.labelInformacion}>Agregar Reporte:</Text>
                        <TouchableOpacity
                            onPress={() => { 
                                abrirModalForm() 
                            }}
                            style={{
                                padding: 12,
                                backgroundColor: '#334155',
                                borderRadius: 50,
                                marginHorizontal: 5,
                            }}
                        >
                            <FontAwesomeIcon
                                icon={faPlus}
                                size={15}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>
                   ) 
                }

                <View style={styles.campoInformacion}>
                    <Text style={styles.labelInformacion}>Cliente:</Text>
                    <Text style={styles.valorInformacion}>{cliente}</Text>
                </View>

                <View style={styles.campoInformacion}>
                    <Text style={styles.labelInformacion}>Sucursal:</Text>
                    <Text style={styles.valorInformacion}>{sucursal}</Text>
                </View>
            </View>

            {modalFormVisible && (
                <ReporteEspecialForm
                    modalVisible={modalFormVisible}
                    cerrarModal={cerrarModalForm}
                    levantamiento={levantamiento}
                    setLevantamientoReporteEspecial={setLevantamientoReporteEspecial}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    contenidoInformacion: {
        backgroundColor: '#feebe5',
        marginHorizontal: 30,
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    campoInformacion: {
        marginBottom: 10
    },
    labelInformacion: {
        textTransform: 'uppercase',
        color: '#374151',
        fontWeight: '600',
        fontSize: 12
    },
    valorInformacion: {
        fontWeight: '700',
        fontSize: 20,
        color: '#334155'
    }
})

export default CardHeaderInformationLevantamiento