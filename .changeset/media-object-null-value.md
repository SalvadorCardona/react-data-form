---
"react-data-form": patch
---

`MediaObjectInputController` : une valeur `null` signifie désormais « pas d'image » au lieu de planter le rendu (`TypeError: Cannot convert undefined or null to object`). Le bouton « Delete the picture », qui repasse `null`, vide de nouveau le champ sans erreur, et un formulaire chargé avec `image: null` (cas courant avec API Platform) se monte normalement.
