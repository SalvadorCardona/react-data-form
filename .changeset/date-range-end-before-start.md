---
"react-data-form": patch
---

`createDateRangeFormInput` : une fin antérieure (ou égale) au début est désormais une règle de validation locale. Le champ porte un `validator` qui lit `startKey`/`endKey` dans les données du formulaire : la soumission est bloquée et « The end date must be after the start date » s'affiche sous le champ, avec `propertyPath` égal à `endKey`. Avant, le message n'était qu'affiché et la plage invalide partait à l'API. Pour cela, `validator` reçoit les données du formulaire en second argument (`validator(value, data)`), et une `Error` levée par un validator peut nommer sa propriété via `propertyPath`.
