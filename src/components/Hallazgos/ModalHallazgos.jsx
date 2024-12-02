import {
    Modal,
    SafeAreaView,
    View,
    ActivityIndicator,
} from 'react-native'
import { orangeElm } from '../Login/Constants'
import HallazgosList from './HallazgosList';
import { useContext, useEffect, useState } from 'react';
import { DataHallazgosContext } from '../../context/DataHallazgosContext';
import { HallazgoFormProvider } from '../../context/HallazgosFormContext';
import Style from '../../styles/Style';
import CustomButton from '../Custom/CustomButton';
import { faCircleChevronLeft } from '@fortawesome/free-solid-svg-icons';

const ModalHallazgos = ({
    cerrarModal,
    modalVisible,
    hallazgos,
    levantamiento,
    typeAuditoria,
    isScanner = false,
    navigation = null
}) => {

    const { isLoading, setIsLoading, recargarHallazgos, setRecargarHallazgos } = useContext(DataHallazgosContext);
    const [enviandoDatos] = useState(false);

    const returnToListaLevantamientos = () => {
        try {
            navigation.navigate("CheckInPage")
        } catch (error) {
            console.log("ModalHallazgos", error);
        }
    }

    const auditoria = hallazgos.find(auditoria => Object.keys(auditoria)[0] === typeAuditoria) || {};
    const auditoriaTitle = Object.keys(auditoria)[0];
    const auditoriaValue = auditoria[auditoriaTitle];

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 200);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Modal
            animationType='slide'
            visible={modalVisible}
        >
            <SafeAreaView style={Style.containerModal}>

                <View style={[Style.alignCenter, Style.marginBottom20]}>
                    <CustomButton
                        title='Salir de Levantamiento'
                        type='cancel'
                        icon={faCircleChevronLeft}
                        widthButton='90%'
                        onPress={() => {
                            cerrarModal();
                            setRecargarHallazgos(!recargarHallazgos);
                            if (isScanner) {
                                returnToListaLevantamientos();
                            }
                        }}
                    />
                </View>

                <HallazgoFormProvider>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={orangeElm} />
                    ) : (
                        <HallazgosList
                            auditoria={typeAuditoria}
                            hallazgos={auditoriaValue}
                            levantamiento={levantamiento}
                        />
                    )}
                </HallazgoFormProvider>
            </SafeAreaView>
        </Modal>
    )
}

export default ModalHallazgos;