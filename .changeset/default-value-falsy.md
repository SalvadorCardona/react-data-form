---
"react-data-form": patch
---

`createForm` : un `defaultValue` qui vaut `0`, `false` ou `""` est désormais appliqué. Il était ignoré parce que le test portait sur sa véracité : un switch par défaut à `false` ou un compteur à `0` partaient à `undefined` et manquaient dans les données envoyées. Seul un `defaultValue` absent (`undefined`) est ignoré.
