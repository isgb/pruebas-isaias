import React from 'react'
import FormInputs from './FormInputs';

/** Componente encargado de renderizar toda la vista del formulario y botones que tendrá cada hallazgo.
 * @param {Object} familiaForm - Nombre de la familia del hallazgo.
 * @param {Object} grupoHallazgo - Identificador del grupo de hallazgos.
 * @param {Object} dataHallazgo - Objeto que contiene la información del hallazgo.
 * @param {Boolean} habilitarBtn - Booleano que indica si se habilita el botón de agregar hallazgo.
*/
const HallazgoContainer = ({
    familiaForm,
    grupoHallazgo,
    dataHallazgo
}) => {

    return (
        <>
            <FormInputs
                familiaForm={familiaForm}
                grupoHallazgo={grupoHallazgo}
                hallazgoForm={dataHallazgo}
            />
        </>
    )
};

export default HallazgoContainer;