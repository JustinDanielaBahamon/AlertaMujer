import { dateToIso, formatDateText, profileIncomplete } from "../perfilIncompleto";

describe("completar registro", () => {
  it("una cuenta de Google sin teléfono ni documento está incompleta", () => {
    expect(profileIncomplete({})).toBe(true);
    expect(profileIncomplete({ telephone: "3001234567", documentNumber: "1080", documentType: "C.C", birthdate: "1995-05-05" })).toBe(false);
    expect(profileIncomplete({ telephone: "3001234567", documentNumber: " ", documentType: "C.C", birthdate: "1995-05-05" })).toBe(true);
  });

  it("convierte la fecha y rechaza fechas que no existen", () => {
    const today = new Date(2026, 9, 21);
    expect(dateToIso("05/05/1995", today)).toBe("1995-05-05");
    expect(dateToIso("31/02/1995", today)).toBeNull();
    expect(dateToIso("05/05/2025", today)).toBeNull();
    expect(dateToIso("5/5/95", today)).toBeNull();
  });

  it("pone las barras mientras se escribe", () => {
    expect(formatDateText("0505")).toBe("05/05");
    expect(formatDateText("05051995")).toBe("05/05/1995");
  });
});
