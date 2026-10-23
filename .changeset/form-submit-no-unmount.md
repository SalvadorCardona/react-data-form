---
"react-data-form": minor
---

Formulaire simple : la soumission ne démonte plus le formulaire. Pendant l'envoi, les champs et les valeurs restent affichés et le bouton de soumission est désactivé, avec `aria-busy` et un petit loader. Le loader plein écran reste réservé au chargement initial (`ready === false`).
