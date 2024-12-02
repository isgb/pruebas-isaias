import { View, Text, TextInput } from 'react-native';
import Style from '../../styles/Style';
import InputStyle from '../../styles/InputStyle';
import React, { useState } from 'react';
import FormAdicional from './CamposAdicionales/FormAdicional';
import { useHallazgo } from '../../context/HallazgosFormContext';
import HallazgoAgregar from './HallazgoAgregar';
import CameraPhotoHallazgoSaver from '../Camara/CameraPhotoHallazgoSaver';

/** Componente que renderiza todo el formulario que se mostrará para cada hallazgo en la vista. 
 * @param {Object} dataHallazgo - Objeto que contiene la información del hallazgo.
 */
const FormInputs = ({
    familiaForm,
    grupoHallazgo,
    hallazgoForm,
    habilitarBtn = true
}) => {

    const {
        handleInput,
        cantidadRealRef,
        cantidadIdealRef,
        observacionesRef,
        levantamiento: { estado: estadoLevantamiento },
    } = useHallazgo();

    const [formInputs, setFormInputs] = useState({
        ...hallazgoForm,
        familiaForm: familiaForm,
        grupoHallazgo: grupoHallazgo
    });

    const hasSumarField = () => {
        return formInputs.camposAdicionales.some(campo => campo.sumar === 1);
    };

    const handleDelayedInput = (value, field, isCampoAdicional = false, hallazgoPrincipalId = false, hallazgoId) => {

        return new Promise(async (resolve, reject) => {
            try {
                const hallazgoUpdated = await handleInput(value, field, null, false, [], isCampoAdicional, hallazgoPrincipalId, hallazgoId, formInputs);
                resolve(hallazgoUpdated);
            } catch (error) {
                reject(error);
            }
        });
    };

    const updateFormInputs = (field, value, hallazgoId, isCamposAdicional = false, hallazgo = {}) => {
        try {
            setFormInputs(prevState => ({
                ...prevState,
                hallazgoId: hallazgoId,
                cantidadReal: hallazgo.cantidadReal,
                familiaForm: familiaForm,
                grupoHallazgo: grupoHallazgo,
                ...(isCamposAdicional
                    ? { camposAdicionales: prevState.camposAdicionales.map(item => item.id === value.id ? value : item) }
                    : { [field]: value })
            }));
        } catch (error) {
            console.error(`Error de actualización en ${field}:`, error);
        }
    };

    const handleInputChange = (value, field, isCamposAdicional = false) => {

        try {
            setFormInputs(prevState => ({
                ...prevState,
                ...(isCamposAdicional
                    ? { camposAdicionales: prevState.camposAdicionales.map(item => item.id === value.id ? value : item) }
                    : { [field]: value })
            }));
        } catch (error) {
            console.error(`Error de actualización en ${field}:`, error);
        }

    };

    const handleBlur = async (value, field, isCamposAdicional = false) => {
        if (value !== "") {

            try {
                const hallazgoUpdated = await handleDelayedInput(value, field, isCamposAdicional, formInputs.hallazgoPrincipalId, formInputs.hallazgoId);
                updateFormInputs(field, value, hallazgoUpdated.hallazgoId, isCamposAdicional, hallazgoUpdated);
            } catch (error) {
                console.error(`Error al actualizar el hallazgo en ${field}:`, error);
            }
        }
    };

    return (
        <>
            <View>
                {/* TÍTULO DE HALLAZGO */}
                <Text style={InputStyle.titleInput}>
                    {formInputs.hallazgo}
                </Text>

                <View style={Style.flexDirection}>

                    <View style={habilitarBtn ? Style.width50 : Style.width100}>

                        {/* BOTÓN PARA VISUALIZAR LAS FOTOS DEL HALLAZGO */}
                        <CameraPhotoHallazgoSaver
                            hallazgoForm={formInputs}
                            tituloNombreHallazgo={formInputs.hallazgo}
                            setFormInputs={setFormInputs}
                        />
                    </View>

                    {/* BOTÓN PARA AGREGAR EL HALLAZGO ADICIONAL */}
                    {(habilitarBtn) &&
                        <HallazgoAgregar
                            familiaForm={familiaForm}
                            grupoHallazgo={grupoHallazgo}
                            hallazgo={formInputs}
                        />
                    }
                </View>
            </View>

            {/* ================================= */}
            {/* CANTIDAD IDEAL Y REAL DE HALLAZGO */}
            {/* ================================= */}
            <View>
                <Text style={InputStyle.titleInput}>Cantidad</Text>

                <View style={Style.flexDirection}>
                    <View style={Style.width50}>

                        <Text style={[InputStyle.labelInput, Style.textCenter]}>
                            Real
                        </Text>

                        {
                            (estadoLevantamiento === 1)

                                ? <TextInput
                                    style={[InputStyle.input , hasSumarField() && { backgroundColor: '#ddd' }]}
                                    name="cantidadReal"
                                    keyboardType='numeric'
                                    placeholder='Cantidad Real'
                                    placeholderTextColor={'#666'}
                                    ref={cantidadRealRef}
                                    value={formInputs.cantidadReal}
                                    onChangeText={(value) => handleInputChange(value, 'cantidadReal', false)}
                                    onBlur={() => handleBlur(formInputs.cantidadReal, 'cantidadReal', false)}
                                    editable={!hasSumarField()}
                                    maxLength={10}
                                />

                                : <Text style={InputStyle.input}>
                                    {hallazgoForm.cantidadReal}
                                </Text>
                        }

                    </View>

                    <View style={Style.width50}>

                        <Text style={[InputStyle.labelInput, Style.textCenter]}>
                            Ideal
                        </Text>

                        {
                            (estadoLevantamiento === 1)
                                ? <TextInput
                                    style={InputStyle.input}
                                    name="cantidadIdeal"
                                    keyboardType='numeric'
                                    placeholder='Cantidad Ideal'
                                    placeholderTextColor={'#666'}
                                    ref={cantidadIdealRef}
                                    value={formInputs.cantidadIdeal}
                                    onChangeText={(value) => handleInputChange(value, 'cantidadIdeal', false)}
                                    onBlur={() => handleBlur(formInputs.cantidadIdeal, 'cantidadIdeal', false)}
                                    maxLength={10}
                                />

                                : <Text style={InputStyle.input}>
                                    {hallazgoForm.cantidadIdeal}
                                </Text>
                        }

                    </View>
                </View>
            </View>

            {/* FORMULARIO ADICIONAL PARA BIOSSMANN */}
            {(formInputs.camposAdicionales.length > 0) &&
                <FormAdicional
                    hallazgoForm={formInputs}
                    setFormInputs={setFormInputs}
                    camposAdicionales={formInputs.camposAdicionales}
                    handleDelayedInput={handleDelayedInput}
                    handleInputChange={handleInputChange}
                    handleBlur={handleBlur}
                />
            }

            {/* ================================= */}
            {/* ========= OBSERVACIONES  ======== */}
            {/* ================================= */}
            <View>
                <Text style={InputStyle.labelInput}>
                    Observaciones
                </Text>
                {
                    (estadoLevantamiento === 1)

                        ? <TextInput
                            style={[InputStyle.input, Style.marginBottom30]}
                            name="observaciones"
                            placeholder='Observaciones'
                            placeholderTextColor={'#666'}
                            ref={observacionesRef}
                            multiline={true}
                            numberOfLines={4}
                            value={formInputs.observaciones}
                            onChangeText={(value) => handleInputChange(value, 'observaciones')}
                            onBlur={() => handleBlur(formInputs.observaciones, 'observaciones')}
                        />

                        : <Text style={[InputStyle.input, InputStyle.inputTextArea]}>
                            {hallazgoForm.observaciones}
                        </Text>
                }
            </View>
        </>
    );
}

export default FormInputs;