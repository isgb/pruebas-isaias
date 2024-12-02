import React from 'react'
import { View,ImageBackground } from 'react-native'
import { grayElm } from './Constants'

const Background = ({children}) => {
  return (
    <View>

      <ImageBackground 
          // source={require("./assets/leaves.jpg")}
          // source={require("../../assets/fondo_ajuech.jpeg")} 
          style={{ height: '100%' , backgroundColor: grayElm}}> 

        <View>
          {children}
        </View>

      </ImageBackground>

    </View>
  )
}

export default Background