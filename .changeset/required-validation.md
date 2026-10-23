---
"react-data-form": minor
---

`required: true` est désormais validé : `validateForm` ajoute la violation traduisible « This field is required » à un champ requis vide (`undefined`, `null`, `""`, `[]`), quel que soit son contrôleur, et la soumission est bloquée. `false` et `0` ne sont pas considérés comme vides. Les champs masqués (`type: "hidden"`, `hidden()` vrai), les `generatedValue` et les champs hors du groupe/étape courant ne sont pas contrôlés. Le `validator` d'un champ requis vide n'est pas exécuté.
