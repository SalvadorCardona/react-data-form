---
"react-data-form": patch
---

fix: the `react-mini-i18n` peer accepts 0.2 (`^0.1.0 || ^0.2.0`), so `pnpm add react-data-form react-mini-i18n resource-registry` installs react-mini-i18n 0.2.0 instead of stopping on `ERESOLVE`

- In 0.x a caret pins the minor: `^0.1.0` ruled out react-mini-i18n 0.2.0, which only adds `initialTranslations` and a server render. 0.1 stays accepted, so an app still on it is not forced to move.
