// Global mocks for the unit tests (Jest + jest-expo).
// AsyncStorage does not exist off the device: its official in-memory mock is used.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
