---
"react-data-form": patch
---

`useForm` : si `asyncData` (ou `form.getData`) rejette (404, 403, réseau…), le chargement s'arrête au lieu de tourner indéfiniment et la promesse rejetée n'est plus laissée sans gestion. `ready` passe à `true`, le contexte expose l'erreur dans `loadError`, le nouveau callback `onLoadError(error)` est appelé, et le formulaire porte l'erreur traduisible `Unable to load the data`. `FormDecorator` affiche alors cette erreur à la place des champs, pour ne pas proposer d'envoyer un formulaire vide.
