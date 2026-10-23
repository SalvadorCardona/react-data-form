---
"react-data-form": patch
---

`MediaObjectInputController` : l'aperçu suit désormais `formInput.value` au lieu d'être figé au montage. Une valeur arrivée après coup (`asyncData`, `updateData`, réinitialisation) affiche son image, une valeur remplacée affiche la nouvelle, et une valeur repassée à `undefined`/`null` retire l'ancienne. Seul l'aperçu d'un fichier en cours d'envoi reste un état local, oublié dès que la valeur change. Même correction pour `MediaObjectGalleryInputController`, dont la galerie suit l'IRI de `formInput.value`.
