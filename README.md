# grunt-google-fontface

> Fetch CSS files of fonts from Google.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-google-fontface --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-google-fontface');
```

## Google Fontface

### Overview

[Google Fonts][] is a good web site which you can get many beautiful custom fonts. You can reference them from **Google Fonts** directly or download them (**TTF** files) to your local storage then reference them. In second case, you have to configure CSS files which contain `@font-face` definiations for your local TTF files. This plugin will fetch these CSS configurations from **Google Fonts** and modify them to satisfy your needs.

### Options

#### url
Type: `String`
Default value: `https://fonts.googleapis.com/css`

The **URL** which you can fetch CSS files for your TTF files, although I think you won't change this option in most cases.

### Usage Examples

#### Generate a single CSS file

In this example, running `google_fontface:single_file` will generate a single CSS file which contains all `@font-face` definiations for your TTF files donwloaded from [Google Fonts][]. 

```js
grunt.initConfig({
    google_fontface: {
        single_file: {
            src: 'test/font/**/*.ttf',
            dest: 'test/css/font.css'
        }
    }
});
```

#### Generate a CSS file for each font

The font files you download from [Google Fonts][] are placed in different directories based on font name, so all TTF files related to a font are in same directory. In this example, running `google_fontface:multiple_files` will generate a CSS file which contains `@font-face` definiations for each font (directory).

```js
grunt.initConfig({
    google_fontface: {
        multiple_files: {
            src: 'test/font/**/*.ttf',
            dest: 'test/css/font/'
        }
    }
});
```

**NOTE**: The type of `dest` is directory instead of file.

#### Generate a directory contains CSS files for each font

In this example, running `google_fontface:multiple_files` will generate a directory which contains CSS files for each font. Each TTF file you download from [Google Fonts][] will have a CSS file contains its `@font-face` definiation.

```js
grunt.initConfig({
    google_fontface: {
        multiple_directories: {
            expand: true,
            cwd: 'test/font/',
            src: '**/*.ttf',
            dest: 'test/css/',
            extDot: 'last',
            ext: '.css'
        }
    }
});
```

[Google Fonts]: https://fonts.google.com/
