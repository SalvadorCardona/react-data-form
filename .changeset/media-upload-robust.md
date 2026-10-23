---
"react-data-form": patch
---

`MediaObjectInputController` : une lecture de fichier ratée n'envoie plus rien. L'envoi part de `onload` et non plus de `onloadend`, qui se déclenchait aussi après une erreur et appelait `port.upload({ base64: null })` juste après le message `readFailed`. Un seul envoi à la fois : pendant la lecture et l'envoi, l'input est désactivé, la zone (marquée `aria-busy`) n'ouvre plus le sélecteur et ignore les fichiers déposés, ce qui évite qu'une réponse arrivée dans le désordre écrase la valeur et laisse un média orphelin.
