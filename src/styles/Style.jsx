import { StyleSheet } from 'react-native'
import { orange, grayElm, whiteELm } from '../components/Login/Constants';

const Style = StyleSheet.create({
    containerLogin: {
        flex: 1,
        backgroundColor: '#dcdcdc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    containerInputLogin: {
        alignItems: "center",
        width: '100%',
        marginBottom: 36
    },
    titleLogin: {
        textAlign: 'center',
        fontSize: 42,
        color: orange,
        fontWeight: "bold",
        marginBottom: 2
    },
    subTitleLogin: {
        textAlign: 'center',
        color: grayElm,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 22
    },
    versionLogin: {
        textAlign: 'center',
        color: orange,
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 28
    },
    logoLogin: {
        marginVertical: 28,
        width: 148,
        height: 140
    },
    spinnerLogin: {
        color: whiteELm
    },
    containerModal: {
        backgroundColor: grayElm,
        flex: 1,
    },
    containerInformationLevantamiento: {
        backgroundColor: '#feebe5',
        marginHorizontal: 30,
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 20
    },
    containerLevantamiento: {
        marginHorizontal: 10,
        borderRadius: 15,
        backgroundColor: '#E9E9E9',
        padding: 20,
        borderBottomColor: '#94a3B8',
        borderBottomWidth: 1,
        marginBottom: 20,
    },
    titleLevantamiento: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
    },
    subTitleLevantamiento: {
        textAlign: 'center',
        fontSize: 16,
    },
    titleGaleria: {
        color: '#FFF',
        marginVertical: 20,
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 24,
        width: '100%',
        paddingVertical: 10,
        alignSelf: 'center',
    },
    labelLevantamiento: {
        textTransform: 'uppercase',
        color: '#000',
        fontWeight: '600',
        fontSize: 12
    },
    valueLevantamiento: {
        fontWeight: '700',
        fontSize: 20,
        color: '#334155'
    },
    flexDirection: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    width50: {
        width: '48%',
    },
    width100: {
        width: '100%',
    },
    textCenter: {
        textAlign: 'center',
    },
    alignCenter: {
        alignItems: 'center',
    },
    marginTop10: {
        marginTop: 10
    },
    marginTop20: {
        marginTop: 20
    },
    marginTop30: {
        marginTop: 30
    },
    marginBottom10: {
        marginBottom: 10
    },
    marginBottom20: {
        marginBottom: 20
    },
    marginBottom30: {
        marginBottom: 30
    },
    marginVertical20: {
        marginVertical: 20
    },
    borderBottomStyle: {
        paddingBottom: 20,
        borderBottomColor: "#94a3B8",
        borderBottomWidth: 2,
        borderBottomStyle: 'solid'
    },
    customMargin: {
        marginVertical: 11,
        marginHorizontal: 30,
    },
});

export default Style;