---
"react-data-form": patch
---

Correction de sécurité (XSS) : en lecture (`readonly: true` ou `action: "read"`), `WysiwygInputController` affichait la valeur HTML sans l'assainir, si bien qu'un contenu stocké côté API (`<img src="x" onerror="…">`, `<script>`…) exécutait du JavaScript chez celui qui le consultait. `WysiwygReader` passe désormais la valeur par `sanitizeHtml`, comme l'éditeur pour sa valeur initiale (et plus seulement au collage). `sanitizeHtml` est durci : `href` et `src` n'acceptent plus que `http:`, `https:`, `mailto:`, `tel:` et les URL relatives (`javascript:`, `data:`, `vbscript:`… sont retirés), et les liens `target="_blank"` reçoivent `rel="noopener noreferrer"`. Sans DOM (rendu serveur), le HTML est échappé au lieu d'être rendu tel quel.
