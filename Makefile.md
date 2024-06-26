# Makefile.md

```mermaid
graph TD
  default --> clean
  default --> npm
  default --> elm-build
  default --> typescript

  test --> default

  count

  _["graph"]

  install --> package

  elm-debug --> elm-local-install
  elm-local-install --> npm
```
