import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Levantamiento from './Levantamiento';
import uuid from 'react-native-uuid';

const LevantamientosList = ({ levantamientos }) => {

    return (
        <>
            {
                (levantamientos.length !== 0)
                    ?
                    levantamientos.map((levantamiento) => {
                        return (<Levantamiento
                            key={uuid.v4()}
                            levantamiento={levantamiento}
                        />)
                    })
                    :
                    <View>
                        <Text style={styles.noListLevantamientos}>
                            No hay levantamientos creados
                        </Text>
                    </View>
            }
        </>
    )
}

const styles = StyleSheet.create({
    noListLevantamientos: {
      marginTop: 40,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: '600',
      color: 'white',
      marginHorizontal:10
    },
  });

export default LevantamientosList