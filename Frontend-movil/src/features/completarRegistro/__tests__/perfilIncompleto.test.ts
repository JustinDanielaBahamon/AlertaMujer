import { fechaAIso, formatearFecha, perfilIncompleto } from "../perfilIncompleto";

describe("completar registro", () => {
  it("una cuenta de Google sin teléfono ni documento está incompleta", () => {
    expect(perfilIncompleto({})).toBe(true);
    expect(perfilIncompleto({ telephone: "3001234567", documentNumber: "1080", documentType: "C.C", birthdate: "1995-05-05" })).toBe(false);
    expect(perfilIncompleto({ telephone: "3001234567", documentNumber: " ", documentType: "C.C", birthdate: "1995-05-05" })).toBe(true);
  });

  it("convierte la fecha y rechaza fechas que no existen", () => {
    const hoy = new Date(2026, 9, 21);
    expect(fechaAIso("05/05/1995", hoy)).toBe("1995-05-05");
    expect(fechaAIso("31/02/1995", hoy)).toBeNull();
    expect(fechaAIso("05/05/2025", hoy)).toBeNull();
    expect(fechaAIso("5/5/95", hoy)).toBeNull();
  });

  it("pone las barras mientras se escribe", () => {
    expect(formatearFecha("0505")).toBe("05/05");
    expect(formatearFecha("05051995")).toBe("05/05/1995");
  });
});
