const mockStore: Record<string, string> = {};
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async (k: string) => mockStore[k] ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => {
    mockStore[k] = v;
  }),
  deleteItemAsync: jest.fn(async (k: string) => {
    delete mockStore[k];
  }),
}));
jest.mock("expo-crypto", () => {
  const { createHash, randomUUID } = jest.requireActual("crypto");
  return {
    CryptoDigestAlgorithm: { SHA256: "SHA-256" },
    digestStringAsync: jest.fn(async (_a: string, text: string) => createHash("sha256").update(text).digest("hex")),
    randomUUID: () => randomUUID(),
  };
});

import { checkCancelPin, hasCancelPin, hasDuressPin, removeCancelPins, saveCancelPins } from "../cancelPin";

describe("cancel PIN", () => {
  beforeEach(async () => removeCancelPins());

  it("without a PIN any cancel works, as before", async () => {
    expect(await hasCancelPin()).toBe(false);
    expect(await checkCancelPin("")).toBe("ok");
  });

  it("tells the normal PIN, the duress PIN and a wrong one apart", async () => {
    await saveCancelPins("1234", "9876");

    expect(await hasCancelPin()).toBe(true);
    expect(await hasDuressPin()).toBe(true);
    expect(await checkCancelPin("1234")).toBe("ok");
    expect(await checkCancelPin("9876")).toBe("duress");
    expect(await checkCancelPin("0000")).toBe("wrong");
  });

  it("does not store the PINs in clear text", async () => {
    await saveCancelPins("1234", null);
    expect(JSON.stringify(mockStore)).not.toContain("1234");
  });

  it("rejects short PINs and a duress PIN equal to the normal one", async () => {
    await expect(saveCancelPins("12", null)).rejects.toThrow();
    await expect(saveCancelPins("1234", "1234")).rejects.toThrow();
  });
});
