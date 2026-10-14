// Extiende app.json con valores que no deben quedar en el repositorio.
// GOOGLE_MAPS_API_KEY: requerida por react-native-maps en los builds de Android (EAS).
// Sin ella la app se cierra al mostrar un mapa. Defínela como variable de EAS:
//   eas env:create --name GOOGLE_MAPS_API_KEY --value <clave> --environment preview --environment production
module.exports = ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: { apiKey: process.env.GOOGLE_MAPS_API_KEY },
    },
  },
});
