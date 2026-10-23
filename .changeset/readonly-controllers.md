---
"react-data-form": patch
---

`BooleanInputController`, `SwitchInputController`, `CheckboxInputController`, `MultiSelectSearchInputController`, `DateRangeInputController`, `FileInputController` et `IconInputController` respectent désormais `readonly`, y compris via `action: "read"` : la case et l'interrupteur sont contrôlés par la valeur du formulaire et passent en lecture seule, `MultiSelectSearchInputController` transmet `readonly` à `ComboboxMulti`, le champ fichier est désactivé, la plage de dates et l'icône s'affichent en texte. L'écran ne montre plus de changement que le formulaire refuse d'enregistrer.
