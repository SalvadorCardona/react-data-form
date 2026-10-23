---
"react-data-form": minor
---

État « modifié » : le contexte de `useForm` expose `isDirty`, vrai dès que les valeurs diffèrent (comparaison profonde) de celles avec lesquelles le formulaire a été construit, chargé par `asyncData`/`getData` ou soumis avec succès, et `reset()`, qui remet ces valeurs et efface les violations. La nouvelle option `warnOnLeave: true` pose un `beforeunload` tant que le formulaire est modifié. Après une soumission réussie, `form.originalData` reçoit les données enregistrées, fusionnées sur l'enregistrement précédent (son id est conservé). `upsertForm` accepte l'option `keepOriginalData`.
