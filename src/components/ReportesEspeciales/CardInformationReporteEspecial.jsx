import React from 'react'
import { formatearFechaHora } from '../../helpers'
import {
    Text,
    StyleSheet,
    View,
    TouchableOpacity,
    Alert,
}
    from 'react-native'
import ReporteEspecialForm from './ReporteEspecialForm'
import { green } from '../Login/Constants'
import { updateEstadoreporteEspecialRequest } from '../../api/reportesEspeciales'
import useModalFormVisible from '../../hooks/ReportesEspeciales/useModalFormVisible'
import { getLevantamientosListLocalStorage, guardarLevantamientosLocalStorage } from '../../helpers/levantamientos'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CardInformationReporteEspecial = ({
    reporteEspecial = null,
    setLevantamientoReporteEspecial,
    levantamientoReporteEspecial
}) => {

    const { modalFormVisible, abrirModalForm, cerrarModalForm } = useModalFormVisible();

    const editarReporteEspecial = () => {
        abrirModalForm(reporteEspecial)
    }

    const borrarReporteEspecial = () => {
        Alert.alert(
            'Eliminar',
            '¿Estas seguro de eliminar este reporte?',
            [{
                text: 'Si', onPress: async () => {

                    try {
                        // Actualizar estado del reporte

                        const reporte = {
                            ...reporteEspecial,
                            estado: 2
                        };

                        console.log("Reporte a actualizar estado: ", reporte);

                        const token = await AsyncStorage.getItem('token');
                        const formData = new FormData();

                        formData.append('id', reporte.id);
                        formData.append('levantamiento_id', reporte.levantamiento_id);
                        formData.append('fecha', reporte.fecha);
                        formData.append('personal_id', reporte.personal_id);
                        formData.append('titulo', reporte.titulo);
                        formData.append('tipo_incidente_id', reporte.tipo_incidente_id);
                        formData.append('numero_reporte', reporte.numero_reporte);
                        formData.append('fecha_ocurrio', reporte.fecha_ocurrio);
                        formData.append('descripcion', reporte.descripcion);
                        formData.append('token', token);
                        formData.append('estado', reporte.estado);

                        const resp = await updateEstadoreporteEspecialRequest(formData);
                        console.log("Respuesta del servidor:", resp);

                        if (resp.status === 200) {

                            Alert.alert('Reporte eliminado', 'El reporte se eliminó correctamente');
                            console.log("Reporte guardado correctamente: ", resp);

                            try {

                                const newLevantamiento = {
                                    ...levantamientoReporteEspecial,
                                    reportesEspeciales: levantamientoReporteEspecial.reportesEspeciales.map(
                                        (reporte) => reporte.id === reporteEspecial.id ? { ...reporte, estado: 2 } : reporte
                                    )
                                }

                                console.log("Levantamiento actualizado: ", newLevantamiento);

                                const levantamientosData = await getLevantamientosListLocalStorage();
                                const levantamientosActualizados = levantamientosData.map(
                                    (levantamiento) => (levantamiento.id === newLevantamiento.id ? newLevantamiento : levantamiento)
                                );

                                await guardarLevantamientosLocalStorage(levantamientosActualizados);
                                setLevantamientoReporteEspecial(newLevantamiento);

                            } catch (error) {
                                console.log("error guardarLevantamientosLocalStorage", error);
                            }

                        }
                        else {
                            Alert.alert('Error', 'No se pudo borrar el reporte. Por favor, inténtelo de nuevo.');
                        }

                    } catch (error) {
                        console.log("Error al Actualizar estado del reporte: ", error);
                        Alert.alert('Error', 'No se pudo borrar el reporte. Por favor, inténtelo de nuevo.');
                    }

                }
            }, { text: 'No' }
            ])
    }

    return (
        <>
            <View style={styles.contenidoInformacion} >

                <View style={styles.campoInformacion}>
                    <Text style={styles.labelInformacion}>Titulo:</Text>
                    <Text style={styles.valorInformacion}>{reporteEspecial.titulo}</Text>
                </View>

                <View style={styles.campoInformacion}>
                    <Text style={styles.labelInformacion}>Fecha de ocurrio:</Text>
                    <Text style={styles.valorInformacion}>{formatearFechaHora(reporteEspecial.fecha_ocurrio)}</Text>
                </View>

                <View style={{ ...styles.campoInformacion, flexDirection: 'row', justifyContent: 'space-between' }}>

                    <TouchableOpacity
                        onPress={() => { editarReporteEspecial() }}
                        style={{
                            padding: 12,
                            backgroundColor: green,
                            borderRadius: 15,
                            marginHorizontal: 5,
                        }}
                    >
                        <Text style={{
                            ...styles.textoBoton,
                            ...styles.labelInformacion,
                            color: "white"
                        }}>
                            {levantamientoReporteEspecial.estado < 2 
                                ? 'Editar' 
                                : 'Ver Reporte'}
                        </Text>
                    </TouchableOpacity>

                    {
                        levantamientoReporteEspecial.estado < 2 && (
                            <TouchableOpacity
                                onPress={() => { borrarReporteEspecial() }}
                                style={{
                                    padding: 12,
                                    backgroundColor: 'red',
                                    borderRadius: 15,
                                    marginHorizontal: 5,
                                }}
                            >
                                <Text style={{
                                    ...styles.textoBoton,
                                    ...styles.labelInformacion,
                                    color: "white"
                                }}>Borrar</Text>
                            </TouchableOpacity>
                        )
                    }

                </View>

                {modalFormVisible && (
                    <ReporteEspecialForm
                        modalVisible={modalFormVisible}
                        cerrarModal={cerrarModalForm}
                        levantamiento={levantamientoReporteEspecial}
                        setLevantamientoReporteEspecial={setLevantamientoReporteEspecial}
                        reporteEspecial={reporteEspecial}
                    />
                )}

            </View>
        </>
    )
}

const styles = StyleSheet.create({
    contenidoInformacion: {
        backgroundColor: '#feebe5',
        marginHorizontal: 30,
        marginBottom: 10,
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

export default CardInformationReporteEspecial