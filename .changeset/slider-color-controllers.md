---
"react-data-form": minor
---

Deux nouveaux contrôleurs. `SliderInputController` : curseur entre `min` et `max` (0 et 100 par défaut), au pas de `step` (1 par défaut), valeur affichée à côté ; `range: true` donne deux poignées et une valeur `[début, fin]`, nommées `Minimum` et `Maximum` (traduisibles). `ColorInputController` : `<input type="color">` doublé d'un champ de code hexadécimal (libellé traduisible `Hexadecimal code`), qui accepte `#abc` comme `#aabbcc` et enregistre toujours `#aabbcc` ; `valueOptions` ajoute une palette de couleurs proposées. En lecture seule, le curseur affiche sa valeur en texte, la couleur une pastille suivie de son code. Le libellé d'un champ porte désormais l'id `<id du champ>-label`, que le curseur référence.
