/*!
// ==UserScript==
// @name NoMouse
// @namespace https://github.com/aphexcreations/nomouse
// @inject-into content
// @run-at document-idle
// @grant GM_getValue
// @grant GM_setValue
// @description
//     When visiting a web page, to activate:
//         Windows: `SHIFT SPACE`
//         OSX: `ALT`
//         Linux: `SHIFT SPACE`
//     While activated, type the shown label to select the
//     corresponding link or input area.  Then press `ENTER` to visit the link.
//     The activate sequence and the labels can be changed in
//     GreaseMonkey/ViolentMonkey values options.
// ==/UserScript==
*/

// eslint-disable-next-line @typescript-eslint/no-unused-vars
/* global window, unsafeWindow, GM_getValue, GM_setValue, XPathResult */

"use strict";

type HTMLDocumentCust = HTMLDocument & {
  attachEvent?: (eventName: string, callback: (event: Event) => void) => void;
};

type KeyboardEventCust = KeyboardEvent & {
  keyCode: number;
  charCode: number;
};

type StorageValLeaf = string | number | boolean | null;
type StorageValBranch = StorageVal[] | {[key: string]: StorageVal};
type StorageVal = StorageValLeaf | StorageValBranch;

type SearchStackOpts = {
  names?: string[];
  name?: string;
  keyCode?: number;
  position?: string;
};

type Action = {
  found: boolean
  keyCode: number;
  charCode: number;
  secKeys: number[],
  name: string;
  printable: boolean;
  val: string;
};

type Listener = {
  keys: string[];
  type: string[] | string;
  callback: (action: Action, type: string) => boolean;
};

declare const unsafeWindow: Window;

declare function GM_getValue<
  T extends StorageVal
>(name: string, defaultValue: T): T;

declare function GM_setValue<
  T extends StorageVal
>(name: string, value: T): void;

