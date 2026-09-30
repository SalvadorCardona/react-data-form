---
"react-data-form": patch
---

Documente que `useForm` ne lit `form` qu'au premier rendu, comme
`defaultValue` : repasser un autre objet ensuite n'a aucun effet. Pour changer
de déclaration, appeler `updateForm` (les valeurs saisies sont conservées) ou
remonter le composant avec une nouvelle `key`. JSDoc de `useForm` et README à
jour.
