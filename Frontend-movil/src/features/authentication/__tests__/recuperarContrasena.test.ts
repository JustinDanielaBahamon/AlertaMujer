import { act, renderHook } from "@testing-library/react-native";

jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ reset: jest.fn(), goBack: jest.fn() }) }));
jest.mock("../../../services/auth.service", () => ({
  authService: {
    pedirCodigoRecuperacion: jest.fn(async () => {}),
    verificarCodigoRecuperacion: jest.fn(async () => {}),
    restablecerContrasena: jest.fn(async () => {}),
  },
}));

import { authService } from "../../../services/auth.service";
import { useRecuperarContrasenaViewModel } from "../viewModel/useRecuperarContrasenaViewModel";

describe("recuperar contraseña", () => {
  beforeEach(() => jest.clearAllMocks());

  it("pide el código, reparte los 6 dígitos pegados y los verifica", async () => {
    const { result } = renderHook(() => useRecuperarContrasenaViewModel());

    act(() => result.current.setEmail(" ana@correo.com "));
    await act(() => result.current.enviarEnlace());
    expect(authService.pedirCodigoRecuperacion).toHaveBeenCalledWith("ana@correo.com");
    expect(result.current.paso).toBe(2);
    expect(result.current.codigo).toHaveLength(6);

    await act(async () => {
      result.current.handleCodigoChange("123456", 0);
    });
    expect(authService.verificarCodigoRecuperacion).toHaveBeenCalledWith("ana@correo.com", "123456");
    expect(result.current.paso).toBe(3);
  });

  it("no deja reenviar el código antes de un minuto", async () => {
    const { result } = renderHook(() => useRecuperarContrasenaViewModel());
    act(() => result.current.setEmail("ana@correo.com"));
    await act(() => result.current.enviarEnlace());

    expect(result.current.puedeReenviar).toBe(false);
    await act(() => result.current.reenviarCodigo());
    expect(authService.pedirCodigoRecuperacion).toHaveBeenCalledTimes(1);
  });

  it("guarda la nueva contraseña con el correo y el código", async () => {
    const { result } = renderHook(() => useRecuperarContrasenaViewModel());
    act(() => result.current.setEmail("ana@correo.com"));
    await act(() => result.current.enviarEnlace());
    await act(async () => {
      result.current.handleCodigoChange("654321", 0);
    });
    act(() => {
      result.current.setNuevaPassword("NuevaClave123");
      result.current.setConfirmarPassword("NuevaClave123");
    });
    await act(async () => {
      result.current.guardarNuevaContrasena();
    });
    expect(authService.restablecerContrasena).toHaveBeenCalledWith("ana@correo.com", "654321", "NuevaClave123");
    expect(result.current.alerta.tipo).toBe("exito");
  });
});
