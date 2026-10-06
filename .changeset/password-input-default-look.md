---
"react-data-form": patch
---

`PasswordInputController` reprend le rendu des autres champs texte : même
`Input` que `DefaultInputController` (hauteur, rayon, fond, bordure, focus),
sans cadenas ni placeholder `"..."` par défaut. Le bouton œil est centré sur
l'input (`z-10`) et ses libellés passent par `translate`. L'id par défaut
devient `formInput.id ?? formInput.name`, pour que mot de passe et
confirmation n'aient plus le même id.
