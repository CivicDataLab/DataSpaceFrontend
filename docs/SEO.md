# 📈 CivicDataSpace – SEO Setup

A comprehensive SEO planning and implementation guide for CivicDataSpace

---

## SITE LEVEL SEO PLAN

### 1. Add `robots.txt`
Configure search engine crawler access.

---

### 2. Add `sitemap.xml`
Helps search engines discover important pages.

**Tool:** [`next-sitemap`](https://www.npmjs.com/package/next-sitemap)

**Static Links to be Generated:**
- Home Page
- Dataset Listing Page
- Usecase Listing Page
- Publisher Listing Page
- Sector Listing Page
- About-us Page
- Other Content Pages


**Dynamic Links to be Generated:**
- Dataset Details Page
- Usecase Details Page
- Publisher Details Page
- Sector Details Page
- Provider Dashboard Pages

---

## PAGE-LEVEL SEO PLAN


### ✅ SCHEMA MARKUP - Metadata 

| Prop         | Purpose                                                      |
|--------------|--------------------------------------------------------------|
| `title`      | Page title, shown in browser tab and Google result headline  |
| `description`| Short summary for search result snippet                      |
| `url`        | Absolute canonical URL of the page                           |
| `image`      | Preview image for OG and Twitter                             |
| `type`       | `website`, `article`, or `dataset`                           |
| `canonical`  |  Prevents duplicate content issues                           | 
| `og:title` | Same as `<title>` |
| `og:description` | Short summary |
| `og:image` | 1200×630 preview image |
| `og:url` | Canonical page URL |
| `og:type` | Content type: `website`, `article`, `profile` or `blog` (needs exploration) |
| `og:locale`| The locale meta tag defines the content language. The default is en_US. |
|`og:site_name` | The site name meta tag defines the name of your website|
| `twitter:card` | Use `summary_large_image` |
| `twitter:title` | Same as `og:title` |
| `twitter:description` | Same as `og:description` |
| `twitter:image` | Same as `og:image` |

---

## ✅ SCHEMA MARKUP – JSON-LD

Used to structure content for rich results in Google.[Ref Link](https://json-ld.org/playground/)

| Page          | Fields to be included in json                                    |
|------------------|--------------------------------------------------------|
| `Dataset Listing`           | TBD                                |
| `Dataset Details`         | TBD                                     |
| `About-us`      | TBD                        |
| `Publisher Listing`| TBD   |

---

## ✅ SEMANTIC HTML & ACCESSIBILITY

Make sure to use these semantic tags instead of div's

| Tag         | Purpose/Role                                                           |
| ----------- | ---------------------------------------------------------------------- |
| `<header>`  | Defines introductory content or navigational links for a page or section|
| `<nav>`     | Contains major navigation blocks/links                                  |
| `<main>`    | The main content unique to the page                                     |
| `<article>` | Encapsulates self-contained, reusable content (blog post, news item)    |
| `<section>` | Thematically groups related content (can include headers)               |
| `<aside>`   | Holds content tangentially related to the main content (sidebars)       |
| `<footer>`  | Contains content at the end of page/section (copyright, links)          |
| `<figure>`  | Groups media elements, typically with `<figcaption>`                    |
| `<details>` | For user-revealed additional info                                       |
| `<table>`   | Presents tabular data                                                   |


