import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { blackElm } from '../Login/Constants';
import HallazgoForm from './HallazgoForm';

const HallazgoInfo = ({ FamiliasHallazgos }) => {

  if (!FamiliasHallazgos || Object.keys(FamiliasHallazgos).length === 0)
    return <Text style={InputStyle.titleInput}>No hay familias de hallazgos disponibles.</Text>;

  const renderItem = ({ item: familia }) => {
    const dataFamilia = FamiliasHallazgos[familia];
    return (
      <View>
        <Text style={InputStyle.titleFamily}>{familia}</Text>
        <HallazgoForm familiaForm={familia} familias={dataFamilia} />
      </View>
    );
  };

  return (
    <>
      <FlatList
        data={Object.keys(FamiliasHallazgos)}
        keyExtractor={(item) => item}
        renderItem={renderItem}
      />
    </>
  )
};

export default HallazgoInfo