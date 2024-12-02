import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import buttonStyle from '../../styles/ButtonStyles';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';

/** Componente que renderiza un botón personalizado para el login.
 * @param {*} onPress Función que ejecutará el botón al hacer clic en él.
 * @param {string} colorText Color que tendrá el texto del título. 
 * @param {string} widthButton Tamaño que tendrá el botón.
 */
const LoginButton = ({
    onPress
}) => {

    return (
        <TouchableOpacity
            style={buttonStyle.buttonLogin}
            onPress={onPress}
        >
            <View style={buttonStyle.buttonContainer}>
                <FontAwesomeIcon icon={faRightToBracket} style={[buttonStyle.buttonTextLogin, {marginRight: 10}]} />
                <Text style={buttonStyle.buttonTextLogin}>Iniciar Sesión</Text>
            </View>
        </TouchableOpacity>
    );
}

export default LoginButton;