import { Text, FlatList } from 'react-native';
import InputStyle from '../../styles/InputStyle';
import HallazgoContainer from './HallazgoContainer';

/** Componente encargado de renderizar todos los hallazgos de una familia.
 * @param {*} familiaForm: Nombre de la familia. 
 * @param {*} familias: Objeto que contiene los hallazgos de la familia.
 */
const HallazgoForm = ({
    familiaForm,
    familias
}) => {

    if (!familias || Object.keys(familias).length === 0)
        return <Text style={InputStyle.titleInput}>No hay hallazgos disponibles en esta familia.</Text>;


    const renderItem = ({ item, index }) => {
        const { grupoHallazgo, dataHallazgo } = item;
        return (
            <HallazgoContainer
                key={grupoHallazgo + index}
                familiaForm={familiaForm}
                grupoHallazgo={grupoHallazgo}
                dataHallazgo={dataHallazgo}
            />
        );
    };

    const familiesArray = Object.keys(familias).flatMap(grupoHallazgo => {
        const dataFamilia = familias[grupoHallazgo];
        if (Array.isArray(dataFamilia)) {
            return dataFamilia.map(hallazgoDuplicado => ({
                grupoHallazgo,
                dataHallazgo: hallazgoDuplicado
            }));
        } else if (typeof dataFamilia === 'object' && dataFamilia !== null) {
            return [{
                grupoHallazgo,
                dataHallazgo: dataFamilia
            }];
        } else {
            return [];
        }
    });

    return (
        <FlatList
            data={familiesArray}
            keyExtractor={(item, index) => item.grupoHallazgo + item.hallazgoId + index}
            renderItem={renderItem}
        />
    );
}

export default HallazgoForm;