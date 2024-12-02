import { useEffect, useState } from "react"

export const useEstadoScanner = () => {

    const [estadoScanner, setEstadoScanner] = useState(true);

    useEffect(() => {
        setEstadoScanner(!estadoScanner);
    },[estadoScanner])

    return {
        estadoScanner, 
        setEstadoScanner
    }
}