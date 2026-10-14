# Alerta Mujer — App móvil

Aplicación Android de seguridad personal para mujeres. Permite activar una alerta SOS con la ubicación, gestionar contactos de confianza, ver zonas seguras y de riesgo, guardar ubicaciones y recorridos frecuentes y llamar a líneas de ayuda.

Comparte backend (Spring Boot + PostgreSQL) con el panel web, por lo que los datos están sincronizados entre ambas aplicaciones.

## Tecnologías

| Componente | Versión |
|---|---|
| Expo SDK (Nueva Arquitectura activada) | 54 |
| React Native / React | 0.81 / 19.1 |
| TypeScript (modo estricto) | 5.9 |
| React Navigation (stack, tabs, drawer) | 7 |
| Axios | 1.x |
| react-native-maps (Google Maps) | 1.20 |
| expo-location | 19 |
| Jest + jest-expo + React Native Testing Library | 29 / 54 / 13 |
| EAS Build | — |

## Requisitos

- Node.js 20 o superior y npm (EAS CLI recomienda Node 22).
- `npm install -g eas-cli` e iniciar sesión con `eas login` para compilar APK.
- El backend corriendo y accesible desde el celular (ver `Backend-ALERTA-MUJER`).

## Desarrollo

```bash
npm install
npm start            # expo start
```

`npm start` ejecuta antes `scripts/update-env.js`, que escribe en `.env` la IP de este computador (`EXPO_PUBLIC_API_URL=http://<ip>:8080`) para que el celular llegue al backend. Para forzar una IP: `node ./scripts/update-env.js 192.168.1.50`. El archivo `.env` no se sube a git.

La URL del backend se resuelve en `src/services/api.ts` en este orden: `EXPO_PUBLIC_API_URL`, la IP detectada por Expo y, por último, `http://localhost:8080`.

## Pruebas

```bash
npm test             # jest
npm run test:watch
```

Las pruebas están en carpetas `__tests__/` junto al código (`*.test.ts` / `*.test.tsx`). Los mocks globales están en `jest.setup.js`.

## Generar el APK (EAS Build)

```bash
eas build -p android --profile preview
```

| Perfil | Uso | `EXPO_PUBLIC_API_URL` |
|---|---|---|
| `development` | APK con dev client (`npx expo start --dev-client`) | — |
| `preview` | APK para probar en celulares | backend en la red local |
| `production` | AAB para Play Store | backend desplegado |

Variables de entorno en EAS (no se guardan en el repositorio):

- `GOOGLE_MAPS_API_KEY` (visibilidad *Sensitive*): la lee `app.config.js` para `react-native-maps`. La clave debe tener habilitado **Maps SDK for Android**, facturación activa en Google Cloud y la restricción de app Android con el paquete `com.alertamujer.app` y el SHA-1 del keystore de EAS (`eas credentials`).

Para probar el APK contra el backend local, el celular y el computador deben estar en la misma Wi-Fi; `app.json` permite tráfico HTTP (`expo-build-properties` → `usesCleartextTraffic`) para ese caso.

## Ver los registros del APK

```bash
adb logcat -v time ReactNativeJS:V AndroidRuntime:E *:S
```

`ReactNativeJS` muestra los `console.log` y errores de JavaScript; `AndroidRuntime` los cierres de la app.

## Estructura

```
App.tsx                 # proveedores globales, navegación y animación de apertura
src/
├── features/           # pantallas por funcionalidad (view / viewModel / styles)
├── contexts/           # estado global (auth, contactos, recorridos, tema, idioma…)
├── services/           # clientes HTTP del backend y servicios del dispositivo
├── navigation/         # stack, pestañas y drawer
├── components/         # componentes compartidos
├── hooks/              # hooks compartidos
└── locales/            # textos en es, en, fr, pt
```
