# react-data-form

## 0.2.0

### Minor Changes

- ee5b212: Initial release.

  - Entry point `react-data-form` with the `/group`, `/media` and `/step`
    subpaths.
  - Contact points with the host application go through injected ports
    (`configurePorts`): IRI label, loader brand, date locale, `Intl` locale and
    currency.
  - Translation is delegated to `react-mini-i18n` and the JSON-LD registry to
    `resource-registry`, both peer dependencies so their module-level singletons
    stay unique.
  - The interface components it needs are vendored in: no dependency on an
    external design system.
