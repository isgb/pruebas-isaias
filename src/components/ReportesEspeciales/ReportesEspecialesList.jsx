import { memo } from 'react'
import CardInformationReporteEspecial from './CardInformationReporteEspecial'
import { Text } from 'react-native-svg'
import { StyleSheet } from 'react-native'

const ReportesEspecialesList = ({
    reportesEspeciales,
    setLevantamientoReporteEspecial,
    levantamientoReporteEspecial
}) => {

    return (
        <>
            {
                reportesEspeciales.length > 0
                    ? reportesEspeciales.map((reporteEspecial, index) => (
                        reporteEspecial.estado !== 2 &&
                        <CardInformationReporteEspecial
                            reporteEspecial={reporteEspecial}
                            setLevantamientoReporteEspecial={setLevantamientoReporteEspecial}
                            levantamientoReporteEspecial={levantamientoReporteEspecial}
                            key={index}
                        />
                    ))
                    : <Text style={{ ...styles.label, textAlign: 'center' }}>
                        No hay reportes especiales
                    </Text>
            }
        </>

    )
}

const styles = StyleSheet.create({
    label: {
        color: '#FFF',
        marginBottom: 10,
        marginTop: 15,
        fontSize: 20,
        fontWeight: '600'
    },
})

export default memo(ReportesEspecialesList)