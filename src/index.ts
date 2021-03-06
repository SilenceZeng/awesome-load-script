import { hasKey } from './typeGuards';

// similar to addEventListener, but return remove listener function
function addDomEvent<D extends EventTarget, K extends string>(
  dom: D,
  type: K,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
): () => void {
  dom.addEventListener(type, listener, options);
  let isRemoved = false;
  return () => {
    if (!isRemoved) {
      dom.removeEventListener(type, listener, options);
      isRemoved = true;
    }
  };
}

export interface LoadScriptOption extends Partial<HTMLScriptElement> {
  noRepeat?: boolean;
  autoRemove?: boolean;
  throwError?: boolean;
  exposeGlobalName?: string;
  // clean global value，will delete window[exposeGlobalName]
  cleanGlobal?: boolean;
}

const exposeMap = new Map<string, unknown>();
const loadingPromiseMap = new Map<string, Promise<unknown>>();
const loadedUrls = new Set<string>();

function _coreFn(scriptUrl: string, options: LoadScriptOption = {}) {
  const {
    noRepeat = false,
    autoRemove = true,
    throwError = true,
    exposeGlobalName,
    cleanGlobal,
    ...scriptAttrs
  } = options;

  async function resolveExposeValue() {
    // delay 0s
    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });
    if (exposeGlobalName) {
      if (exposeMap.has(scriptUrl)) {
        if (cleanGlobal && hasKey(window, exposeGlobalName)) {
          delete window[exposeGlobalName];
        }
        return exposeMap.get(scriptUrl);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const exposeVal = window[exposeGlobalName as any];
        if (cleanGlobal && hasKey(window, exposeGlobalName)) {
          delete window[exposeGlobalName];
        }
        exposeMap.set(scriptUrl, exposeVal);
        return exposeVal;
      }
    }
    return;
  }

  if (noRepeat) {
    if (loadingPromiseMap.has(scriptUrl)) {
      return loadingPromiseMap.get(scriptUrl);
    }
    if (loadedUrls.has(scriptUrl)) {
      return Promise.resolve(resolveExposeValue());
    }
  }

  const scriptElm = document.createElement('script');
  Object.assign(
    scriptElm,
    { async: true, type: 'text/javascript', charset: 'utf-8' },
    scriptAttrs,
  );
  scriptElm.setAttribute('src', scriptUrl);
  scriptElm.setAttribute('data-create-by', 'loadScript');

  const promise = new Promise((resolve, reject) => {
    const rm1 = addDomEvent(
      scriptElm,
      'load',
      () => {
        removeAllHandler();
        resolve(resolveExposeValue());
        !loadedUrls.has(scriptUrl) && loadedUrls.add(scriptUrl);
      },
      { once: true },
    );

    const rm2 = addDomEvent(
      scriptElm,
      'error',
      () => {
        removeAllHandler();
        const err = new Error(`loadScriptError 『${scriptUrl}』`);
        throwError ? reject(err) : resolve(err);
      },
      { once: true },
    );

    // window error
    const rm3 = addDomEvent(window, 'error', ((event: ErrorEvent) => {
      if (event.filename.includes(scriptUrl)) {
        removeAllHandler();
        reject(
          Object.assign(event.error, {
            lineno: event.lineno,
            colno: event.colno,
          }),
        );
      }
    }) as EventListener);

    const removeAllHandler = () => [rm1, rm2, rm3].forEach(fn => fn());

    document.documentElement.appendChild(scriptElm);
  }).finally(() => {
    autoRemove && scriptElm.remove();
    loadingPromiseMap.delete(scriptUrl);
  });
  loadingPromiseMap.set(scriptUrl, promise);

  return promise;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function loadScript(scriptUrl: string, options: LoadScriptOption = {}) {
  return await _coreFn(scriptUrl, options);
}

export default loadScript;
