---
"react-data-form": patch
---

`DateInputController` traite la valeur comme un jour local, sans passer par UTC : une valeur à minuit heure locale (`2026-10-23T00:00:00+02:00`, celle que produit `DatePickerInputController`) ou `2026-10-23` s'affiche au 23 quel que soit le fuseau, au lieu du 22 en France. La valeur émise est l'ISO de minuit local (`formatISO`), le même format que `DatePickerInputController`. En lecture seule, seule la date est affichée (plus d'heure). Le contrôleur ne mute plus `formInput.type`.
