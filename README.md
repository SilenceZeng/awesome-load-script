# awesome-load-script

> awesome script loading for modern browsers, with promise

## Getting started

### Install

```shell
npm install awesome-load-script
# or
yarn add awesome-load-script
```

In browser:

```html
<script src="/path/to/load-script.js"></script>
```

### Usage

#### Syntax

```js
loadScripts(scriptUrl, options)
  .then(() => {})
  .catch((err) => {})
  .finally(() => {});
```

#### API

scriptUrl: string, URL of the script to load

options: object

```ts
interface LoadScriptOption extends Partial<HTMLScriptElement> {
  // noRepeat: if true, the script will not be loaded again if it has already been loaded
  noRepeat?: boolean; // default: false
  // autoRemove: if true, the script will be removed from the DOM after loading
  autoRemove?: boolean; // default: true
  // throw error when load script failed
  throwError?: boolean; // default: true
  // the name of script to expose to global
  exposeGlobalName?: string;
  // clean global value，will delete window[exposeGlobalName]
  cleanGlobal?: boolean;
}
```

the script will be loaded asynchronously, and the promise will be resolved when the script is loaded.

#### Example

```js
import loadScript from 'load-script';

export const loadWxScript = () =>
  // load script from cdn
  loadScript('https://res2.wx.qq.com/open/js/jweixin-1.6.0.js', {
    noRepeat: true,
    autoRemove: false,
    throwError: true,
    exposeGlobalName: 'wx',
    cleanGlobal: true,
  })
    .catch((error) => {
      console.log(error);
      // try load local script
      return loadScript('/js/jweixin-1.6.0.js?', {
        noRepeat: true,
      });
    })
    .then((res) => {
      return res;
    });
```

In browser:

```html
<script>
  loadScript('https://res2.wx.qq.com/open/js/jweixin-1.6.0.js')
    .then(() => {
      console.log(window.wx)
    });
</script>
```

## Versioning

Maintained under the [Semantic Versioning guidelines](https://semver.org/).

## License

[MIT](https://opensource.org/licenses/MIT) © [Angus](https://silencezeng.github.io/)
