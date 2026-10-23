---
"react-data-form": patch
---

`WysiwygInputController` : l'extension Link n'est plus déclarée deux fois (StarterKit l'embarque depuis TipTap 3), ce qui supprime l'avertissement `[tiptap warn]: Duplicate extension names found: ['link']`. Le lien se configure via `StarterKit.configure({ link })`, sans changement de rendu. Le placeholder vient de `formInput.placeholder`, sinon de la clé traduisible `Start writing something great…`. L'éditeur suit désormais une valeur changée de l'extérieur (`setContent` sans émettre `onChange`), au lieu de ne lire `value` qu'au montage.
