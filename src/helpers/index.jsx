import { Alert } from "react-native"

export const formatearFecha = fecha => {
  const nuevaFecha = new Date(fecha+" 00:00:00")
  const opciones = {
    // weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // hour: 'numeric',
    // minute: 'numeric',
    // hour12: true
  }

  return nuevaFecha.toLocaleDateString('es-ES', opciones)
}

export const formatearFechaHora = fecha => {
  const nuevaFecha = new Date(fecha)
  const opciones = {
    // weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }

  return nuevaFecha.toLocaleDateString('es-ES', opciones)
}

export const textNombreStatus = (numeroStatus) => {

  switch (numeroStatus) {

    case 1:
      // setStatus(1)
      return "EN RUTA"
    // break;

    case 2:
      // setStatus(2)
      return "EN LLEGADA"
    // break;

    case 3:
      // setStatus(3)
      return "CON USUARIO"
    // break;

    case 4:
      // setStatus(4)
      return "ENVIAR"
    // break;

    default:
      return "SIN STATUS"
    // break;
  }

}

export const obtenerFechaHora = () => {

  let fecha = new Date()

  let dia = fecha.getDate();
  dia = (dia < 10) ? `0${dia}` : dia;

  let mes = fecha.getMonth() + 1;
  mes = (mes < 10) ? `0${mes}` : mes;

  let año = fecha.getFullYear();

  let hora = fecha.getHours()
  hora = (hora < 10) ? `0${hora}` : hora;

  let minutos = fecha.getMinutes()
  minutos = (minutos < 10) ? `0${minutos}` : minutos;

  let segundos = fecha.getSeconds()
  segundos = (segundos < 10) ? `0${segundos}` : segundos;

  let fechaCompleta = `${año}-${mes}-${dia} ${hora}:${minutos}:${segundos}`;

  return fechaCompleta
}

export const obtenerFechaActual = () => {

  let fecha = new Date()

  let dia = fecha.getDate();
  dia = (dia < 10) ? `0${dia}` : dia;

  let mes = fecha.getMonth() + 1;
  mes = (mes < 10) ? `0${mes}` : mes;

  let año = fecha.getFullYear();

  let fechaCompleta = `${año}-${mes}-${dia}`;

  return fechaCompleta
}

export const obtenerOpcionesCompostaHumedad = () => {

    const dataOpcionesCompostaHumedad =[
      {
        id: "1",
        valor: "-W"
      }, {
        id: "2",
        valor: "W"
      }, {
        id: "3",
        valor: "+W"
      },
    ];

    return dataOpcionesCompostaHumedad
}

export const obtenerOpcionesPlaga = () => {

  const dataOpcionesPlaga =[
    {
      id: "1",
      valor: "SI"
    }, {
      id: "2",
      valor: "NO"
    },
  ];

  return dataOpcionesPlaga
}

export const validateDecimal = (valor) => {
  var regx = /^\d*\.?\d*$/;
  return (regx.test(valor)) ? true : false;
}

export const showAlertMessageError = (messageOne = '', messageTwo = '') => {
  Alert.alert(messageOne,messageTwo);
}

 /** Función para validar que el usuario solamente digite números */
export const handleNumericInput = (value) => {
    return value.replace(/[^0-9]/g, '');
};