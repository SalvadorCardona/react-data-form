---
"react-data-form": patch
---

`createForm` ne partage plus de tableau ni d'objet avec `getFormConfig().defaultForm` : chaque formulaire a ses propres `errors`, `label`, `inputs`… (les composants et fonctions restent les mêmes). Une erreur poussée dans un formulaire n'apparaît plus dans les autres. `setFormConfig` remplace désormais les tableaux (`groups`, `errors`…) au lieu de les concaténer : l'appeler deux fois ne duplique plus rien.
