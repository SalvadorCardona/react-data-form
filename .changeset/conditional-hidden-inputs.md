---
"react-data-form": minor
---

Champs conditionnels : `hidden` reçoit désormais les données du formulaire et le formulaire lui-même, `hidden(data, form)`, typés par `Data` (`FormInputInterface` prend un second paramètre de type `Data`). Un champ peut ainsi n'apparaître que selon la valeur d'un autre (« Société » seulement si « Type = pro ») ; les fonctions sans argument restent acceptées. Un champ masqué n'est plus validé du tout par `validateForm` (`required`, `min`, `max` et `validator`), ni comme sous-formulaire. Sa valeur est retirée des données envoyées à la soumission, sauf avec la nouvelle option `keepHiddenValue: true` ; un champ de `type: "hidden"` est toujours envoyé. `getDataFromForm` accepte l'option `{ withoutHiddenValues: true }` pour obtenir ces données.
