---
"react-data-form": minor
---

`useForm` affiche les erreurs renvoyées par l'API : quand `form.onSubmit` ou le `onSubmit` du hook rejette avec un objet portant `violations` (forme `ApiJsonLdError`), les violations sont posées sous leurs champs (ou en tête de formulaire via `form.errors`) par `addErrorFromViolations`, le chargement s'arrête et `onSubmit()` résout à `undefined`. La nouvelle option `onError(error, form)` reçoit l'erreur d'origine (pour un toast) ; une erreur sans violations et sans `onError` est relancée. `setFormConfig({ extractViolations })` lit d'autres formats (`error.response.data`, `error.body`, FastAPI, Django…) ; `setFormConfig` accepte désormais une configuration partielle. Les erreurs de formulaire posées par un envoi raté sont effacées au suivant. `addErrorFromViolations` est générique sur `Data` et ne mute plus les champs du formulaire reçu.
