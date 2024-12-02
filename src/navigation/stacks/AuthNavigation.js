import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Home from "../../components/Login/Home";
import Login from "../../components/Login/Login";
import { useContext, useEffect } from "react";
import { DataContext } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";
// import {
//     AuthStartScreen,
//     LoginScreen,
//     RegisterScreen,
// } from '../../screens/Auth';
// import { IconBack } from '../../components/Navigation'
// import { screens } from "../../utils";
// import { styles } from "../Styles.styles"

const Stack = createNativeStackNavigator();

export function AuthNavigation() {

    return (
        // <Stack.Navigator screenOptions={{
        //     ...styles.stackNavigationStyles,
        //     headerLeft: IconBack
        // }}>

        //     <Stack.Screen
        //         name={screens.auth.authStartScreen}
        //         component={AuthStartScreen}
        //         options={{ headerShown: false }}
        //     />
        //      <Stack.Screen
        //         name={screens.auth.loginScreen}
        //         component={LoginScreen}
        //         options={{ title: "Iniciar sesión" }}
        //     />
        //     <Stack.Screen
        //         name={screens.auth.registerScreen}
        //         component={RegisterScreen}
        //         options={{ title: "Registro" }}
        //     />

        // </Stack.Navigator>

        // <Stack.Navigator screenOptions={{ headerShown: false}}>
        //     <Stack.Screen 
        //         name="Home" 
        //         component={Home} 
        //     />
        //     <Stack.Screen 
        //         name="Signup" 
        //         component={Signup} 
        //     />
        //     <Stack.Screen 
        //         name="Login" 
        //         component={Login} 
        //     />
        //     <Stack.Screen 
        //         name="MainApp" 
        //         component={MainApp} 
        //     />
        // </Stack.Navigator>

        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* <Stack.Screen name="Home" component={Home} /> */}
            <Stack.Screen name="Login" component={Login} />
        </Stack.Navigator>
    )
}