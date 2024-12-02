import { useState } from "react"
import Hallazgo from "../components/Hallazgos/Hallazgo"

export const useHallazgoInputs = (hallazgo) => {

    const [hallazgoForm, setHallazgoForm] = useState({
        ...hallazgo,
        cantidadReal: (hallazgo.cantidadReal !== "") ? hallazgo.cantidadReal.toString() : "0",
        cantidadIdeal: (hallazgo.cantidadIdeal !== "") ? hallazgo.cantidadIdeal.toString() : "0",
        observaciones: hallazgo.observaciones,
        fotos: (hallazgo.fotos !== undefined) ? hallazgo.fotos : [],
        fotosLocal: (hallazgo.fotosLocal !== undefined) ? hallazgo.fotosLocal : [],
        hallazgoId: hallazgo.hallazgoId,
        isTemporal: (hallazgo.isTemporal !== undefined) ? hallazgo.isTemporal : false,
        fotosEliminadas: (hallazgo.fotosEliminadas !== undefined && hallazgo.fotosEliminadas.length > 0)
            ? hallazgo.fotosEliminadas
            : [],
        camposAdicionales: (hallazgo.camposAdicionales !== undefined) ? hallazgo.camposAdicionales : []
    })

    return {
        hallazgoForm,
        setHallazgoForm
    }
}