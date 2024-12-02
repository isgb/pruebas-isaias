import React, { useContext, useEffect } from 'react'
import { Text, StyleSheet, View,Image } from 'react-native'
import Background from './Background'
import { darkGreen,green } from './Constants'
import Btn from './Btn'
import { useAuth } from '../../context/AuthContext'
import { DataContext } from '../../context/DataContext'
import Spinner from 'react-native-loading-spinner-overlay';

const Home = (props) => {

  // const {setSpinner,spinner} = useContext(DataContext)

  const { isAuthenticated, spinnerAuth } = useAuth();

  // useEffect(() => {
  //   if(isAuthenticated) {props.navigation.navigate("MainApp")};
  // },[isAuthenticated])

  return (
    <Background>
      <View style={{ marginHorizontal: 40, marginVertical: 100}}>

        {/* <Text style={{ color: 'white', fontSize: 64 }}>LOMBRIS APP</Text> */}
        <View style={styles.containerLogo}>
          <Image
            style={styles.logo}
            // source={require('./src/assets/logo500_anchura.png')}
            source={require('../../assets/fondo_ajuech.jpeg')}
          />
        </View>

        <Btn 
          bgColor={green} 
          textColor='white' btnLabel='Bienvenido' 
          Press={() => props.navigation.navigate("Login") }
        />

        {/* <Btn bgColor='white' textColor={darkGreen} btnLabel='Signup' Press={() => props.navigation.navigate("Signup") }/> */}
      </View>

      <Spinner
          visible={spinnerAuth}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
      />
      
    </Background>
  )
}

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF'
  },
  containerLogo: {
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    // height: 30,
  },
  logo: {
    width: 225,
    height: 60,
  },
})

export default Home;