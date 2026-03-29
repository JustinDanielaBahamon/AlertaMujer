import { Provider as PaperProvider } from 'react-native-paper';
import { Stack } from "expo-router"; 
/* Este archivo servira para navegar entre pantallas 
 que crearemos gracias a React navegation*/

/*¿Qué hace?
Cada Stack.Screen registra una pantalla dentro del navegador. El name debe coincidir exactamente con el nombre del archivo en la carpeta app/. Si el archivo se llama login.tsx, el name es "login".*/
export default function RootLayout(){ 
    return(
        <PaperProvider>
            <Stack screenOptions={{headerShown: false}}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="registro" />
                <Stack.Screen name="(tabs)" />
            </Stack>
        </PaperProvider>
       
    );
}

