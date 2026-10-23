---
"react-data-form": patch
---

`useForm` ne modifie plus son état en place : `onChange`, `validate`, le chargement de `asyncData` et `form.loading` produisent un nouvel objet, sans toucher au formulaire déjà rendu (`updateFormByFormInput` et `validateForm` ne modifient plus le formulaire ni les champs reçus). Plusieurs `onChange` dans le même tick (comme `DateRangeInputController`) se cumulent sans s'appuyer sur une mutation. `updateData` et `updateForm` ne remontent plus tous les champs : la clé de rendu ne dépend plus de `form.version`, seul un champ dont la valeur a changé est remonté — le champ qui a le focus le garde, et l'état local des autres champs est conservé. Aucun avertissement `react-hooks/exhaustive-deps` ne reste.
