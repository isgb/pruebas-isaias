import React from 'react'
import { StyleSheet, View } from 'react-native'
import ButtonElm from '../ButtonElm'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { whiteELm } from '../Login/Constants'
import { faImage } from '@fortawesome/free-solid-svg-icons/faImage'
import { faCameraRetro } from '@fortawesome/free-solid-svg-icons'

const CamaraButtons = ({ requestPermissions, handleSelectMultipleImages }) => {
    return (
        <>
            <View style={styles.containerButtons}>
                <ButtonElm
                    handleFunction={() => requestPermissions()}
                    iconText={<FontAwesomeIcon style={{ color: whiteELm }} icon={faCameraRetro} />}
                    width={168}
                    height={50}
                    labeltext='Foto'
                    buttonStyle={styles.containerBtn}
                />

                <ButtonElm
                    handleFunction={() => handleSelectMultipleImages()}
                    iconText={<FontAwesomeIcon style={{ color: whiteELm }} icon={faImage} />}
                    width={168}
                    height={50}
                    labeltext='Imagen'
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
        marginHorizontal: 6,
        marginVertical: 5
    },
})

export default CamaraButtons