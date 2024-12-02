import { View, Text, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import Style from '../../../styles/Style'
import InputStyle from '../../../styles/InputStyle'
import { Picker } from '@react-native-picker/picker'
import selectStyle from '../../../styles/SelectStyles'
import { useHallazgo } from '../../../context/HallazgosFormContext'

const CamposAdicionalesInputs = ({
    item,
    index,
    handleInputChange,
    handleBlur
}) => {

    const {
        levantamiento: { estado: estadoLevantamiento },
    } = useHallazgo();

    const [isFocused, setIsFocused] = useState(false);
    const [previousValue, setPreviousValue] = useState(item.valor);

    useEffect(() => {
        if (!isFocused && previousValue !== item.valor) {
            handleBlur(item, 'camposAdicionales', true);
            setPreviousValue(item.valor);
        }
    }, [isFocused]);

    return (
        <>
            <View style={Style.flexDirection} key={index}>
                <View style={Style.width100}>
                    <Text style={InputStyle.labelInput}>
                        {item.nombre}
                    </Text>

                    {/* Si el campo es de tipo 1, mostrar un TextInput */}
                    {item.tipo === 1
                        ? (
                            // Si el estado del levantamiento es 1, mostrar el campo
                            (estadoLevantamiento === 1)
                                ? <TextInput
                                    style={InputStyle.input}
                                    name={item.nombre}
                                    keyboardType={item.sumar ? 'numeric' : 'default'}
                                    placeholder={item.nombre}
                                    placeholderTextColor={'#666'}
                                    value={item.valor || ''}
                                    onChangeText={(value) => {
                                        const newItem = { ...item, id: item.id, valor: value  };
                                        handleInputChange(newItem, 'camposAdicionales', true);
                                    }}
                                    onBlur={() => handleBlur(item, 'camposAdicionales', true)}
                                />
                                :
                                // Si el estado del levantamiento es 2, mostrar el valor del campo
                                <Text style={InputStyle.input}>
                                    {item.valor}
                                </Text>
                        )
                        : null
                    }

                    {/* Si el campo es de tipo 2, mostrar un Picker */}
                    {item.tipo === 2
                        ? (
                            // Si el estado del levantamiento es 1, mostrar el campo
                            (estadoLevantamiento === 1)
                                ? <Picker
                                    style={selectStyle.select}
                                    selectedValue={item.valor || ''}
                                    onValueChange={(itemValue) => {
                                        const newItem = { ...item, id: item.id, valor: itemValue };
                                        handleInputChange(newItem, 'camposAdicionales', true);
                                        setIsFocused(false); // Simula el evento onBlur
                                    }}
                                    onFocus={() => setIsFocused(true)} // Simula el evento onFocus
                                >
                                    {/* Recorrer las opciones y mostrarlas en el Picker */}
                                    {Object.entries(item.opciones || {}).map(([key, value]) => (
                                        <Picker.Item key={key} label={value} value={key} />
                                    ))}
                                </Picker>
                                : <Text style={InputStyle.input}>
                                    {/* Recorrer las opciones y mostrarlas en el valor que se selecciono */}
                                    {/* Si el estado del levantamiento es 2, mostrar el valor del campo */}
                                    {Object.entries(item.opciones || {}).map(([key, value]) => (
                                        key === item.valor && <Text key={key}>{value}</Text>
                                    ))}
                                </Text>
                        )
                        : null
                    }
                </View>
            </View>
        </>
    )
}

export default CamposAdicionalesInputs;