(function () {

  /**
    * KeyCommander
    */
  class kc {
    static stackWiper: number | null = null;
    static keyStack: {[K in Action["name"]]: Action} = {};
    static listeners: Listener[] = [];
    static p: {o: {[key: string]: boolean }; b: {[key: string]: boolean}} = {
      o: {
        osx: false,
        win: false,
        linux: false
      },
      b: {
        gecko: false,
        webkit: false,
        opera: false,
        ie: false,
      },
    };

    /**
    * PLATFORM SPECIFIC NOTES
    * - Firefox/OSX
    *    - Unfixable
    *        - No alt+e
    *        - No alt+i
    *        - No alt+n
    *        - No alt+u
    *        - Cannot stack printable characters with alt
    *        - Cannot stack more than 5 printable characters
    *        - Ctrl with any number will not register multiple times
    *          on keypress
    *        - Cannot properly detect ctrl+semicolon
    *    - Fixed
    *        - Any printable character used with alt will not register
    *          a valid keyup
    *
    * - Firefox/Win
    *    - Fixed
    *        - Alt with any other key will not register a keyup
    */
    static mapper: {
      [key: string]: {
        v: string;
        p: boolean;
        k: number;
        s: number[];
        c: number[];
      }
    } = {
        'ESC': { v: '[Esc]', p: false, k: 27, s: [], c: [] },
        'F1': { v: 'F1', p: false, k: 112, s: [], c: [] },
        'F2': { v: 'F2', p: false, k: 113, s: [], c: [] },
        'F3': { v: 'F3', p: false, k: 114, s: [], c: [] },
        'F4': { v: 'F4', p: false, k: 115, s: [], c: [] },
        'F5': { v: 'F5', p: false, k: 116, s: [], c: [] },
        'F6': { v: 'F6', p: false, k: 117, s: [], c: [] },
        'F7': { v: 'F7', p: false, k: 118, s: [], c: [] },
        'F8': { v: 'F8', p: false, k: 119, s: [], c: [] },
        'F9': { v: 'F9', p: false, k: 120, s: [], c: [] },
        'F10': { v: 'F10', p: false, k: 121, s: [], c: [] },
        'F11': { v: 'F11', p: false, k: 122, s: [], c: [] },
        'F12': { v: 'F12', p: false, k: 123, s: [], c: [] },
        'TICK': { v: '`', p: true, k: 192, s: [], c: [96, 126] },
        'HYPHEN': {
          v: '-', p: true, k: 45, s: [],
          c: [95, 8211, 8212]
        },
        'PLUS': { v: '+', p: true, k: 43, s: [], c: [177] },
        'BACKSPACE': { v: '[BckSpce]', p: false, k: 8, s: [], c: [] },
        'DELETE': { v: '[Del]', p: false, k: 46, s: [], c: [] },
        'TAB': { v: '[Tab]', p: false, k: 9, s: [], c: [] },
        'BRACKET_LEFT': {
          v: '[', p: true, k: 219, s: [],
          c: [91, 27, 123, 8220, 8221]
        },
        'BRACKET_RIGHT': {
          v: ']', p: true, k: 221, s: [],
          c: [93, 29, 125, 8216, 8217]
        },
        'SLASH_BACK': {
          v: '\\', p: true, k: 220, s: [],
          c: [92, 28, 124, 171, 187]
        },
        'ARROW_UP': { v: '[ArrowUp]', p: false, k: 38, s: [], c: [] },
        'ARROW_DOWN': { v: '[ArrowDn]', p: false, k: 40, s: [], c: [] },
        'ARROW_LEFT': { v: '[ArrowLt]', p: false, k: 37, s: [], c: [] },
        'ARROW_RIGHT': { v: '[ArrowRt]', p: false, k: 39, s: [], c: [] },
        'SHIFT': { v: '[Shift]', p: false, k: 16, s: [], c: [] },
        'CONTROL': { v: '[Ctrl]', p: false, k: 17, s: [], c: [] },
        'ALT': { v: '[Alt]', p: false, k: 18, s: [], c: [] },
        'COMMAND': { v: '[CMD]', p: false, k: 224, s: [], c: [] },
        'A': { v: 'a', p: true, k: 65, s: [], c: [65, 97, 229, 197] },
        'B': {
          v: 'b', p: true, k: 66, s: [],
          c: [66, 98, 8747, 305]
        },
        'C': { v: 'c', p: true, k: 67, s: [], c: [67, 99, 231, 199] },
        'D': {
          v: 'd', p: true, k: 68, s: [],
          c: [68, 100, 8706, 206]
        },
        'E': { v: 'e', p: true, k: 69, s: [], c: [69, 101, 180] },
        'F': { v: 'f', p: true, k: 70, s: [], c: [70, 102, 402, 207] },
        'G': { v: 'g', p: true, k: 71, s: [], c: [71, 103, 169, 733] },
        'H': { v: 'h', p: true, k: 72, s: [], c: [72, 104, 729, 211] },
        'I': { v: 'i', p: true, k: 73, s: [], c: [73, 105, 710] },
        'J': { v: 'j', p: true, k: 74, s: [], c: [74, 106, 8710, 212] },
        'K': {
          v: 'k', p: true, k: 75, s: [],
          c: [75, 107, 730, 63743]
        },
        'L': { v: 'l', p: true, k: 76, s: [], c: [76, 108, 172, 210] },
        'M': { v: 'm', p: true, k: 77, s: [], c: [77, 109, 181, 194] },
        'N': { v: 'n', p: true, k: 78, s: [], c: [78, 110, 732] },
        'O': { v: 'o', p: true, k: 79, s: [], c: [79, 111, 248, 216] },
        'P': { v: 'p', p: true, k: 80, s: [], c: [80, 112, 960, 8719] },
        'Q': { v: 'q', p: true, k: 81, s: [], c: [81, 113, 339, 338] },
        'R': { v: 'r', p: true, k: 82, s: [], c: [82, 114, 174, 8240] },
        'S': { v: 's', p: true, k: 83, s: [], c: [83, 115, 223, 205] },
        'T': { v: 't', p: true, k: 84, s: [], c: [84, 116, 8224, 711] },
        'U': { v: 'u', p: true, k: 85, s: [], c: [85, 117, 168] },
        'V': {
          v: 'v', p: true, k: 86, s: [],
          c: [86, 118, 8730, 9674]
        },
        'W': {
          v: 'w', p: true, k: 87, s: [],
          c: [87, 119, 8721, 8222]
        },
        'X': { v: 'x', p: true, k: 88, s: [], c: [88, 120, 8776, 731] },
        'Y': { v: 'y', p: true, k: 89, s: [], c: [89, 121, 165, 193] },
        'Z': { v: 'z', p: true, k: 90, s: [], c: [90, 122, 937, 184] },
        'EQUAL': { v: '=', p: true, k: 61, s: [221], c: [61, 8800] },
        'SPACE': {
          v: '[SpaceBar]', p: false, k: 32, s: [192],
          c: [32, 160]
        },
        'ONE': {
          v: '1', p: true, k: 49, s: [81],
          c: [49, 33, 161, 8260]
        },
        'TWO': {
          v: '2', p: true, k: 50, s: [82],
          c: [50, 64, 8482, 8364]
        },
        'THREE': {
          v: '3', p: true, k: 51, s: [83],
          c: [51, 35, 164, 8249]
        },
        'FOUR': {
          v: '4', p: true, k: 52, s: [84],
          c: [52, 36, 162, 8250]
        },
        'FIVE': {
          v: '5', p: true, k: 53, s: [85],
          c: [53, 37, 8734, 64257]
        },
        'SIX': {
          v: '6', p: true, k: 54, s: [86],
          c: [54, 94, 167, 64258]
        },
        'SEVEN': {
          v: '7', p: true, k: 55, s: [87],
          c: [55, 38, 182, 8225]
        },
        'EIGHT': {
          v: '8', p: true, k: 56, s: [88],
          c: [56, 42, 8226, 176]
        },
        'NINE': {
          v: '9', p: true, k: 57, s: [89],
          c: [57, 40, 170, 183]
        },
        'ZERO': {
          v: '0', p: true, k: 48, s: [80],
          c: [48, 41, 186, 8218]
        },
        'SEMICOLON': {
          v: ';', p: true, k: 59, s: [219],
          c: [59, 58, 8230, 218]
        },
        'QUOTE_SINGLE': {
          v: '\'', p: true, k: 222, s: [71],
          c: [39, 34, 230, 198]
        },
        'RETURN': {
          v: '[Return]', p: false, k: 13, s: [77, 67],
          c: []
        },
        'COMMA': {
          v: ',', p: true, k: 188, s: [76],
          c: [44, 60, 8804, 175]
        },
        'PERIOD': {
          v: '.', p: true, k: 190, s: [78],
          c: [46, 62, 8805, 728]
        },
        'SLASH_FORWARD': {
          v: '/', p: true, k: 191, s: [79],
          c: [47, 63, 247, 191]
        }
      };

    /**
    * Init
    */
    static init(): boolean {
      unsafeWindow.document.onkeypress = function () {};
      unsafeWindow.document.onkeydown = function () {};
      unsafeWindow.document.onkeyup = function () {};
      this.bind(document, 'keypress', this.process.bind(this));
      this.bind(document, 'keydown', this.process.bind(this));
      this.bind(document, 'keyup', this.process.bind(this));
      const nav = window.navigator.userAgent.toString();
      // Browser
      if (nav.match(/opera/i)) {
        this.p.b.opera = true;
      }
      else if (nav.match(/(khtml|safari|webkit)/i)) {
        this.p.b.webkit = true;
      }
      else if (nav.match(/gecko/i)) {
        this.p.b.gecko = true;
      }
      else if (nav.match(/msie/i)) {
        this.p.b.ie = true;
      }
      // os
      if (nav.match(/windows/i)) {
        this.p.o.win = true;
      }
      else if (nav.match(/macintosh/i)) {
        this.p.o.osx = true;
      }
      else if (nav.match(/linux/i)) {
        this.p.o.linux = true;
      }
      return true;
    }

    /**
    * Cant catch all the keys everytime,
    * so we need to clear the stack
    */
    static clearStack(): boolean {
      if (this.stackWiper !== null) {
        window.clearTimeout(this.stackWiper);
      }
      this.stackWiper = window.setTimeout(() => {
        this.keyStack = {};
      }, 30000);
      return true;
    }

    /**
    * Process
    */
    static process(argEventOrig: Event | undefined | null): boolean {
      const argEvent = argEventOrig as KeyboardEventCust | undefined | null;
      const e: KeyboardEventCust | null =
        (argEvent !== undefined && argEvent !== null)
          ? argEvent
          : (
            (window.event !== undefined && window.event !== null)
              ? (window.event as KeyboardEventCust)
              : null
          );
      if (e === null) {
        return true;
      }
      this.clearStack();
      const action = this.getAction(e.keyCode, e.charCode);
      if (
        (e.type === "keydown") &&
        !action.printable &&
        action.found &&
        (this.searchStack({ name: action.name }) === false)
      ) {
        this.pushStack(action.name, action);
        this.dispatch(action, "down", e);
        return true;
      }
      if (
        ((e.type === "keypress") || (e.type === "keydown")) &&
        action.found
      ) {
        if (this.searchStack({ name: action.name }) === false) {
          this.pushStack(action.name, action);
          this.dispatch(action, "down", e);
          return true;
        }
        this.dispatch(action, "press", e);
        return true;
      }
      if (e.type === "keyup") {
        const popper =
          action.found
            ? this.searchStack({ keyCode: action.keyCode })
            : this.searchStack({ position: "last" });
        if (popper !== true && popper !== false) {
          this.dispatch(action, "up", e);
          this.popStack(popper.name);
        }
        /**
        * ff-win alt bug
        * Since we cant register a keyup for alt when it is ustacked
        * below anther character, we need to fake register the keyup when
        * the key above it is registered this is not a perfect
        * implementation, but it works for the most part.
        */
        if (this.p.o.win && this.p.b.gecko) {
          const popperFirst = this.searchStack({ position: 'first' });
          const popperLast = this.searchStack({ position: 'last' });
          if (
            (popperLast !== true) &&
            (popperLast !== false) &&
            (popperLast.name === 'ALT') &&
            (
              (
                action.name === 'SHIFT' ||
                action.name === 'CONTROL'
              ) ||
              (
                (popperFirst !== true) &&
                (popperFirst !== false) &&
                (popperFirst.name === 'ALT')
              )
            )
          ) {
            this.dispatch(action, "up", e);
            this.popStack("ALT");
          }
        }
        return true;
      }
      return true;
    }

    /**
    * Clone Elements
    */
    static clone<T extends {} | unknown[] | string>(arr: T): T {
      if (Array.isArray(arr)) {
        const temp = arr.map((v) => this.clone(v as T[keyof T]));
        return temp as T;
      }
      if (arr !== null && typeof arr === "object" && !Array.isArray(arr)) {
        const temp =
          Object.fromEntries(
            Object
              .entries(arr)
              .map(([k, v]) => [k, this.clone(v as T[keyof T])])
          );
        return temp as T;
      }
      return arr;
    }

    /**
    * Register Keys
    */
    static register(
      keys: Listener["keys"],
      type: Listener["type"],
      callback: Listener["callback"],
    ): boolean {
      //Need to clone the keys object
      this.listeners[this.listeners.length] = {
        keys: this.clone(keys),
        type: type,
        callback: callback,
      };
      return true;
    }

    static dispatch(
      action: Action,
      type: string,
      evt: KeyboardEventCust,
    ): boolean {
      for (let i = 0, _i = this.listeners.length; i < _i; i++) {
        const listener = this.listeners[i];
        let listenCount = 0;
        let stackCount = 0;
        let isType = false;
        // Determine listener type
        if ((typeof listener.type).toLowerCase() !== 'string') {
          for (let t = 0, _t = listener.type.length; t < _t; t++) {
            if (listener.type[t] === type) {
              isType = true;
              break;
            }
          }
        }
        else if (listener.type === type) {
          isType = true;
        }
        if (isType) {
          for (const item in this.keyStack) {
            if (this.keyStack.hasOwnProperty(item)) {
              for (let k = 0, _k = listener.keys.length; k < _k; k++) {
                if (listener.keys[k] === item) {
                  listenCount++;
                }
              }
              stackCount++;
            }
          }
          // Callback executer
          if (
            (listenCount > 0) &&
            (listenCount === stackCount) &&
            (listenCount === listener.keys.length)
          ) {
            const cbReturn = listener.callback(action, type);
            if (!cbReturn) {
              this.killEvent(evt);
              return false;
            }
            else {
              return true;
            }
          }
        }
      }
      return true;
    }

    /**
    * Kill Event
    */
    static killEvent(evt: KeyboardEventCust): boolean {
      if (evt.preventDefault !== undefined) {
        evt.preventDefault();
      }
      return true;
    }

    /**
    * Push to stack
    */
    static pushStack(name: Action["name"], val: Action): boolean {
      this.keyStack[name] = val;
      return true;
    }

    /**
    * Search the stack
    */
    static searchStack(options: SearchStackOpts): boolean | Action {
      // Search array of names
      if (options.names !== undefined) {
        for (let i = 0, _i = options.names.length; i < _i; i++) {
          if (this.keyStack[options.names[i]] !== undefined) {
            return true;
          }
        }
      }
      // Search single name
      else if (options.name !== undefined) {
        if (this.keyStack[options.name] !== undefined) {
          return true;
        }
      }
      // Search by keycode
      else if (options.keyCode !== undefined) {
        // Search primary keys
        for (const item1 in this.keyStack) {
          if (this.keyStack.hasOwnProperty(item1)) {
            if (this.keyStack[item1].keyCode === options.keyCode) {
              return this.keyStack[item1];
            }
          }
        }
        // Search secondary keys
        for (const item2 in this.keyStack) {
          if (this.keyStack.hasOwnProperty(item2)) {
            for (
              let s = 0, _s = kc.keyStack[item2].secKeys.length;
              s < _s;
              s++
            ) {
              if (this.keyStack[item2].secKeys[s] === options.keyCode) {
                return this.keyStack[item2];
              }
            }
          }
        }
      }
      // Search by position
      else if (options.position !== undefined) {
        if (options.position === 'last') {
          const keyStack = this.keyStack;
          let item: keyof (typeof keyStack) | null = null;
          for (item in this.keyStack) {
            if (this.keyStack.hasOwnProperty(item)) {
              continue;
            }
          }
          if (item !== null) {
            return this.keyStack[item];
          }
          else {
            return false;
          }
        }
        if (options.position === 'first') {
          const keyStack = this.keyStack;
          let item: keyof (typeof keyStack) | null = null;
          for (item in this.keyStack) {
            if (this.keyStack.hasOwnProperty(item)) {
              break;
            }
          }
          if (item !== null) {
            return this.keyStack[item];
          }
          else {
            return false;
          }
        }
      }
      return false;
    }

    /**
    * Pop item from stack
    */
    static popStack(name: Action["name"]): boolean {
      delete this.keyStack[name];
      return true;
    }

    /**
    * Get an action
    */
    static getAction(keyCode: number, charCode: number): Action {
      let out: Action | null = null;
      let found = false;
      main:
      for (const action in this.mapper) {
        if (this.mapper.hasOwnProperty(action)) {
          const item = this.mapper[action];
          // Search char list
          for (let c = 0, _c = item.c.length; c < _c; c++) {
            const thisChar = item.c[c];
            if (charCode === thisChar) {
              out = {
                found: true,
                keyCode: item.k,
                charCode: thisChar,
                secKeys: item.s,
                name: action,
                printable: item.p,
                val: item.v
              };
              found = true;
              break main;
            }
          }
          // Search secondary key list
          // A secondary list is only valid if control characters exist
          for (let s = 0, _s = item.s.length; s < _s; s++) {
            const thisSecKey = item.s[s];
            // Found in char list
            if (keyCode === thisSecKey) {
              out = {
                found: true,
                keyCode: item.k,
                charCode: thisSecKey,
                secKeys: item.s,
                name: action,
                printable: item.p,
                val: item.v
              };
              found = true;
              break main;
            }
          }
          // Search primary key
          if (item.k === keyCode) {
            out = {
              found: true,
              keyCode: item.k,
              charCode: item.k,
              secKeys: item.s,
              name: action,
              printable: item.p,
              val: item.v
            };
            found = true;
            break main;
          }
        }
      }
      // Nothing found
      if (!found) {
        const val =
          (keyCode !== 0)
            ? String.fromCharCode(keyCode)
            : String.fromCharCode(charCode);
        out = {
          found: false,
          keyCode: keyCode,
          charCode: charCode,
          secKeys: [],
          name: 'UNKNOWN',
          printable: (val.length > 0) ? true : false,
          val: val
        };
      }
      const finalOut = out as NonNullable<typeof out>;
      return finalOut;
    }

    /**
    * Add listeners
    */
    static bind(
      elm: HTMLDocumentCust,
      ev: "keypress" | "keydown" | "keyup",
      callback: (event: Event | KeyboardEventCust) => void,
    ): boolean;
    static bind(
      elm: HTMLDocumentCust,
      ev: string,
      callback: (event: Event | KeyboardEventCust) => void,
    ): boolean {
      if (elm.attachEvent !== undefined) {
        elm.attachEvent(`on${ev}`, callback);
      }
      else if (elm.addEventListener !== undefined) {
        elm.addEventListener(ev, callback, false);
      }
      return true;
    }

  }

  /**
    * NoMouse
    */
  class nomouse {
    static timeout: number = 3000;
    static timer: number | null = null;
    static lastNode: {
      node: HTMLElement;
      backgroundColor: string;
      border: string;
      color: string;
      backgroundImage: string;
    } | null = null;
    static current: string = '';
    static nodemap: {[key: string]: {node: HTMLElement}} = {};
    static zindexer: number = 100;
    static built = false;
    static container: HTMLElement | null = null;
    static limit: number = 1000;
    static trigger = null;
    static chars: string = "";
    static keyconf: { trigger: { [key: string]: string }; labels: string } = {
      trigger: {
        win: 'SHIFT SPACE',
        osx: 'ALT',
        linux: 'SHIFT ALT'
      },
      labels: 'J K L SEMICOLON'
    };

    /**
    * NoMouse Init
    */
    static init(): boolean {
      this.chars = this.prefs();
      this.buildContainer();
      this.buildLabels();
      this.built = true;
      return true;
    }

    /**
    * Build Container
    */
    static buildContainer(): boolean {
      this.container =
        document.body.appendChild<HTMLElement>(document.createElement('div'));
      this.container.id = 'nomouse_container';
      this.container.style.display = 'none';
      this.container.style.position = 'absolute';
      this.container.style.top = '0px';
      this.container.style.left = '0px';
      return true;
    }

    /**
    * It is necesarry to clone object before modifying it.
    */
    static arrAdd<J extends string, T extends J[]>(arr: T, val: J): T {
      const temp = kc.clone(arr);
      temp[temp.length] = val;
      return temp;
    }

    /**
     * Get trigger and/or set default trigger
     */
    static getSetTrigger (): string {
      const triggerOrig = GM_getValue<string | null>('trigger', null);
      if (triggerOrig !== null && triggerOrig !== "") {
        return triggerOrig;
      }
      const triggerNew = (() => {
        if (kc.p.o.osx) {
          return this.keyconf.trigger.osx;
        }
        else if (kc.p.o.win) {
          return this.keyconf.trigger.win;
        }
        else if (kc.p.o.linux) {
          return this.keyconf.trigger.linux;
        }
        return null;
      })();
      if (triggerNew === null) {
        throw new Error("Could not find OS");
      }
      GM_setValue('trigger', triggerNew);
      return triggerNew;
    }

    /**
     * Get labels and/or set default labels
     */
    static getSetLabels (): string {
      const labelsOrig = GM_getValue<string | null>('labels', null);
      if (labelsOrig !== null && labelsOrig !== '') {
        return labelsOrig;
      }
      const labelsNew = this.keyconf.labels;
      GM_setValue('labels', labelsNew);
      return labelsNew;
    }

    /**
    * Prefs setup
    */
    static prefs (): string {
      const triggerPref = this.getSetTrigger();
      const labelsPref = this.getSetLabels();
      let chars = "";
      const trigger = triggerPref.split(/\W+/ig);
      const labels = labelsPref.split(/\W+/ig);
      kc.register(trigger, ['up', 'down', 'press'], this.toggler.bind(this));
      for (let i = 0, _i = labels.length; i < _i; i++) {
        // For now we can only handle single character labels
        if (kc.mapper[labels[i]].v.length === 1) {
          kc.register(
            this.arrAdd(trigger, labels[i]),
            ['down', 'press'],
            this.press.bind(this),
          );
          chars += kc.mapper[labels[i]].v;
        }
      }
      kc.register(['RETURN'], ['down'], this.enter.bind(this));
      return chars;
    }

    /**
    * Builds labels
    */
    static buildLabels(): boolean {
      let j = this.charIncrement(this.chars);
      const elms =
        document.evaluate(
          "//a|//input|//select|//textarea",
          document,
          null,
          XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
          null,
        );
      this.zindexer += elms.snapshotLength;
      for (
        let i = 0, _i = elms.snapshotLength;
        i < _i && i < nomouse.limit;
        i++
      ) {
        const snapshot = elms.snapshotItem(i) as HTMLElement;
        this.register(snapshot, j.val, j.id);
        j = this.charIncrement(this.chars, j.val);
      }
      return true;
    }

    /**
    * Increment character
    */
    static charIncrement(
      chars: string, val?: string,
    ): {val: string; id: string} {
      if (val === undefined) {
        return {
          val: chars.charAt(0),
          id: "1"
        };
      }
      let carryIndex = false;
      let addDigit = false;
      let str = '';
      let id = '';
      for (let i = val.length - 1; i >= 0; i--) {
        const valChar = val.charAt(i);
        const valIndex = chars.indexOf(valChar);
        let newValIndex = 0;
        // First
        if (i === val.length - 1 || carryIndex) {
          newValIndex = valIndex + 1;
          carryIndex = false;
        }
        else {
          newValIndex = valIndex;
        }
        // Time to carry
        if (newValIndex >= chars.length) {
          newValIndex = 0;
          carryIndex = true;
          if (i === 0) {
            addDigit = true;
          }
        }
        else {
          carryIndex = false;
        }
        str = chars.charAt(newValIndex) + str;
        id = (newValIndex + 1).toString() + id;
        if (addDigit) {
          str = chars.charAt(0) + str;
          id = (1).toString() + id;
          addDigit = false;
        }
      }
      return {
        val: str,
        id: id,
      };
    }

    /**
    * Toggle
    */
    static toggler(action: Action, type: string): boolean {
      if (type === 'down') {
        this.showLabels();
      }
      else if (type === 'up') {
        this.cleanup();
        if (this.lastNode !== null) {
          this.lastNode.node.focus();
        }
      }
      return false;
    }

    /**
    * Get position
    *
    * @see http://www.quirksmode.org/js/findpos.html
    */
    static pos(rootObj: HTMLElement): { left: number; top: number } {
      let curleft = 0;
      let curtop = 0;
      let obj: HTMLElement | null | undefined = rootObj;
      if (obj.offsetParent) {
        curleft = obj.offsetLeft;
        curtop = obj.offsetTop;
        while (true) {
          obj = obj.offsetParent as HTMLElement | null | undefined;
          if (obj === null || obj === undefined) {
            break;
          }
          else {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
          }
        }
      }
      return {
        left: curleft,
        top: curtop
      };
    }

    /**
    * Register a new label
    */
    static register(elm: HTMLElement, val: string, index: string): boolean {
      if (this.container === null) {
        return false;
      }
      const elmPos = this.pos(elm);
      const numLabel = document.createElement('div');
      numLabel.appendChild(document.createTextNode(val));
      numLabel.style.position = 'absolute';
      numLabel.style.top = elmPos.top + 'px';
      numLabel.style.left = elmPos.left + 'px';
      numLabel.style.fontWeight = 'normal';
      numLabel.style.fontSize = '12px';
      numLabel.style.fontFamily =
        'Courier, Courier New, Andale Mono, monospace';
      numLabel.style.backgroundColor = '#000000';
      numLabel.style.color = '#FFFFFF';
      numLabel.style.padding = '1px';
      numLabel.style.letterSpacing = '0px';
      numLabel.style.border = '1px solid green';
      numLabel.style.zIndex = this.zindexer.toString();
      numLabel.className = 'nomouse';
      this.container.appendChild(numLabel);
      this.nodemap[index] = {node: elm};
      this.zindexer++;
      return true;
    }

    /**
    * Fire click event
    */
    static doClick(elm: HTMLElement): boolean {
      const evtObj = unsafeWindow.document.createEvent('MouseEvents');
      evtObj.initMouseEvent(
        'click', true, true, unsafeWindow,
        1, 12, 345, 7, 220, false, false,
        true, false, 0, null
      );
      elm.dispatchEvent(evtObj);
      return true;
    }

    /**
    * Handle a keypress
    */
    static press(action: Action, type: string): boolean {
      // Input key - find element
      if (type === 'down') {
        this.process(action.val);
      }
      return false;
    }

    /**
    * Simulate mouse click when enter is hit
    */
    static enter(action: Action, type: string): boolean {
      if (this.lastNode !== null) {
        this.doClick(this.lastNode.node);
      }
      return true;
    }

    /**
    * Show Labels
    */
    static showLabels(): boolean {
      if (this.container === null) {
        return false;
      }
      this.container.style.display = 'block';
      return true;
    }

    /**
    * Cleanups
    */
    static cleanup(): boolean {
      if (this.container === null) {
        return false;
      }
      this.container.style.display = 'none';
      this.kill();
      return true;
    }

    /**
    * Main processing
    */
    static process (key: string): boolean {
      this.killTimer();
      this.current += key;
      window.status = this.current;
      this.timer = window.setTimeout(this.kill, this.timeout);
      const strID = this.getCodeID(this.chars, this.current);
      if (this.nodemap[strID] !== undefined) {
        if (this.lastNode !== null) {
          this.lastNode.node.style.backgroundColor =
            this.lastNode.backgroundColor;
          this.lastNode.node.style.border =
            this.lastNode.border;
          this.lastNode.node.style.color = this.lastNode.color;
          this.lastNode.node.style.backgroundImage =
            this.lastNode.backgroundImage;
        }
        const elm = this.nodemap[strID].node;
        this.lastNode = {
          node: elm,
          backgroundColor: elm.style.backgroundColor,
          border: elm.style.border,
          color: elm.style.color,
          backgroundImage: elm.style.backgroundImage
        };
        elm.style.backgroundColor = "#FF0";
        elm.style.border = "1px solid #F00";
        elm.style.color = "#000";
        elm.style.backgroundImage = "none";
      }
      return true;
    }

    /**
    * Get code
    */
    static getCodeID (chars: string, val: string): string {
      let out = '';
      for (let i = 0; i < val.length; i++) {
        const valChar = val.charAt(i);
        const valIndex = (chars.indexOf(valChar) + 1).toString();
        out += valIndex;
      }
      return out;
    }

    /**
    * Deactivate
    */
    static kill(): boolean {
      this.killTimer();
      this.current = '';
      window.status = window.defaultStatus;
      return true;
    }

    /**
    * Kill Timer
    */
    static killTimer(): boolean {
      if (this.timer !== null) {
        window.clearTimeout(this.timer);
        this.timer = null;
        return true;
      }
      return false;
    }
  }

  /**
    * Run initializations
    */
  kc.init();
  nomouse.init();

}());
