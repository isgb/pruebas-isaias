import jwtDecode from 'jwt-decode'

export function hasExpiredToken(token){
    const { exp } = jwtDecode(token)
    console.log("EXPIRADO",exp)
    // console.log(exp)

    const currentDate = new Date().getDate();
    console.log("currentDate",currentDate)

    if(exp <= currentDate){
        return true
    }

    return false;
}