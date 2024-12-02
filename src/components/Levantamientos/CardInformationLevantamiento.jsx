import React, { useContext, useState } from 'react'
import { formatearFecha } from '../../helpers'

import {
    Modal,
    Text,
    StyleSheet,
    View,
    TouchableOpacity,
}
    from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import ModalReporteEspecial from '../ReportesEspeciales/ModalReporteEspecial'
import { faFileLines } from '@fortawesome/free-solid-svg-icons/faFileLines'
import { useHallazgo } from '../../context/HallazgosFormContext'
import Style from '../../styles/Style'

const CardInformationLevantamiento = () => {

    const { typeAuditoria, levantamiento } = useHallazgo();

    const [modalReporteEspecialVisible, setModalReporteEspecialVisible] = useState(false)
    const [datalevantamientoToReporteEspecial, setDatalevantamientoToReporteEspecial] = useState(levantamiento)

    const cerrarModal = () => {
        setModalReporteEspecialVisible(false);
    }

    const abrirModal = () => {
        setModalReporteEspecialVisible(true);
    }

    return (
        <>
            <View style={Style.containerInformationLevantamiento} >

                <View style={{
                    flexDirection: "row",
                    justifyContent: 'space-between',
                }}>
                    <Text style={Style.labelLevantamiento}>Ver Reporte(s) Especial(es):</Text>
                    <TouchableOpacity
                        onPress={() => { abrirModal() }}
                        style={{
                            padding: 12,
                            backgroundColor: '#334155',
                            borderRadius: 50,
                            marginHorizontal: 5,
                        }}
                    >
                        <FontAwesomeIcon
                            icon={faFileLines}
                            size={15}
                            color="white"
                        />
                    </TouchableOpacity>
                </View>

                <View style={Style.marginBottom10}>
                    <Text style={Style.labelLevantamiento}>Auditoria:</Text>
                    <Text style={Style.valueLevantamiento}>{typeAuditoria}</Text>
                </View>

                <View style={Style.marginBottom10}>
                    <Text style={Style.labelLevantamiento}>Levantamiento:</Text>
                    <Text style={Style.valueLevantamiento}>{levantamiento.id}</Text>
                </View>

                <View style={Style.marginBottom10}>
                    <Text style={Style.labelLevantamiento}>Fecha:</Text>
                    <Text style={Style.valueLevantamiento}>{formatearFecha(levantamiento.fecha)}</Text>
                </View>

                <View style={Style.marginBottom10}>
                    <Text style={Style.labelLevantamiento}>Cliente:</Text>
                    <Text style={Style.valueLevantamiento}>{levantamiento.cliente}</Text>
                </View>

                <View style={Style.marginBottom10}>
                    <Text style={Style.labelLevantamiento}>Sucursal:</Text>
                    <Text style={Style.valueLevantamiento}>{levantamiento.sucursal}</Text>
                </View>

                {modalReporteEspecialVisible && (
                    <ModalReporteEspecial
                        modalVisible={modalReporteEspecialVisible}
                        cerrarModal={cerrarModal}
                        levantamiento={levantamiento}
                    />
                )}

            </View>
        </>
    )
}

export default CardInformationLevantamiento;