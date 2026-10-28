jest.mock("expo-contacts", () => ({}));
jest.mock("expo-image-picker", () => ({}));

import { toLocalPhone } from "../viewModel/useAddContactViewModel";

describe("toLocalPhone", () => {
  it("keeps only 10 digits", () => {
    expect(toLocalPhone("300 123 45678999")).toBe("3001234567");
  });

  it("drops the +57 country code from the phone book", () => {
    expect(toLocalPhone("+57 300-123-4567")).toBe("3001234567");
  });

  it("removes letters and symbols", () => {
    expect(toLocalPhone("(300) abc 12")).toBe("30012");
  });
});
