---
"react-data-form": patch
---

Formulaire par étapes : le compteur affiche la position de l'étape dans la liste triée (« Step 1 of 2 ») et non plus son `order` (on lisait « Step 10 of 2 » avec des `order` espacés). Le bouton suivant n'affiche plus « Continuer » en dur : il passe par `<Trans>` avec la clé anglaise **`Next`** — les applications qui traduisaient la clé `Continue` (jamais lue) doivent traduire `Next` à la place. Le badge `Invalid Form` (aucune étape) passe aussi par la traduction.
