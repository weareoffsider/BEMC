# Change Log

All notable changes to this project will be documented in this file.

## Unreleased Changes

## 0.0.5 - 2014-12-03
### Fixed
- Null check added for blank atrules.

## 0.0.4 - 2014-12-03
### Added
- Linter now walks into media queries (was passing over them)
- Comments can be used to silence BEM on certain areas, using `bemc: on` and
  `bemc: off`

## 0.0.3 - 2014-11-29
### Fixed
- added detection for pseudo-modifier (:first-child, :hover, :active, etc)
- allowed element descendants of modified parents, ie .block:hover .block__elem

## 0.0.2 - 2014-11-29
### Fixed
- altered collection mechanism for blocks and contexts

## 0.0.1 - 2014-11-29
### Added
- initial release with basic rule support
- unnecessary specificity rules
- encapsulation rules
- state rules
- html tag rules
