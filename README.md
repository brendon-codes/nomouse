# NoMouse

NoMouse is a GreaseMonkey/ViolentMonkey extension which provides
mouseless browsing capabilities.


## USAGE

Install the userscript file found at `dist/nomouse.user.js`.

When visiting a web page, to activate:

* Windows: `SHIFT SPACE`
* OSX: `ALT`
* Linux: `SHIFT SPACE`

While activated, type the shown label to select the
corresponding link or input area.  Then press `ENTER` to visit the link.

The activate sequence and the labels can be changed in
GreaseMonkey/ViolentMonkey values options.


## DEVELOPMENT

```shell
npm install
npm run lint
npm run build
```
