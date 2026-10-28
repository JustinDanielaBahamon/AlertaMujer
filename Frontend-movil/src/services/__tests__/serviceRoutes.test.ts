import { serviceFor } from "../serviceRoutes";

describe("servicios (microservicios sin gateway)", () => {
  const urls = { alert: "https://alert.example", evidence: "https://evidence.example" };

  it("envía cada ruta a su servicio", () => {
    expect(serviceFor("/api/evidences/upload", urls)).toBe("https://evidence.example");
    expect(serviceFor("/api/alerts/12/messages", urls)).toBe("https://alert.example");
    expect(serviceFor("/api/location-logs", urls)).toBe("https://alert.example");
    expect(serviceFor("/api/auth/login", urls)).toBeNull();
    expect(serviceFor("/api/devices/user", urls)).toBeNull();
  });

  it("no confunde prefijos parecidos", () => {
    expect(serviceFor("/api/alerts-falsas", urls)).toBeNull();
  });

  it("sin URLs configuradas todo va a la principal", () => {
    expect(serviceFor("/api/evidences/upload", {})).toBeNull();
  });
});
