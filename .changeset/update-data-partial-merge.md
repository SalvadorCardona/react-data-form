---
"react-data-form": patch
---

`updateData(data)` (mode partiel, par défaut) fusionne de nouveau `data` avec les valeurs courantes : les champs absents de `data` gardent leur valeur au lieu de passer à `undefined`. `updateData(data, false)` remplace toujours toutes les valeurs. Le type accepte désormais `Partial<Data>`. Le patch de `dist/` appliqué par leadz-ninja (`patches/react-data-form@0.2.1.patch`) peut être retiré.
