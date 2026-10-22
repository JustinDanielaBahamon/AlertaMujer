import { act, renderHook } from "@testing-library/react-native";

jest.mock("@react-navigation/native", () => ({ useNavigation: () => ({ reset: jest.fn(), goBack: jest.fn() }) }));
jest.mock("../../../services/auth.service", () => ({
  authService: {
    requestRecoveryCode: jest.fn(async () => {}),
    verifyRecoveryCode: jest.fn(async () => {}),
    resetPassword: jest.fn(async () => {}),
  },
}));

import { authService } from "../../../services/auth.service";
import { useRecoverPasswordViewModel } from "../viewModel/useRecuperarContrasenaViewModel";

describe("recuperar contraseña", () => {
  beforeEach(() => jest.clearAllMocks());

  it("pide el código, reparte los 6 dígitos pegados y los verifica", async () => {
    const { result } = renderHook(() => useRecoverPasswordViewModel());

    act(() => result.current.setEmail(" ana@correo.com "));
    await act(() => result.current.sendLink());
    expect(authService.requestRecoveryCode).toHaveBeenCalledWith("ana@correo.com");
    expect(result.current.step).toBe(2);
    expect(result.current.code).toHaveLength(6);

    await act(async () => {
      result.current.handleCodeChange("123456", 0);
    });
    expect(authService.verifyRecoveryCode).toHaveBeenCalledWith("ana@correo.com", "123456");
    expect(result.current.step).toBe(3);
  });

  it("no deja reenviar el código antes de un minuto", async () => {
    const { result } = renderHook(() => useRecoverPasswordViewModel());
    act(() => result.current.setEmail("ana@correo.com"));
    await act(() => result.current.sendLink());

    expect(result.current.canResend).toBe(false);
    await act(() => result.current.resendCode());
    expect(authService.requestRecoveryCode).toHaveBeenCalledTimes(1);
  });

  it("guarda la nueva contraseña con el correo y el código", async () => {
    const { result } = renderHook(() => useRecoverPasswordViewModel());
    act(() => result.current.setEmail("ana@correo.com"));
    await act(() => result.current.sendLink());
    await act(async () => {
      result.current.handleCodeChange("654321", 0);
    });
    act(() => {
      result.current.setNewPassword("NuevaClave123");
      result.current.setConfirmPassword("NuevaClave123");
    });
    await act(async () => {
      result.current.saveNewPassword();
    });
    expect(authService.resetPassword).toHaveBeenCalledWith("ana@correo.com", "654321", "NuevaClave123");
    expect(result.current.alert.type).toBe("exito");
  });
});
