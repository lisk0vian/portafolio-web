# Product

<!-- impeccable:product-schema 1 -->

The shared portfolio product record is maintained in `../PRODUCT.md`. This app-specific record captures only the web facts required for design and must not override the shared source.

## Platform

web

## Stack

Astro 7, Tailwind CSS 4, TypeScript.

## Users

Recruiters and hiring teams evaluating Jerremi Aron Chancan Labajos for software-engineering and data-science roles.

## Product Purpose

A bilingual personal portfolio. Visitors should understand the two professional profiles quickly, then contact the owner or download the CV.

## Positioning

One person with two equally important editions, Engineering and Data. The portfolio includes project case studies and an interactive terminal that exposes the same portfolio information.

## Operating Context

Spanish is the default at `/`; English is under `/en/`. The site is built in `web/` and receives content from the API or local mock data.

## Capabilities and Constraints

Preserve the existing profile switch, terminal, language and theme controls, portfolio content, and working route behavior. This design scope covers the home page and case-study pages; certification and design-system pages remain functional and outside the visual redesign.

## Brand Commitments

The voice is professional and personal. Do not invent personal, career, customer, or business claims. Shared product and brand facts remain governed by `../PRODUCT.md`.

## Evidence on Hand

The name and contact links in `src/data/site.ts` are real. Project names, outcomes, metrics, employers, publications, and education in `src/data/content.ts` are placeholders; they may appear only as clearly demonstrative sample content in this design. The portrait and CV are not present in `public/`.

## Product Principles

1. Make both professional profiles legible quickly.
2. Put work and its explanation ahead of a list of tools.
3. Keep contact and CV actions easy to find.
4. Do not present placeholder content as verified experience.
