import React from 'react';
import { View, Text, FlatList } from 'react-native';
import InputStyle from '../../styles/InputStyle';
import Style from '../../styles/Style';
import HallazgoForm from './HallazgoForm';
import CardInformationLevantamiento from '../Levantamientos/CardInformationLevantamiento';

/** Componente encargado de mapear las familias existentes en el tipo de auditoria
 * y crea un componente HallazgoForm por cada familia.
 * @param {object} familiasHallazgos: Objeto que contiene las familias de hallazgos.
 */
const HallazgoFamily = ({ FamiliasHallazgos }) => {

    if (!FamiliasHallazgos || Object.keys(FamiliasHallazgos).length === 0)
        return <Text style={InputStyle.titleInput}>No hay familias de hallazgos disponibles.</Text>;

    const renderItem = ({ item: familia }) => {
        const dataFamilia = FamiliasHallazgos[familia];
        return (
            <View style={Style.customMargin}>
                <Text style={InputStyle.titleFamily}>{familia}</Text>
                <HallazgoForm familiaForm={familia} familias={dataFamilia} />
            </View>
        );
    };

    return (
        <FlatList
            data={Object.keys(FamiliasHallazgos)}
            keyExtractor={(item) => item}
            renderItem={renderItem}
            ListHeaderComponent={() => <CardInformationLevantamiento />}
        />
    );
};

export default HallazgoFamily;