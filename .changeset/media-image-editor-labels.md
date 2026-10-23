---
"react-data-form": minor
---

`ImageEditor` lit ses textes dans les labels de `MediaObjectProvider` : nouvelles clés `editorTitle`, `editorDescription`, `editorZoom`, `editorRotation`, `editorRotateLeft`, `editorRotateRight`, `editorCancel` et `editorSave` (anglais par défaut). Un échec de l'éditeur passe par `port.onError` avec `labels.editFailed` au lieu d'un toast sonner, et `sonner` sort des dépendances. `ImageEditor` doit donc être rendu sous un `MediaObjectProvider`.
