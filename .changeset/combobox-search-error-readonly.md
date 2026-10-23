---
"react-data-form": patch
---

`ComboboxMulti` (donc `SelectSearchInputController`, `MultiSelectSearchInputController` et les champs relationnels) : si `onSearch` rejette, le loader s'arrête et le message traduisible `Unable to load the options.` s'affiche à la place de « Nothing found » ; la recherche est relancée à la prochaine ouverture. Vider la recherche relance `onSearch("")`. En lecture seule, chaque valeur est rendue en badge avec son libellé, ou via le port `iriLabel` pour une IRI sans option, au lieu d'un champ vide. `{{count}} selected` et `Search...` passent par la traduction, et la liste des options suit la sélection sans remontage.
