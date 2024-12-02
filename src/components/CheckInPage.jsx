import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Image,
} from 'react-native'
import React, { useContext } from 'react';
import { useAuth } from '../context/AuthContext';
import { grayElm, orangeElm } from './Login/Constants';
import { DataContext } from '../context/DataContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCircleDot } from '@fortawesome/free-solid-svg-icons/faCircleDot';
import ModalSinConexion from './ModalSinConexion';
import Spinner from 'react-native-loading-spinner-overlay';
import { SendDataToBDContext } from '../context/SendDataToBDContext';
import LevantamientosList from './Levantamientos/LevantamientosList';
import CustomButton from './Custom/CustomButton';
import { faArrowRightFromBracket, faQrcode } from '@fortawesome/free-solid-svg-icons';

const CheckInPage = (props) => {

    const {
        isOnline,
        levantamientos,
        estadoScanner,
    } = useContext(DataContext);

    const {
        spinner
    } = useContext(SendDataToBDContext)

    const { logout, spinnerAuth } = useAuth();

    return (
        <SafeAreaView style={styles.container}>

            <Spinner
                visible={spinner}
                textContent={'Enviando datos locales, espero un momento...'}
                textStyle={styles.spinnerTextStyle}
            />

            <Spinner
                visible={spinnerAuth}
                textContent={'Cerrando sesión...'}
                textStyle={styles.spinnerTextStyle}
            />

            <ScrollView>

                <View>
                    <View style={styles.containerLogo}>
                        <Image
                            style={styles.logo}
                            source={require('../assets/logoElm.png')}
                        />
                    </View>
                </View>

                <View style={styles.containerFirstHeader}>
                    {(!isOnline)
                        ? <Text style={styles.textIsConnected}>
                            DESCONECTADO <FontAwesomeIcon style={{ color: "red", marginRight: 10 }} icon={faCircleDot} />
                        </Text>
                        : <Text style={styles.textIsConnected}>
                            CONECTADO <FontAwesomeIcon style={{ color: "green", marginRight: 10 }} icon={faCircleDot} />
                        </Text>
                    }
                </View>

                {/* ********************************* */}

                <LevantamientosList
                    levantamientos={levantamientos}
                />

                {/* ********************************* */}

                <View>
                    <ModalSinConexion />
                </View>

            </ScrollView>


            <View style={{ alignItems: 'center', marginBottom: 20 }}>

                {estadoScanner === true &&
                    <CustomButton
                        title='Escanear Código QR'
                        onPress={() => { props.navigation.navigate("ScannerQr") }}
                        type='elm'
                        icon={faQrcode}
                    />
                }

                <CustomButton
                    title='Cerrar Sesión'
                    onPress={() => { logout(props); }}
                    type='elm'
                    icon={faArrowRightFromBracket}
                />
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: grayElm,
        flex: 1,
    },

    containerFirstHeader: {
        marginVertical: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
    },
    textIsConnected: {
        marginLeft: 30,
        marginTop: 10,
        fontSize: 15,
        textAlign: 'center',
        color: 'white',
    },
    logo: {
        flex: 1,
        width: 180,
        height: 100,
        resizeMode: 'contain',
    },
    containerLogo: {
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titulo: {
        textAlign: 'center',
        fontSize: 20,
        color: '#374151',
        fontWeight: '600'
    },
    tituloBold: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '900',
        color: '#4F1813'
    },
    noListLevantamientos: {
        marginTop: 40,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: 'white',
        marginHorizontal: 10
    },
    main: {
        flex: 1,
        flexDirection: "row"
    },
    part1: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
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
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    contenedor: {
        backgroundColor: '#EAEBDB',
        padding: 20,
        borderBottomColor: '#94a3B8',
        borderBottomWidth: 1
    },
    focused: {
        boxShadow: '0px 0px 0px 1px blue'
    },
    pressed: {
        backgroundColor: '#bd6311'
    },
    pressedEmpezar: {
        backgroundColor: '#0e5d35'
    },
    btn: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 5
    },
    btnEmpezar: {
        backgroundColor: '#10AB5D'
    },
    contenedorBotones: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    contenedorBotonesFinal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    btnTexto: {
        textTransform: 'uppercase',
        fontWeight: '700',
        fontSize: 12,
        color: '#FFF',
    },
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
        fontWeight: '900'
    },
    buttonClose: {
        backgroundColor: 'red',
    },
    spinnerTextStyle: {
        color: '#FFF'
    },
});

export default CheckInPage