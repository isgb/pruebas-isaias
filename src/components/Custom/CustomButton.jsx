import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import buttonStyle from '../../styles/ButtonStyles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { orangeElm } from '../Login/Constants';

/** Componente que renderiza un botón personalizado
 * @param {string} title Título que tendrá el botón.
 * @param {*} onPress Función que ejecutará el botón al hacer clic en él.
 * @param {string} type Fondo que tendrá el botón.
 * @param {string} colorText Color que tendrá el texto del título. 
 * @param {string} widthButton Tamaño que tendrá el botón.
 */
const CustomButton = ({ 
    title,
    onPress, 
    type,
    colorText = '#fff',
    widthButton = '80%',
    marginTop= 16,
    icon
}) => {

    /** Definición de colores según el tipo de botón */
    const colors = {
        elm       : '#fb541d',
        default   : '#007BFF',
        save      : '#28a745',
        cancel    : '#dc3545',
        update    : '#ffc107',
        print     : '#28a745',
        close     : '#dc3545',
        disconnect: '#ffc107',
        add       : '#28a745'
    }; 

    const backGround = colors[type] || colors.default;
    
    return (
        <TouchableOpacity 
            style={[buttonStyle.button, { backgroundColor: backGround, width: widthButton, marginTop: marginTop }]} 
            onPress={onPress}
        >
            <View style={buttonStyle.buttonContainer}>
                {icon && (
                        <FontAwesomeIcon icon={icon} style={{ marginRight: 8, color: colorText }} />
                )}
                <Text style={[buttonStyle.buttonText, { color: colorText }]}>{title}</Text>
            </View>
        </TouchableOpacity>
    );
}

export default CustomButton;