import { AuthNavigation } from "./stacks/AuthNavigation";
import { AppNavigation } from "./AppNavigation";
import { useAuth } from "../context/AuthContext";
import { DataProvider } from "../context/DataContext";
import { SendDataToBDProvider } from "../context/SendDataToBDContext";
import { DataHallazgosProvider } from "../context/DataHallazgosContext";
import { EstadoScannerProvider } from "../context/EstadoScannerContext";

export const HandlerNavigation = () => {

    const { isAuthenticated } = useAuth()

    return (isAuthenticated)

        ?

        <EstadoScannerProvider>
            <DataProvider>
                <SendDataToBDProvider>
                    <DataHallazgosProvider>
                        <AppNavigation />
                    </DataHallazgosProvider>
                </SendDataToBDProvider>
            </DataProvider>
        </EstadoScannerProvider>
        
        :

        <AuthNavigation />;

    /************************************ */
    // return  <AuthNavigation />;
    // return(
    //     // <DataProvider>
    //         <AppNavigation />
    //     // </DataProvider>
    // );
    /************************************ */
}