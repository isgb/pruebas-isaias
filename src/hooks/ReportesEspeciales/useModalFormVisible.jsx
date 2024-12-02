import { useState } from 'react';

const useModalFormVisible = () => {
    
    const [modalFormVisible, setModalFormVisible] = useState(false);
    const [dataForm,setDataForm] = useState(null);

    const cerrarModalForm = () => {
        setModalFormVisible(false);
    };

    const abrirModalForm = (dataForm = null) => {
        setModalFormVisible(true);
        if(dataForm){
            setDataForm(dataForm);
        }
    };

    return {
        modalFormVisible,
        cerrarModalForm,
        abrirModalForm,
        dataForm
    };
};

export default useModalFormVisible;