import { addToInbox, clearInbox, inboxEntries, markInboxRead } from "../inbox";

describe("bandeja de notificaciones", () => {
  beforeEach(() => clearInbox());

  it("guarda lo más reciente primero y sin leer", async () => {
    await addToInbox({ id: "a", kind: "trip", title: "¿Ya llegaste?", body: "..." });
    await addToInbox({ id: "b", kind: "evidence", title: "Evidencias", body: "..." });
    const list = await inboxEntries();
    expect(list.map((e) => e.id)).toEqual(["b", "a"]);
    expect(list.every((e) => !e.read)).toBe(true);
  });

  it("la misma alerta actualiza su línea en vez de repetirse y vuelve a quedar sin leer", async () => {
    await addToInbox({ id: "alert-7", kind: "alert", title: "Ana necesita ayuda", body: "activó una alerta" });
    await markInboxRead();
    await addToInbox({ id: "alert-7", kind: "warning", title: "Ana necesita ayuda", body: "no respondió" });
    const list = await inboxEntries();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ kind: "warning", body: "no respondió", read: false });
  });

  it("marcar como leído y borrar", async () => {
    await addToInbox({ id: "a", kind: "phone", title: "Otro celular", body: "..." });
    await markInboxRead();
    expect((await inboxEntries())[0].read).toBe(true);
    await clearInbox();
    expect(await inboxEntries()).toEqual([]);
  });
});
