---
"react-data-form": minor
---

Textes anglais par défaut et nouvelle entrée `react-data-form/i18n`.

- Sans dictionnaire, plus aucune clé technique à l'écran : les libellés de `FormArrayInputController` et de `AddFormBlockDialog` sont désormais du texte anglais, qui sert aussi de clé de traduction. Les applications qui traduisaient les anciennes clés doivent renommer : `form.array.add` et `form.array.add.title` → `Add a block`, `form.array.add.description` → `Pick the shape this entry takes.`, `drag` → `Drag`, `order` → `Order`, `collapse` → `Collapse the block`, `expand` → `Expand the block`, `remove` → `Remove`.
- Les libellés qui servaient de clé en français passent en anglais : `Afficher le mot de passe` → `Show password`, `Masquer le mot de passe` → `Hide password`, `Effacer la recherche` → `Clear search`, `Date de fin` → `End date`.
- Le bouton de soumission par défaut affiche `Create` (action `create`) ou `Save` (autres actions) au lieu de l'action brute ; `label.submit` reste prioritaire.
- `react-data-form/i18n` exporte `translationKeys` (toutes les clés que la librairie fait passer par `react-mini-i18n`, `label.success` et `label.error` par défaut compris) et `fr`, un dictionnaire français qui couvre exactement ces clés : `setTranslation({ ...fr, ...vosClés })`.
