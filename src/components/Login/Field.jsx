import { View, Text, TextInput } from 'react-native'
import React from 'react'
import { blackElm, darkBlue, orangeElm,grayElm } from './Constants'
import InputStyle from '../../styles/InputStyle'

const Field = (props) => {
    return (
        <TextInput
            {...props}
            style={InputStyle.inputLogin}
            placeholderTextColor={grayElm}>
        </TextInput>
    )
}

export default Field