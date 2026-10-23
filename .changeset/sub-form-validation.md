---
"react-data-form": minor
---

La soumission d'un formulaire valide désormais ses sous-formulaires : les `validator` et `required` des champs d'un input `form` (`FormInputController`) et de chaque bloc d'un `FormArrayInputController` bloquent l'envoi, et leurs violations s'affichent sous les bons champs. Un bloc replié invalide est ouvert pour montrer ses violations. `useForm` expose `validate()` et `registerSubForm(validate)`, et `FormInputController` accepte `validateOnMount`. Un sous-formulaire rend un `<fieldset>` au lieu d'un `<form>` imbriqué dans celui du parent.
