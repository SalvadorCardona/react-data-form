---
"react-data-form": patch
---

Le bouton d'envoi par défaut et la soumission par Entrée ne laissent plus de `unhandledrejection` quand `onSubmit` rejette sans `onError` : le formulaire réapparaît avec les valeurs saisies, et le rejet reste disponible pour qui appelle `formContext.onSubmit()`.
