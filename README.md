<p align="center"><img src=".readme/logo.svg">
  <br><br>
<img src="https://img.shields.io/badge/License-GPL%20v3-blue.svg">

# Overview
Showcase GitHub profiles and repositories on your website with beautiful, dynamic embed tiles. GitGlue uses GitHub's API to fetch real-time data, so your embeds always stay up to date. Display profiles, single repositories, or browse all repositories from a user with built-in search.

## Usage
Include the script on your page - the CSS is loaded automatically:

```html
<script src="https://bbdaniels.github.io/GitGlue/GitHubPinner.js"></script>

<!-- Profile card -->
<div data="https://github.com/username" class="github-pinner" style="visibility: hidden;"></div>

<!-- Repository card -->
<div data="https://github.com/username/repo" class="github-pinner" style="visibility: hidden;"></div>

<!-- All repositories with search -->
<div data="https://github.com/username?tab=repositories" class="github-pinner" style="visibility: hidden;"></div>
```

### Flat Style Variant
Add the `flat` class for an alternative style with a green follow button:

```html
<div data="https://github.com/username" class="github-pinner flat" style="visibility: hidden;"></div>
```

## Demo
View the live demo at [bbdaniels.github.io/GitGlue](https://bbdaniels.github.io/GitGlue/)

## Preview
<p align="left"><img src=".readme/profile-example.png" width="550px"><br>
<img src=".readme/repo-example.png" width="1000px"></p>
