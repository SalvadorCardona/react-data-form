---
"react-data-form": patch
---

`MediaObjectGalleryInputController` : un média supprimé disparaît aussitôt de la liste, au lieu de revenir sous forme de case de dépôt vide parce que la galerie était relue avant la fin de `port.remove`. Si `port.gallery.read` rejette au chargement, `port.onError` reçoit `galleryLoadFailed`, le message s'affiche, et « Retry » relit la galerie (il ne la recrée plus) ; ce bouton est un `type="button"` qui ne soumet plus le formulaire. `allowedExtension` est désormais appliqué aux médias de la galerie (attribut `accept` et contrôle du format), et la tuile de création n'annonce plus un glisser-déposer qu'elle ne gère pas (le libellé `galleryCreateHint` n'est plus affiché, il est déprécié). `MediaObjectInputController` : si `port.describe` rejette, `port.onError` reçoit le nouveau libellé `describeFailed` au lieu d'un rejet non géré.
