---
"react-data-form": patch
---

`PasswordInputController` respecte `readonly` (et `required`) comme
`DefaultInputController`, et son bouton œil a un focus visible. `Input` neutralise
le fond et la couleur de texte imposés par Chrome sur un champ pré-rempli
(`:autofill`) : les champs texte (Email, Password…) gardent les couleurs du
thème, en clair et en sombre.
