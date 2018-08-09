# PAGE DOWNLOADER
The third project in scope of "Backend JS Programmer (Node.js)" course on [Hexlet](https://en.hexlet.io/)

[![Maintainability](https://api.codeclimate.com/v1/badges/a99a88d28ad37a79dbf6/maintainability)](https://codeclimate.com/github/codeclimate/codeclimate/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a99a88d28ad37a79dbf6/test_coverage)](https://codeclimate.com/github/codeclimate/codeclimate/test_coverage)
[![Build Status](https://travis-ci.org/ydanilin/project-lvl3-s262.svg?branch=master)](https://travis-ci.org/ydanilin/project-lvl3-s262)

Command-line tool to download a webpage along with style, pictures, JavaScript and other assets.  
Links to such assets are replaced automatically to point to resources saved as local files on paths relative to *.html location.

## Prerequisites:
* Node.js

## Run (also possible without installation)
```sh
npx pageloader-dan-hexlet [options] <url>
```
## Installation
```sh
npm i -D pageloader-dan-hexlet
```
## Usage:
```sh
page-downloader [options] <url>

Options:

  -V, --version       output the version number
  -o, --output [dir]  output directory
  -h, --help          output usage information
```
