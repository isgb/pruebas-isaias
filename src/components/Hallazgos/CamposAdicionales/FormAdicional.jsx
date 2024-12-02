import { FlatList } from 'react-native'
import React from 'react'
import CamposAdicionalesInputs from './CamposAdicionalesInputs'

/** Componente que renderiza todos los campos adicionales que tendrán los hallazgos.
 * @param {Array} camposAdicionales - Campos adicionales que se mostrarán en el formulario.
 */
const FormAdicional = ({
    hallazgoForm,
    setFormInputs,
    camposAdicionales,
    handleDelayedInput,
    handleInputChange,
    handleBlur
}) => {

    const renderItem = ({ item, index }) => {
        return (
            <CamposAdicionalesInputs
                        hallazgoForm={hallazgoForm}
                        setFormInputs={setFormInputs}
                        item={item}
                        index={index}
                        handleDelayedInput={handleDelayedInput}
                        handleInputChange={handleInputChange}
                        handleBlur={handleBlur}
                    />
        );
    };

    return (
        <FlatList
            data={camposAdicionales}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.nombre + index}
        />
    );
}

export default FormAdicional;