---
"react-data-form": patch
---

`form.onSubmit` asynchrone est désormais attendu : le chargement (et le bouton désactivé) couvre tout l'envoi, et le `onSubmit` passé à `useForm` reçoit les données résolues au lieu d'une Promise. Le type devient `(data) => Data | Promise<Data | void> | void` ; une valeur de retour vide conserve les données saisies.
