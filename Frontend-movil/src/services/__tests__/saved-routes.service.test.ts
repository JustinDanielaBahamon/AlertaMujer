import api from "../api";
import { savedRoutesService } from "../saved-routes.service";

jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

const mockApi = api as unknown as Record<"get" | "post" | "patch" | "delete", jest.Mock>;

describe("saved-routes.service", () => {
  beforeEach(() => Object.values(mockApi).forEach((fn) => fn.mockReset()));

  it("getMine consulta los recorridos de la usuaria autenticada", async () => {
    mockApi.get.mockResolvedValue({ data: [{ id: 1 }] });

    await expect(savedRoutesService.getMine()).resolves.toEqual([{ id: 1 }]);
    expect(mockApi.get).toHaveBeenCalledWith("/api/saved-routes/me");
  });

  it("create envía el recorrido sin decidir la estrella (la decide el backend)", async () => {
    mockApi.post.mockResolvedValue({ data: { id: 5, isStarred: true } });
    const nuevo = {
      name: "Casa → U",
      points: [
        { latitude: 1, longitude: 1, timestamp: "" },
        { latitude: 2, longitude: 2, timestamp: "" },
      ],
    };

    await savedRoutesService.create(nuevo);

    expect(mockApi.post).toHaveBeenCalledWith("/api/saved-routes", nuevo);
    expect(mockApi.post.mock.calls[0][1]).not.toHaveProperty("isStarred");
  });

  it("update usa PATCH sobre el id indicado", async () => {
    mockApi.patch.mockResolvedValue({ data: {} });

    await savedRoutesService.update(9, { isStarred: false });

    expect(mockApi.patch).toHaveBeenCalledWith("/api/saved-routes/9", { isStarred: false });
  });

  it("remove borra por id", async () => {
    mockApi.delete.mockResolvedValue({});

    await savedRoutesService.remove("3");

    expect(mockApi.delete).toHaveBeenCalledWith("/api/saved-routes/3");
  });

  it("propaga el error del backend (por ejemplo, el límite de 4 recorridos)", async () => {
    mockApi.post.mockRejectedValue({ response: { status: 409, data: { message: "Solo puedes tener 4 recorridos" } } });

    await expect(savedRoutesService.create({ name: "x", points: [] })).rejects.toMatchObject({
      response: { status: 409 },
    });
  });
});
