import React, { useContext } from 'react'
import { Modal, View, Alert, StyleSheet, Pressable, Text, } from 'react-native';
import { DataContext } from '../context/DataContext';
import { blackElm, orangeElm } from './Login/Constants';

const ModalSinConexion = () => {

    const {
        modalIsDisconnected,
        setModalIsDisconnected
    } = useContext(DataContext)

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalIsDisconnected}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalIsDisconnected(!modalIsDisconnected);
                }}>
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>

                        <Text style={styles.modalText}>SIN CONEXIÓN</Text>
                        <Text style={styles.modalText}>No hay conexión a Internet. Ante cualquier duda, comunicate con el servidor.</Text>

                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalIsDisconnected(!modalIsDisconnected)}>
                            <Text style={styles.textStyle}>OK</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    )
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        paddingVertical: 40,
        paddingHorizontal: 5,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 50,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: '900',
        color: blackElm
    },
    button: {
        backgroundColor: orangeElm,
        borderRadius: 10,
        alignSelf: 'center',
        width: 300,
        height: 50,
        paddingVertical: 5,
        marginVertical: 10
    },
    buttonClose: {
        backgroundColor: 'red',
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
})

export default ModalSinConexion