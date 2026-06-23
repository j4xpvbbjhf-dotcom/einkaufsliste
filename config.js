// =============================================================
//  Einkaufsliste — Konfiguration
// =============================================================
//
//  So funktioniert die App in zwei Stufen:
//
//  STUFE 1 (Standard, sofort nutzbar, ohne Konto):
//    Lass alles unten leer. Die Liste wird nur auf DIESEM Gerät
//    gespeichert (im Browser). Perfekt zum Ausprobieren.
//
//  STUFE 2 (geteilt, mehrere Personen, kostenlos):
//    Trage unten deine Supabase-Werte ein. Dann sehen alle, die
//    dieselbe App-Adresse öffnen, dieselbe Liste — live synchronisiert.
//    Anleitung dazu in README.md.
//
//  Beide Werte findest du in Supabase unter:
//    Project Settings  ->  API
//      SUPABASE_URL       = "Project URL"
//      SUPABASE_ANON_KEY  = "anon public" Key
//
// =============================================================

window.EINKAUF_CONFIG = {
  SUPABASE_URL: "",        // z.B. "https://abcxyz.supabase.co"
  SUPABASE_ANON_KEY: "",   // der lange "anon public" Schlüssel

  // Name der gemeinsamen Liste. Wer denselben Namen nutzt, teilt dieselbe
  // Liste. Du kannst das frei wählen, z.B. "familie-sturm".
  LIST_ID: "haushalt"
};
