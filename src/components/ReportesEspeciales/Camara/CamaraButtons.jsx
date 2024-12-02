import React from 'react'
import { StyleSheet, View } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCamera } from '@fortawesome/free-solid-svg-icons/faCamera'
import { faImage } from '@fortawesome/free-solid-svg-icons/faImage'
import ButtonElm from '../../ButtonElm'
import { whiteELm } from '../../Login/Constants'

const CamaraButtons = ({requestPermissions,handleSelectMultipleImages}) => {
    return (
        <>
            <View style={styles.containerButtons}>
                <ButtonElm
                    handleFunction={() => requestPermissions()}
                    iconText={<FontAwesomeIcon style={{ color: whiteELm }} icon={faCamera} />}
                    width={130}
                    height={50}
                    buttonStyle={styles.containerBtn}
                />

                <ButtonElm
                    handleFunction={() => handleSelectMultipleImages()}
                    iconText={<FontAwesomeIcon style={{ color: whiteELm }} icon={faImage} />}
                    width={130}
                    height={50}
                    buttonStyle={styles.containerBtn}
                />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    containerButtons: {
        flexDirection: "row",
        justifyContent: 'space-around',
    },
    containerBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 8,
        marginVertical: 5
    },
})

export default CamaraButtons