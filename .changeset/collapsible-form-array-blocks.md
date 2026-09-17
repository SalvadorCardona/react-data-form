---
"react-data-form": minor
---

Les blocs d'un `FormArrayInputController` se replient.

- Chaque en-tête de bloc porte un chevron qui masque son sous-formulaire :
  la poignée de drag, l'ordre et le libellé restent, donc une page longue se
  réordonne sans dérouler son contenu. Le bouton porte `aria-expanded` et un
  `aria-label` traduit par les clés `collapse` / `expand`.
- Replier est un état d'affichage : il ne passe jamais par `onChange` et ne
  rentre pas dans la valeur du formulaire.
- Nouvelle option `closedByDefault` sur
  `createFormArrayInputController({ closedByDefault: true })` : la liste monte
  entièrement repliée, les blocs ajoutés ensuite aussi — sauf celui qu'on vient
  d'insérer, qui s'ouvre.
