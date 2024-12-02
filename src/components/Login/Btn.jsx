import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

export default function Btn({ bgColor, btnLabel, textColor, Press, btnIcon = null,
    width = null, height = null, styles = null, disabled = false }) {
    return (
        <TouchableOpacity
            onPress={Press}
            disabled={disabled}
            style={{
                backgroundColor: bgColor,
                borderRadius: 10,
                alignItems: 'center',
                width: (width !== null) ? width : 300,
                height: (height !== null) ? height : null,
                marginVertical: 10,
                ...styles
            }}>
            <Text style={{
                paddingTop: 6,
                color: textColor, fontSize: 28,
                fontWeight: "bold"
            }}>
                {btnIcon !== null && btnIcon}
            </Text>
            <Text style={{
                paddingBottom: 4,
                color: textColor,
                marginTop: 6
            }}>
                {btnLabel !== null && btnLabel}
            </Text>
        </TouchableOpacity>
    )
}