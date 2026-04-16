# Design System Hub

This repository is now organized as one hub site with multiple publishable modules.

## Structure

- `index.html`
  - Hub homepage. This is the top-level entry for GitHub Pages.
- `sites/`
  - Static modules that are safe to publish directly.
- `sites/apple-spec/`
  - Apple specification module and its static assets.
- `apps/`
  - Source applications that need a build step before publishing.
- `apps/design-md/`
  - React + Vite source for the `设计体系总览` module.
- `sites/design-md/`
  - Built output of `apps/design-md`, published as a static module.
- `.github/workflows/deploy-pages.yml`
  - GitHub Pages workflow. It builds app modules and publishes only `index.html` plus `sites/`.

## Current Top-Level Tags

1. `总站首页`
2. `苹果规范`
3. `设计体系总览`
4. `平台规范库` (placeholder)
5. `组件资产库` (placeholder)
6. `待扩展主题` (placeholder)

## Rule For Adding A New Tag

1. Decide whether the new module is static or needs a build step.
2. If it is static, create `sites/<module-name>/index.html`.
3. If it needs a framework, create source under `apps/<module-name>/`.
4. Build the framework output into `sites/<module-name>/`.
5. Add the new tag link to:
   - root `index.html`
   - any existing module pages that should share the global nav
6. If the module needs building in CI, update `.github/workflows/deploy-pages.yml`.

## Publish Model

GitHub Pages publishes:

- `index.html`
- `sites/`

That means source code under `apps/` stays in the repo for maintenance, while users only access the publishable site structure.
