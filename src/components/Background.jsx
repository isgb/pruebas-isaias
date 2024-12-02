import React from 'react'
import { View,ImageBackground, StyleSheet } from 'react-native'

const Background = ({children}) => {
  return (
      <ImageBackground 
          source={require("../assets/fondo_ajuech.jpeg")}
          style={styles.logo}
          resizeMode='cover'
      > 
      
        <View>
          {children}
        </View>

      </ImageBackground>
  )
}


const styles = StyleSheet.create({
  logo: {
   flex: 1
  },
});

export default Background