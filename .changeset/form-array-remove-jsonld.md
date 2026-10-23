---
"react-data-form": patch
---

`FormArrayInputController` : la corbeille retire de nouveau un bloc JSON-LD qui ne porte que `@id` (chargé depuis API Platform) — la recherche se faisait dans la colonne `id` avec la valeur de `@id` et ne trouvait rien. Un bloc sans `id` ni `@id` (le bloc vide initial, par exemple) est désormais retiré lui aussi.
