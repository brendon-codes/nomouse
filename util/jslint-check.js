#!/usr/bin/env js

/**
 * jslint loader
 *
 * This was in part taken from the jquery lint checker
 *
 * @author BrendonCrawford
 */

"use strict";


quit((function main(args) {
    var src, e, i, w, found;
    if (args[0] === undefined) {
	print('You must supply a filename argument');
	return 1;
    }
    load("util/jslint.js");
    src = readFile(args[0])
    JSLINT(src, {
	white : true,
	browser : true,
	onevar : true,
	undef : true,
	eqeqeq : true,
	plusplus : false,
	bitwise : true,
	regexp : true,
	newcap : true,
	immed : true,
	strict : true,
	nommen : false,
	indent : 4,
	maxlen : 80
    });
    e = JSLINT.errors
    found = 0
    print("File: " + args[0]);
    for (i = 0; i < e.length; i++) {
	w = e[i];
	if (w === null || w === undefined) {
	    continue;
	}
	if (w.evidence !== null && w.evidence !== undefined) {
	    print(w.evidence.replace(/^\s+|\s+$/, ''));
	}
	print(">> Problem at line " + w.line + " character "
              + w.character + ": " + w.reason + "\n");
	found++;
    }
    if (found > 0) {
	print(found + " Error(s) found.");
	return 1;
    }
    else {
	print("Passed.");
	return 0;
    }
})(arguments));

