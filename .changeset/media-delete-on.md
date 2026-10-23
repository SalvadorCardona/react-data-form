---
"react-data-form": minor
---

`MediaObjectInputController` : nouvelle option `deleteOn: "immediate" | "never"`, une seule politique pour la croix, le choix d'un nouveau fichier et l'éditeur d'image. Par défaut (`"never"`), rien de ce qui est déjà stocké n'est touché avant l'enregistrement du formulaire : la croix détache seulement le média (plus de `port.remove`), un nouveau fichier crée un nouveau média, et l'éditeur d'image envoie l'image retouchée comme un nouveau média au lieu d'appeler `port.replace` ; le nettoyage des médias orphelins revient à l'API. Avec `"immediate"`, la croix demande une confirmation puis appelle `port.remove`, un nouveau fichier supprime celui qu'il remplace, et l'éditeur remplace le fichier sur place. Les éléments de `MediaObjectGalleryInputController` utilisent toujours `"immediate"` (avec confirmation). Nouveaux libellés : `deleteConfirmTitle`, `deleteConfirmDescription`, `deleteConfirm`, `deleteCancel`.
