---
"react-data-form": patch
---

`addErrorFromViolations` ne perd plus de violation : un `propertyPath` vide, ou qui ne correspond à aucun champ, va dans `form.errors` (affiché par `FormErrors`), et un chemin imbriqué (`address.street`, `items[0].name`, `items.0.name`) est posé sur le champ parent. `form.errors` est réinitialisé à chaque appel au lieu de s'accumuler. Le message de repli est désormais `"Invalid value"`, passé par `translate`.
