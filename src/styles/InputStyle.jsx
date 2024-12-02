import React from 'react'
import { StyleSheet } from 'react-native'
import { blackElm, green, orange } from '../components/Login/Constants';

const InputStyle = StyleSheet.create({
    inputLogin:{ 
        borderRadius: 30,
        color: '#000000',
        paddingHorizontal: 15,
        paddingVertical: 15,
        width:'82%',
        marginVertical: 10,
        borderWidth: 2,
        borderColor: orange,
    },
    titleFamily: {
        backgroundColor: green,
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingVertical: 10,
        marginTop: 10,
    },
    titleInput: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
    },
    labelInput: {
        color: '#fff',
        marginVertical: 10,
        fontSize: 20,
        fontWeight: '600'
    },
    input: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginVertical: 3,
        color: blackElm
    },
    // PROVISIONALES VERIFICAR SI SE UTILIZAN SI NO, SE ELIMINARÁN 
    campo: {
        marginVertical: 11,
        marginHorizontal: 30,
    },
    borderBottomStyle: {
        paddingBottom: 20,
        borderBottomColor: "#94a3B8",
        borderBottomWidth: 2,
        borderBottomStyle: 'solid'
    },
    inputTextArea: {
        height: 'auto'
    },
});

export default InputStyle;