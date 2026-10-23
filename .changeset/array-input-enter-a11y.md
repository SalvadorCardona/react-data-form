---
"react-data-form": patch
---

`ArrayInputController` : Entrée ajoute la valeur sans plus soumettre tout le formulaire (`preventDefault`), et le champ de saisie, désormais contrôlé, se vide après l'ajout. Ajout et retrait sont de vrais `<button type="button">`, focusables au clavier, avec un `aria-label` traduisible (`Add`, `Remove {{value}}`) ; le message « Minimum {{min}} characters » passe aussi par `translate`. En `readonly`, seuls les tags sont affichés, et la liste suit désormais `formInput.value`.
