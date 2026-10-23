---
"react-data-form": patch
---

`MediaObjectGalleryInputController` (et `MediaObjectDocumentGalleryInputController`) respecte désormais `readonly`, y compris via `action: "read"` : seules les vignettes sont affichées. L'emplacement d'ajout, les boutons de modification et de suppression et la tuile de création de galerie disparaissent, et le contrôleur n'appelle plus `upload`, `remove` ni `gallery.create` depuis une page en consultation. `readonly` est transmis à chaque élément de la galerie.
