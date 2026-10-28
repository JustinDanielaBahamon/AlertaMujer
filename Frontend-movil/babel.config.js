module.exports = function(api) {
  api.cache(true);
  return {
    // On SDK 54, babel-preset-expo adds the react-native-worklets plugin that
    // Reanimated 4 needs automatically (it is not declared here).
    presets: ['babel-preset-expo'],
  };
};
