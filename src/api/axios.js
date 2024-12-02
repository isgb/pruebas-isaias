import axios from "axios";
import { APP_ENV } from '@env';

const instance = axios.create({
    baseURL: APP_ENV === 'dev' 
            ? 'https://elmapi.zentro.com.mx/index.php/mobiles' 
            : 'https://erpapi.elmseguridad.com.mx/index.php/mobiles',
    withCredentials: true,
});

export default instance;