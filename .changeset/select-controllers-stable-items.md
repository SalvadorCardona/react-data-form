---
"react-data-form": patch
---

`SelectRadioInputController`, `SelectCardInputController`, `SelectButtonInputController` : les options ne sont plus démontées à chaque sélection — leurs composants sont définis au niveau du module et `SelectInputController` ne met plus la valeur dans la `key` des options. Le focus clavier reste sur l'option choisie après un clic ou Espace. Ces contrôleurs, comme `SelectTimeInputController`, ne modifient plus le `formInput` reçu. Le radio est un vrai groupe accessible : `role="radiogroup"`, navigation aux flèches, un seul radio atteignable avec Tab, ids uniques (`useId`) et libellé relié à chaque bouton ; il n'étale plus `formInput`/`onChange` sur le `<button>`. `SelectItemPropsInterface` reçoit désormais `formInput` (optionnel).
