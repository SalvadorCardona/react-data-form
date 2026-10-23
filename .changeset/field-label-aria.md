---
"react-data-form": patch
---

Accessibilité des champs : `SelectInputController` (déclencheur), `DatePickerInputController`, `TimeInputController`, `PriceInputController`, `DurationInputController` (heures), `AutocompleteInputController`, `IconInputController`, `FileInputController`, `MomentInputController` (date) et `DateRangeInputController` (date de début) placent `formInput.id` sur leur élément interactif : le `<label for>` posé par `FormInputGroupProvider` les nomme, et cliquer dessus donne le focus. Le groupe ajoute au contrôle `aria-invalid="true"` quand le champ a une violation, `aria-describedby` vers sa description puis ses messages d'erreur, et `aria-required` sur un champ obligatoire ; l'astérisque `*` du libellé est `aria-hidden`. Les contrôleurs qui portaient déjà l'id (champ texte, mot de passe, recherche, textarea, case à cocher, switch, radio) reçoivent aussi ces attributs.
