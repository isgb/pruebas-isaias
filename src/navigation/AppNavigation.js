import { createNativeStackNavigator } from "@react-navigation/native-stack"
import CheckInPage from '../components/CheckInPage';
import ScannerQr from "../components/ScannerQr";

const Stack = createNativeStackNavigator();

export function AppNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      <Stack.Screen name="CheckInPage" component={CheckInPage} />
      <Stack.Screen name="ScannerQr" component={ScannerQr} />

    </Stack.Navigator>
  )
}