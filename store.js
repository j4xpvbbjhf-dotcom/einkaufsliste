// =============================================================
//  Store — Speicherschicht der Einkaufsliste
// =============================================================
//
//  Trennt bewusst zwei Dinge:
//    * "geteilte Daten"  -> items, history, customProducts, removedLabels
//                           (sehen alle, werden synchronisiert)
//    * "persönliche Daten" (screen, tab, name, Mengenauswahl ...)
//                           bleiben lokal auf dem Gerät — die regelt app.js.
//
//  Zwei Modi, automatisch nach config.js gewählt:
//    LOKAL    -> localStorage, nur dieses Gerät, kein Konto nötig.
//    GETEILT  -> Supabase: ein JSON-Dokument pro LIST_ID, live für alle.
//                Konfliktmodell: ganzes Dokument, "letzte Änderung gewinnt".
//                Für eine Haushaltsliste völlig ausreichend.
// =============================================================

(function () {
  const cfg = (window.EINKAUF_CONFIG || {});
  const LIST_ID = cfg.LIST_ID || "haushalt";
  const LS_KEY = "einkauf:" + LIST_ID;
  const shared = !!(cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY);

  let statusCb = () => {};
  let pushTimer = null;
  let sb = null;          // Supabase-Client
  let lastPushed = "";    // letzter eigener Push (Echo unterdrücken)

  function loadLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }
  function saveLocal(data) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src; s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const Store = {
    mode: shared ? "shared" : "local",
    listId: LIST_ID,

    onStatus(cb) { statusCb = cb; },

    // Startet den Store. onRemote(data) wird bei Fremd-Änderungen gerufen.
    // Liefert die Anfangsdaten (oder null, wenn noch nichts gespeichert ist).
    async start(onRemote) {
      const local = loadLocal();

      if (!shared) {
        return local;
      }

      // ---- Supabase-Modus ----
      try {
        if (!window.supabase) {
          await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js");
        }
        sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

        // Anfangsdaten vom Server holen
        const { data, error } = await sb
          .from("lists").select("data").eq("id", LIST_ID).maybeSingle();
        if (error) throw error;

        const remote = data ? data.data : null;

        // Live-Updates abonnieren
        sb.channel("list:" + LIST_ID)
          .on("postgres_changes",
            { event: "*", schema: "public", table: "lists", filter: "id=eq." + LIST_ID },
            (payload) => {
              const next = payload.new && payload.new.data;
              if (!next) return;
              const sig = JSON.stringify(next);
              if (sig === lastPushed) return;   // eigenes Echo ignorieren
              saveLocal(next);
              onRemote(next);
            })
          .subscribe((s) => {
            statusCb(s === "SUBSCRIBED" ? "online" : "connecting");
          });

        // Server kennt die Liste noch nicht? Lokalen Stand hochladen.
        if (!remote && local) { this.push(local); return local; }
        if (remote) { saveLocal(remote); return remote; }
        return local;
      } catch (e) {
        console.warn("[store] Supabase nicht erreichbar, nutze lokalen Stand:", e);
        statusCb("offline");
        return local;
      }
    },

    // Geteilte Daten speichern (lokal sofort, Server entprellt).
    push(data) {
      saveLocal(data);
      if (!shared || !sb) return;

      clearTimeout(pushTimer);
      pushTimer = setTimeout(async () => {
        try {
          lastPushed = JSON.stringify(data);
          const { error } = await sb.from("lists")
            .upsert({ id: LIST_ID, data, updated_at: new Date().toISOString() });
          if (error) throw error;
          statusCb("online");
        } catch (e) {
          console.warn("[store] Push fehlgeschlagen:", e);
          statusCb("offline");
        }
      }, 400);
    }
  };

  window.Store = Store;
})();
