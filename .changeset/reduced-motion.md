---
"react-data-form": patch
---

Les loaders respectent `prefers-reduced-motion: reduce` : `Loader`, `LittleLoader`, `DotLoader`, `PageLoader` et les spinners `Loader2` des contrôleurs média et icône portent `motion-reduce:animate-none`, et `animate-spin-slow` s'arrête aussi dans `styles.css`. `FormStepDecorator` ne fait plus glisser ni fondre l'étape quand la préférence est activée (`useReducedMotion` de framer-motion). Les contournements côté application qui ciblaient les classes internes du loader (par exemple `.size-20:has(.loader-logo) > .animate-spin` dans leadz-ninja) peuvent être retirés.
