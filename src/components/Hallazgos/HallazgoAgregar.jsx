import { View } from 'react-native'
import React from 'react'
import CustomButton from '../Custom/CustomButton'
import Style from '../../styles/Style';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons/faCirclePlus';
import { useHallazgo } from '../../context/HallazgosFormContext';

/** Componente que renderiza un botón para duplicar el hallazgo de la lista de hallazgos.
 * @param {*} hallazgo Información sobre el hallazgo que se desea duplicar. 
 */
const HallazgoAgregar = ({
    familiaForm,
    grupoHallazgo,
    hallazgo
}) => {

    const { addHallazgo } = useHallazgo();

    return (
        <View style={Style.width50}>

            <CustomButton
                title="Agregar"
                onPress={
                    () => { addHallazgo(familiaForm, grupoHallazgo, hallazgo) }
                }
                type="elm"
                widthButton="100%"
                marginTop={10}
                icon={faCirclePlus}
            />
        </View>
    )
}

export default HallazgoAgregar;