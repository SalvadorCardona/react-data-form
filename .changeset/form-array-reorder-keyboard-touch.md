---
"react-data-form": minor
---

`FormArrayInputController` : les blocs se réordonnent sans glisser-déposer HTML5. Chaque en-tête porte des boutons « Monter » / « Descendre » (`Move up`, `Move down`, traduits dans `fr`), désactivés aux extrémités ; la poignée (`draggable`) devient focusable (`role="button"`) et déplace son bloc aux flèches ↑/↓, et suit le doigt sur écran tactile (Pointer Events). Le focus suit le bloc déplacé. Tout déplacement réindexe `identifierKey` de 0 à n-1, sans doublon : le champ `#` place désormais le bloc à la position saisie, validée à la perte de focus ou sur Entrée (`BlockOrderInput`), au lieu d'écrire la valeur brute à chaque frappe.
