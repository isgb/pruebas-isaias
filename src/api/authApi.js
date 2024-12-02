import AsyncStorage from "@react-native-async-storage/async-storage"
import { ENV } from "../utils";

export class AuthApi {
    async register(email, password){
        try {
            const url = `${ENV.API_URL}/${ENV.ENDPOINTS.AUTH.REGISTER}`;
            const params = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email , password }),
            };

            const response = await fetch(url, params);
            const result = await response.json();

            if(response.status !== 201) throw result;

        } catch (error) {
            throw error;  
        }
    }

     async login (email, password){
        try {
            const url = `${ENV.API_URL}/${ENV.ENDPOINTS.AUTH.LOGIN}`;
            const params = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            };

            const response = await fetch(url, params);
            const result = await response.json();

            if(response.status !== 200) throw result;

            return result;

        } catch (error) {
            throw error;
        }
    }

    async refreshAccessToken(refreshToken){
        try {
            const url = `${ENV.API_URL}/${ENV.ENDPOINTS.AUTH.REFRESH_ACCESS_TOKEN}`;
            const params = {
                method:"POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body:JSON.stringify({
                    refreshToken,
                })
            };

            const response = await fetch(url,params);
            const result = await response.json();

            if(response.status !== 200) throw result

            return result;
        } catch (error) {
            throw error
        }
    }

    async setAccessToken(token2){
        await AsyncStorage.setItem(ENV.JWT.ACCESS, token2);
    }

    async getAccessToken(){
        // return await AsyncStorage.getItem(ENV.JWT.ACCESS);
        return await AsyncStorage.getItem('token');
    }

    async setRefreshAccesToken(token){
        await AsyncStorage.setItem(ENV.JWT.REFRESH, token);
    }

    async getRefreshToken(){
        // return await AsyncStorage.getItem(ENV.JWT.REFRESH);
        return await AsyncStorage.getItem('refreshToken');
    }
    
    async removeTokens(){
        await AsyncStorage.removeItem(ENV.JWT.ACCESS);
        await AsyncStorage.removeItem(ENV.JWT.REFRESH);
    }
    
}