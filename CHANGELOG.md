## [1.3.3](https://github.com/yuki153/react-spatial-navigation/compare/v1.3.2...v1.3.3) (2024-02-20)

## [1.3.2](https://github.com/yuki153/react-spatial-navigation/compare/v1.3.1...v1.3.2) (2024-01-26)


### Bug Fixes

* error by duplicated focusKey ([4806cfa](https://github.com/yuki153/react-spatial-navigation/commit/4806cfa20774654532dcaabaeeb7337142a5a924))
* mistaken condition ([3076b97](https://github.com/yuki153/react-spatial-navigation/commit/3076b972df8a63edf58d2913369061a41bfdf3ec))
* probrem  occurred by react18 ([26ecbb2](https://github.com/yuki153/react-spatial-navigation/commit/26ecbb2524cf6977695329bdb4bcfe36284be871))
* type error ([35ff20a](https://github.com/yuki153/react-spatial-navigation/commit/35ff20a4d18d9bd72eb2c6b0f908c5c31035d808))

## [1.3.1](https://github.com/yuki153/react-spatial-navigation/compare/v1.3.0...v1.3.1) (2023-04-04)


### Performance Improvements

* ⚡️ omit the computation to get relative x,y coordinates ([fb4f9eb](https://github.com/yuki153/react-spatial-navigation/commit/fb4f9eb05e870c9cbd49f034b56cb3e5c00a3d70))
* ⚡️ optimization of heavily loaded updateLayout ([abf0b0a](https://github.com/yuki153/react-spatial-navigation/commit/abf0b0a5098b0fc866c8cfa13db3d585b593e186))
* ⚡️ updateLayout is only called for components affected by navigation ([d8039f3](https://github.com/yuki153/react-spatial-navigation/commit/d8039f3e71522c6adc1e12999289616916464b3c))

## [1.3.0](https://github.com/yuki153/react-spatial-navigation/compare/v1.2.7...v1.3.0) (2023-03-29)


### Features

* 🎸 add useFocusable ([37314a2](https://github.com/yuki153/react-spatial-navigation/commit/37314a24646b13a1fc2d5277134686087e3518f9))


### Code Refactoring

* 💡 removed some properties from focusableProps ([7e3f4da](https://github.com/yuki153/react-spatial-navigation/commit/7e3f4daa406da50ad626006a1228f8473f3b2897))


### Documentation

* ✏️ add README.md for English ([cbc81af](https://github.com/yuki153/react-spatial-navigation/commit/cbc81afb129cf7b9ea13ac11d90ca67f8f416e36))

## [1.2.7](https://github.com/yuki153/react-spatial-navigation/compare/v1.2.6...v1.2.7) (2023-02-18)


### Bug Fixes

* 🐛 no propagation back key event when not focus components ([c60dcfb](https://github.com/yuki153/react-spatial-navigation/commit/c60dcfbfb906b666d8238718e8fcb2ea79d437a2))

## [1.2.6](https://github.com/yuki153/react-spatial-navigation/compare/v1.2.5...v1.2.6) (2023-02-06)


### Bug Fixes

* 🐛 hasFocusedChild not updated when mount components first ([6904d3b](https://github.com/yuki153/react-spatial-navigation/commit/6904d3b7a24776cbdfcb630b428c0b0d36c5acb2))

## [1.2.5](https://github.com/yuki153/react-spatial-navigation/compare/v1.2.4...v1.2.5) (2022-11-30)


### Documentation

* ✏️ fix how to debug ([85768f9](https://github.com/yuki153/react-spatial-navigation/commit/85768f9f982872e1e8e5a7b027853e93e20a6b8e))
* ✏️ fix typo ([9b9348c](https://github.com/yuki153/react-spatial-navigation/commit/9b9348cc4df720753976aabc785d2e5651c364b3))

## [1.2.4](https://github.com/yuki153/react-spatial-navigation/compare/v1.2.3...v1.2.4) (2022-11-30)


### Documentation

* ✏️ how to debug ([35c7101](https://github.com/yuki153/react-spatial-navigation/commit/35c710178989ac0e4a37f7977c9bd686fbb7a2a5))

## [1.2.3](https://github.com/yuki153/react-spatial-navigation/compare/v1.2.2...v1.2.3) (2022-11-30)


### Bug Fixes

* 🐛 setKeyMap method arg type ([a4b74a0](https://github.com/yuki153/react-spatial-navigation/commit/a4b74a0ff70f376b80148ddd8db33d713f090f8e))


### Code Refactoring

* 💡 improve visibility to console log ([8317b4e](https://github.com/yuki153/react-spatial-navigation/commit/8317b4e4b10c8ba90822924a008d820d7d3ba34b))

## [1.2.2](https://github.com/yuki153/react-spatial-navigation/compare/v1.2.1...v1.2.2) (2022-11-25)


### Reverts

* Revert "fix: 🐛 focusKey not null when removing focusable component" ([cff6dfc](https://github.com/yuki153/react-spatial-navigation/commit/cff6dfc9fb169c058cebb720f17add9596d0aa8b))

## [1.2.1](https://github.com/yuki153/react-spatial-navigation/compare/v1.2.0...v1.2.1) (2022-11-17)


### Performance Improvements

* ⚡️ return the memorized FocusableComponent ([f05e17f](https://github.com/yuki153/react-spatial-navigation/commit/f05e17f5c4643cf579b394a0de7d9eaac96833c1))

## [1.2.0](https://github.com/yuki153/react-spatial-navigation/compare/v1.1.5...v1.2.0) (2022-11-17)


### Features

* 🎸 add autoDelayFocusToChild option ([fb1077b](https://github.com/yuki153/react-spatial-navigation/commit/fb1077b1f49b28e40f00d7c8f3254664675efe6d))


### Performance Improvements

* ⚡️ HOC が return するコンポーネントに渡す props 等々を memo 化する ([2b99dbb](https://github.com/yuki153/react-spatial-navigation/commit/2b99dbb361fe0d89c0bde0331db0d1787a47c803))

## [1.1.5](https://github.com/yuki153/react-spatial-navigation/compare/v1.1.4...v1.1.5) (2022-11-11)

### Bug Fixes

* 🐛 focusKey not null when removing focusable component ([58f9569](https://github.com/yuki153/react-spatial-navigation/pull/27/commits/58f95699f5781a5121c6983d21eeb8a8e7035fa7))

### Features

* 🎸 add getCurrentFocusKey in FocusableProps ([9963927](https://github.com/yuki153/react-spatial-navigation/pull/27/commits/9963927f21d0e76d807bf0a9d51579d0699ba8a0))

## [1.1.4](https://github.com/yuki153/react-spatial-navigation/compare/v1.1.3...v1.1.4) (2022-10-24)


### Code Refactoring

* 💡 Add Direction, PublicComponentProps to export type ([971ce4f](https://github.com/yuki153/react-spatial-navigation/commit/971ce4fe99760d71caca3f1b13b11340ab5f1a43))

## [1.1.3](https://github.com/yuki153/react-spatial-navigation/compare/v1.1.2...v1.1.3) (2022-07-11)


### Bug Fixes

* 🐛 props として渡される関数内の state が更新されない ([d859833](https://github.com/yuki153/react-spatial-navigation/commit/d8598334d2b9af8d044fe31bc36178d0d90b12ed))

## [1.1.2](https://github.com/yuki153/react-spatial-navigation/compare/v1.1.1...v1.1.2) (2022-07-08)


### Code Refactoring

* 💡 fix type definition of className in FocusableProps ([9c5f976](https://github.com/yuki153/react-spatial-navigation/commit/9c5f9761e4f69e068b5abd876306ca35efe2622e))


### Documentation

* ✏️ wrote about onBackPress, WrappedComponent props ([b11a43f](https://github.com/yuki153/react-spatial-navigation/commit/b11a43f35903fe3e5cafe3d2e77c7545ef0f7a35))

## [1.1.1](https://github.com/yuki153/react-spatial-navigation/compare/v1.1.0...v1.1.1) (2022-07-06)



