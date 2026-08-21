---
"@animalink/form": minor
---

Première publication : extraction des packages `form`, `formGroup`, `formMedia`
et `formStep` du monorepo Animalink vers une librairie autonome.

- Point d'entrée unique `@animalink/form` avec les sous-chemins `/group`,
  `/media`, `/step`, `/i18n` et `/registry`.
- Les couplages à l'application hôte passent désormais par des ports injectés
  (`configurePorts`) : upload de médias, libellé d'une IRI, logo du loader.
- Les composants d'interface nécessaires sont embarqués : la librairie
  fonctionne sans dépendance vers un design system externe.
