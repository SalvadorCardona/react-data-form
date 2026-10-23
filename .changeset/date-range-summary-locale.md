---
"react-data-form": patch
---

fix: the summary under `DateRangeInputController` ("Selected range: …") no longer hard-codes the English "at" between date and time. It uses the long localised formats of the `dateLocale` port (`PPP`, `PPPp`), so a French app reads "2 novembre 2026 à 07:46" instead of "2 novembre 2026 at 07:46". Without a locale, date-fns keeps US English ("November 2nd, 2026 at 7:46 AM").

The colon after "Selected range" goes through the `"{{label}}:"` translation key, so a French app can set it off with a non-breaking space ("Période sélectionnée : …").
