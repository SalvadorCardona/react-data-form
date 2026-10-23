---
"react-data-form": patch
---

Champ nombre (`type: "number"`, `NumberInputController`) : un champ vidé enregistre désormais `null` au lieu de `0`, et une saisie partielle (`-`) ne stocke jamais `NaN`. `min`/`max` ne corrigent plus silencieusement la valeur pendant la frappe (l'écran et la valeur stockée divergeaient) : la valeur reste celle affichée et `validateForm` ajoute une violation traduisible — `This value should be greater than or equal to {{min}}` ou `This value should be less than or equal to {{max}}` — qui bloque la soumission.
