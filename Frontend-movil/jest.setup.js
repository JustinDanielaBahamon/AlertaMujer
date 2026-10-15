// Mocks globales para las pruebas unitarias (Jest + jest-expo).
// AsyncStorage no existe fuera del dispositivo: se usa su mock oficial en memoria.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
