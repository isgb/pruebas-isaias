import { useEffect } from 'react'
import { View } from 'react-native'
import { useHallazgo } from '../../context/HallazgosFormContext';
import HallazgoFamily from './HallazgoFamily';
import Style from '../../styles/Style';

/** Componente encargado de mostrar la vista de los hallazgos.
 * @param {Object} hallazgo - Objeto que contiene la información del hallazgo.
 */
const Hallazgo = () => {

    const { listHallazgos, levantamiento, setEstadoLevantamiento } = useHallazgo();

    useEffect(() => {
        const nuevoEstado = levantamiento.estado === 1;
        setEstadoLevantamiento(nuevoEstado);
    }, [levantamiento]);

    return (
        <>
            <View style={Style.borderBottomStyle}>
                <HallazgoFamily FamiliasHallazgos={listHallazgos} />
            </View>
        </>
    )
}

export default Hallazgo;