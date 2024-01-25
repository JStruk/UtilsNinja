# ***UtilsNinja***

A simple, fast, and accessible grab bag of useful utilities for developers to use on the fly.

![Uptime Robot status](https://img.shields.io/uptimerobot/status/m796270451-f52443331f308fd73d37f833)
![Uptime Robot ratio (30 days)](https://img.shields.io/uptimerobot/ratio/m796270451-f52443331f308fd73d37f833)
[![Netlify Status](https://api.netlify.com/api/v1/badges/c96d4b19-1a5c-4383-b374-0fc05ecf7de5/deploy-status)](https://app.netlify.com/sites/celadon-beignet-3132dc/deploys)
![Node.js CI](https://github.com/JStruk/UtilsNinja/actions/workflows/node.js.yml/badge.svg)
![Contributors](https://img.shields.io/github/contributors/JStruk/UtilsNinja)
![Issues](https://img.shields.io/github/issues/JStruk/UtilsNinja)

# Development

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

## Compile and Hot-Reload for Development

```sh
npm run dev
```

## Type-Check, Compile and Minify for Production

```sh
npm run build
```

## Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

## Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run build
npm run test:e2e # or `npm run test:e2e:ci` for headless testing
```

## Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.
