---
"react-data-form": minor
---

Retour après une soumission : quand la validation échoue, `FormErrors` affiche `label.error` (traduit) avec `role="alert"`, puis fait défiler jusqu'au premier champ en erreur, dans l'ordre d'affichage, et lui donne le focus. Après un envoi réussi, `label.success` s'affiche dans une zone `aria-live="polite"`, vidée dès qu'une valeur change ; `showSuccess: false` (par formulaire ou via `setFormConfig`) la masque pour les applications qui affichent leur propre toast. Le contexte expose `submitResult` (`{ status: "success" | "error" }`), et chaque champ en erreur porte `data-invalid`.
