import { useEffect } from 'react';
import Hallazgo from './Hallazgo';
import { useHallazgo } from '../../context/HallazgosFormContext';

/** Componente encarga de configurar la lista de los hallazgos agrupados por la familia
 * @param {Object} hallazgos - Lista de hallazgos
 * @param {Object} levantamiento - Levantamiento
 */
const HallazgosList = ({ auditoria, hallazgos, levantamiento }) => {

    const { setTypeAuditoria, listHallazgos, setListHallazgos, setLevantamiento } = useHallazgo();

    /** Establecemos el tipo de auditoria que está realizando el usuario */
    useEffect(() => {
        setTypeAuditoria(auditoria);
    }, [auditoria]);

    /** Establecemos la información del levantamiento */
    useEffect(() => {
        setLevantamiento(levantamiento);
    }, [levantamiento]);

    /** Establecemos la lista de hallazgos */
    useEffect(() => {
        setListHallazgos(hallazgos);
    }, [hallazgos, listHallazgos]);

    return (
        <Hallazgo />
    );
}

export default HallazgosList;