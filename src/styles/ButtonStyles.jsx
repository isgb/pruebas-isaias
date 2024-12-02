import { StyleSheet } from "react-native";
import { orange } from "../components/Login/Constants";

/** Diseño de los botones personalizados */
const buttonStyle = StyleSheet.create({
    buttonLogin: { 
        width: '60%',
        backgroundColor: orange,
        paddingVertical: 16, 
        borderRadius: 30, 
        alignItems: 'center',
    }, 
    buttonTextLogin: {
        fontSize: 21,
        color: '#fff',
    },
    button: { 
        paddingVertical: 12, 
        borderRadius: 8, 
        alignItems: 'center',
    }, 
    buttonContainer: {
        flexDirection: 'row', 
        alignItems: 'center'
    },
    buttonText: {
        fontSize: 18,
    },
});

export default buttonStyle;