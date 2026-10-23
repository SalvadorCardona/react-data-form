---
"react-data-form": minor
---

`SelectInputController` : un champ non `required` propose en tête de liste une option vide traduisible (`None`) qui remet la valeur à `null` — sauf si `valueOptions` contient déjà une option de valeur `""` ou `null`. Une valeur absente de `valueOptions` (option retirée depuis, taux de TVA historique…) n'affiche plus le placeholder : elle est rendue telle quelle, ou via le port `iriLabel` si c'est une IRI, suivie de la mention traduisible `Current value`, dans le déclencheur, dans la liste et en lecture seule. Elle reste proposée dans la liste après avoir choisi une autre option. Les variantes à décorateur propre (`SelectCardInputController`, `SelectButtonInputController`, `SelectRadioInputController`) ne changent pas.
