import { View, Text, Image } from 'react-native';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Field from './Field';
import { useAuth } from '../../context/AuthContext';
import LoginButton from '../Custom/LoginButton';
import Style from '../../styles/Style';
import Spinner from 'react-native-loading-spinner-overlay';
import { APP_VERSIONS,APP_ENV } from '@env';
import checkForUpdate from '../CheckForUpdate/checkForUpdate';

const Login = (props) => {

    const { register,
        handleSubmit,
        control,
        formState: { errors }
    } = useForm({});

    const { signin, errors: signinErrors, isAuthenticated, spinnerAuth } = useAuth();
    
    // Actualiza la aplicación si hay una nueva versión
    useEffect(() => { 
        checkForUpdate(); 
    }, []);

    useEffect(() => {
        console.log("isAuthenticated", isAuthenticated)
        if (isAuthenticated) props.navigation.navigate("CheckInPage");
    }, [isAuthenticated])

    const onSubmit = (data) => {
        signin(data)
    };

    return (
        <View style={Style.containerLogin}>

            {/* Logo de la aplicación */}
            <View>
                <Image
                    style={Style.logoLogin}
                    source={require('../../assets/logoElm.png')}
                />
            </View>

            {/* Spinner de carga */}
            <View>
                <Spinner
                    visible={spinnerAuth}
                    textContent={'Cargando...'}
                    textStyle={Style.spinnerLogin}
                />

            </View>

            {/* Texto de Bienvenida */}
            <View>
                <Text style={Style.titleLogin}>Bienvenido</Text>
                <Text style={Style.subTitleLogin}>Accede a tu cuenta</Text>
            </View>

            {/* Campos de texto para ingresar email y contraseña */}
            <View style={Style.containerInputLogin}>

                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Field
                            placeholder="Email / Usuario"
                            keyboardType={"email-address"}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                    name="email"
                    rules={{ required: true }}
                />

                <Controller
                    control={control}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <Field
                            placeholder="Contraseña"
                            secureTextEntry={true}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                        />
                    )}
                    name="password"
                    rules={{ required: true }}
                />
            </View>

            {/* Botón para ingresar a la aplicación */}
            <LoginButton
                onPress={handleSubmit(onSubmit)}
            />

            <Text style={Style.versionLogin}>v{APP_VERSIONS} {APP_ENV === 'dev' ? '| DEV' : ''}</Text>
           
        </View>
    )
}

export default Login;