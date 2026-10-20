import { servicioPara } from "../servicios";

describe("servicios (microservicios sin gateway)", () => {
  const urls = { alert: "https://alert.example", evidence: "https://evidence.example" };

  it("envía cada ruta a su servicio", () => {
    expect(servicioPara("/api/evidences/upload", urls)).toBe("https://evidence.example");
    expect(servicioPara("/api/alerts/12/messages", urls)).toBe("https://alert.example");
    expect(servicioPara("/api/location-logs", urls)).toBe("https://alert.example");
    expect(servicioPara("/api/auth/login", urls)).toBeNull();
    expect(servicioPara("/api/devices/user", urls)).toBeNull();
  });

  it("no confunde prefijos parecidos", () => {
    expect(servicioPara("/api/alerts-falsas", urls)).toBeNull();
  });

  it("sin URLs configuradas todo va a la principal", () => {
    expect(servicioPara("/api/evidences/upload", {})).toBeNull();
  });
});
