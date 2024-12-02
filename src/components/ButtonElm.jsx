import React from 'react'
import { StyleSheet, View } from 'react-native'
import Btn from './Login/Btn'
import { orangeElm } from './Login/Constants'

const ButtonElm = ({ handleFunction = null, 
                    labeltext = null, 
                    iconText = null,
                    width = null,
                    height= null,
                    buttonStyle = null,
                    disabled = false  
}) => {
    return (
        <View>
            <Btn
                textColor='white'
                bgColor='#fb541d'
                btnLabel={(labeltext !== null) ? labeltext : null}
                Press={() => { handleFunction() }}
                btnIcon={iconText}
                width = {width}
                height = {height}
                styles={buttonStyle}
                disabled={disabled}
            />
        </View>
    )
}

export default ButtonElm