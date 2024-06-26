# Makefile.md

```mermaid
graph TD
  default --> clean
  default --> npm
  default --> elm-build
  default --> typescript

  test --> mocha-test
  mocha-test --> default
  test --> elm-test

  count

  _["graph"]

  install --> package

  elm-debug --> elm-local-install
  elm-local-install --> npm
```
