module.exports = function(api) {
  api.cache(true);
  return {
    // En el SDK 54, babel-preset-expo agrega automáticamente el plugin de
    // react-native-worklets que necesita Reanimated 4 (no se declara aquí).
    presets: ['babel-preset-expo'],
  };
};
