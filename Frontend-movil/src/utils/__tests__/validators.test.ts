import {
  digitsOnly,
  documentFilter,
  isValidCellphone,
  isValidDocument,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidPhone,
  lettersOnly,
} from "../validators";

describe("validators", () => {
  it("phones: digits only, 10 at most; a cell phone starts with 3", () => {
    expect(digitsOnly("+57 310-555 12345")).toBe("5731055512");
    expect(digitsOnly("310 555 1234")).toBe("3105551234");
    expect(isValidCellphone("3105551234")).toBe(true);
    expect(isValidCellphone("6088751234")).toBe(false);
    expect(isValidCellphone("310555123")).toBe(false);
    expect(isValidPhone("6088751234")).toBe(true);
  });

  it("names: letters with accents, no digits or symbols", () => {
    expect(lettersOnly("María José 2 López!")).toBe("María José López");
    expect(lettersOnly("Ñoño   D'Angelo-Pérez")).toBe("Ñoño D'Angelo-Pérez");
    expect(isValidName("Al")).toBe(false);
    expect(isValidName("Ana")).toBe(true);
  });

  it("emails need a user, a domain and an extension", () => {
    expect(isValidEmail("ana@correo.com")).toBe(true);
    expect(isValidEmail("ana@correo")).toBe(false);
    expect(isValidEmail("ana correo@x.com")).toBe(false);
  });

  it("documents depend on their type", () => {
    expect(documentFilter("C.C", "1.075-234.567")).toBe("1075234567");
    expect(documentFilter("Documento extranjero", "ab-12345")).toBe("AB12345");
    expect(isValidDocument("C.C", "12345")).toBe(false);
    expect(isValidDocument("T.I", "1075234567")).toBe(true);
    expect(isValidDocument("Documento extranjero", "AB12345")).toBe(true);
  });

  it("passwords follow the server limits (8 to 100 characters)", () => {
    expect(isValidPassword("abc1234")).toBe(false);
    expect(isValidPassword("abcdefgh")).toBe(true);
    expect(isValidPassword("a".repeat(101))).toBe(false);
  });
});
