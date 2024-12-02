import React, { useState } from 'react'
import { Text, SafeAreaView, View, Pressable, StyleSheet } from 'react-native'
import { formatearFecha } from '../../helpers'
import CardInformationLevantamiento from './CardInformationLevantamiento';
import { darkBlue, grayElm, orangeElm } from '../Login/Constants';


const InformacionLevantamiento = ({
    // refresh, 
    levantamiento, 
    setModalRefresh }) => {

    const [disabledStyleButton, setDisabledStyleButton] = useState(false);

    return (
        <SafeAreaView
            style={styles.contenedor}
        >
            <Text style={styles.titulo}>Información del {''}
                <Text style={styles.tituloBold}>Levantamiento</Text>
            </Text>

            <View>
                <Pressable
                    style={(state) => [
                        styles.btnCerrar,
                        !disabledStyleButton && state.focused && styles.focused,
                        !disabledStyleButton && state.pressed && styles.pressed,
                        // !disabledStyleButton && state.hovered && styles.hovered,
                        // disabledStyleButton && styles.disabledStyleButton,
                    ]}
                    onPress={() => { // onLongPress
                        setModalRefresh(false)
                        // setRefresh({})
                    }}
                >
                    <Text
                        style={{...styles.btnCerrarTexto}}
                    >X Cerrar</Text>
                </Pressable>
            </View>

            <CardInformationLevantamiento
               levantamiento={levantamiento}
            />

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    contenedor: {
        // backgroundColor: '#B5B18E',
        backgroundColor: grayElm,
        flex: 1
    },
    titulo: {
        fontSize: 30,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 30,
        color: '#FFF'
    },
    tituloBold: {
        fontWeight: '900'
    },
    btnCerrar: {
        marginVertical: 30,
        backgroundColor: orangeElm,
        marginHorizontal: 30,
        padding: 15,
        borderRadius: 10,
    },
    btnCerrarTexto: {
        color: '#FFF',
        textAlign: 'center',
        fontWeight: '900',
        fontSize: 16,
        textTransform: 'uppercase',
    },
    focused: {
        boxShadow: '0px 0px 0px 1px blue'
    },
    pressed: {
        backgroundColor: '#4b1f02'
    },
    contenido: {
        // backgroundColor: '#FFF',
        backgroundColor: '#fff3cd',
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
    campo: {
        marginBottom: 10
    },
    label: {
        textTransform: 'uppercase',
        color: '#374151',
        fontWeight: '600',
        fontSize: 12
    },
    valor: {
        fontWeight: '700',
        fontSize: 20,
        color: '#334155'
    }
})

export default InformacionLevantamiento
