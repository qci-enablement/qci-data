# Ebooks

[![Netlify Status](https://api.netlify.com/api/v1/badges/8ac0ec81-c767-4117-abfa-23b81f2ad733/deploy-status)](https://app.netlify.com/sites/learn-qci/deploys)

Publish pages on the enablement website as ebooks

## Supported files

Those files are converted to webpages

- Jupyter Ebook
- Sphinx Docs

## Routing

`File Path` is used as `Page path`

## Main Branches

- `main` : published to staging at: https://qci-preview.netlify.app/
- `prod`: published to prod at: https://quantumcomputinginc.com/

## How to Edit/Add files

1. Create a sub-branch from `main`
2. Create a PR against `main` and go through the approval process
3. Once the preview approved, merge `main` branch (or your current branch) to the `prod` branch.
