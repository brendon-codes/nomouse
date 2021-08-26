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
"use strict";!function(){var kc=function(){function kc(){}return kc.init=function(){
unsafeWindow.document.onkeypress=function(){},unsafeWindow.document.onkeydown=function(){},
unsafeWindow.document.onkeyup=function(){},this.bind(document,"keypress",this.process.bind(this)),this.bind(document,
"keydown",this.process.bind(this)),this.bind(document,"keyup",this.process.bind(this))
;var nav=window.navigator.userAgent.toString();return nav.match(/opera/i)?this.p.b.opera=!0:nav.match(
/(khtml|safari|webkit)/i)?this.p.b.webkit=!0:nav.match(/gecko/i)?this.p.b.gecko=!0:nav.match(/msie/i)&&(this.p.b.ie=!0),
nav.match(/windows/i)?this.p.o.win=!0:nav.match(/macintosh/i)?this.p.o.osx=!0:nav.match(/linux/i)&&(this.p.o.linux=!0),
!0},kc.clearStack=function(){var _this=this;return null!==this.stackWiper&&window.clearTimeout(this.stackWiper),
this.stackWiper=window.setTimeout(function(){_this.keyStack={}},3e4),!0},kc.process=function(popperLast){
var popperFirst=popperLast,e=null!=popperFirst?popperFirst:void 0!==window.event&&null!==window.event?window.event:null
;if(null===e)return!0;this.clearStack();var action=this.getAction(e.keyCode,e.charCode);if(
"keydown"===e.type&&!action.printable&&action.found&&!1===this.searchStack({name:action.name}))return this.pushStack(
action.name,action),this.dispatch(action,"down",e),!0;if(("keypress"===e.type||"keydown"===e.type)&&action.found
)return!1===this.searchStack({name:action.name})?(this.pushStack(action.name,action),this.dispatch(action,"down",e)
):this.dispatch(action,"press",e),!0;if("keyup"!==e.type)return!0;popperLast=action.found?this.searchStack({
keyCode:action.keyCode}):this.searchStack({position:"last"});return!0!==popperLast&&!1!==popperLast&&(this.dispatch(
action,"up",e),this.popStack(popperLast.name)),this.p.o.win&&this.p.b.gecko&&(popperFirst=this.searchStack({
position:"first"}),!0!==(popperLast=this.searchStack({position:"last"}))&&!1!==popperLast&&"ALT"===popperLast.name&&(
"SHIFT"===action.name||"CONTROL"===action.name||!0!==popperFirst&&!1!==popperFirst&&"ALT"===popperFirst.name)&&(
this.dispatch(action,"up",e),this.popStack("ALT"))),!0},kc.clone=function(arr){var _this=this;return Array.isArray(arr
)?arr.map(function(v){return _this.clone(v)}):null===arr||"object"!=typeof arr||Array.isArray(arr
)?arr:Object.fromEntries(Object.entries(arr).map(function(v){var k=v[0],v=v[1];return[k,_this.clone(v)]}))},
kc.register=function(keys,type,callback){return this.listeners[this.listeners.length]={keys:this.clone(keys),type:type,
callback:callback},!0},kc.dispatch=function(action,type,evt){for(var i=0,_i=this.listeners.length;i<_i;i++){
var listener=this.listeners[i],listenCount=0,stackCount=0,isType=!1;if("string"!==(typeof listener.type).toLowerCase()){
for(var t=0,_t=listener.type.length;t<_t;t++)if(listener.type[t]===type){isType=!0;break}}else listener.type===type&&(
isType=!0);if(isType){for(var item in this.keyStack)if(this.keyStack.hasOwnProperty(item)){for(var k=0,
_k=listener.keys.length;k<_k;k++)listener.keys[k]===item&&listenCount++;stackCount++}if(
0<listenCount&&listenCount===stackCount&&listenCount===listener.keys.length)return!!listener.callback(action,type)||(
this.killEvent(evt),!1)}}return!0},kc.killEvent=function(evt){return void 0!==evt.preventDefault&&evt.preventDefault(),
!0},kc.pushStack=function(name,val){return this.keyStack[name]=val,!0},kc.searchStack=function(options){if(
void 0!==options.names){for(var i=0,_i=options.names.length;i<_i;i++)if(void 0!==this.keyStack[options.names[i]]
)return!0}else if(void 0!==options.name){if(void 0!==this.keyStack[options.name])return!0}else if(
void 0!==options.keyCode){for(var item1 in this.keyStack)if(this.keyStack.hasOwnProperty(item1
)&&this.keyStack[item1].keyCode===options.keyCode)return this.keyStack[item1];for(var item2 in this.keyStack)if(
this.keyStack.hasOwnProperty(item2))for(var s=0,_s=kc.keyStack[item2].secKeys.length;s<_s;s++)if(
this.keyStack[item2].secKeys[s]===options.keyCode)return this.keyStack[item2]}else if(void 0!==options.position){if(
"last"===options.position){this.keyStack;var item=null;for(item in this.keyStack)this.keyStack.hasOwnProperty(item)
;return null!==item&&this.keyStack[item]}if("first"===options.position){this.keyStack;item=null;for(
item in this.keyStack)if(this.keyStack.hasOwnProperty(item))break;return null!==item&&this.keyStack[item]}}return!1},
kc.popStack=function(name){return delete this.keyStack[name],!0},kc.getAction=function(keyCode,charCode){var val,
out=null,found=!1;main:for(var action in this.mapper)if(this.mapper.hasOwnProperty(action)){for(
var item=this.mapper[action],c=0,_c=item.c.length;c<_c;c++){var thisChar=item.c[c];if(charCode===thisChar){out={
found:!0,keyCode:item.k,charCode:thisChar,secKeys:item.s,name:action,printable:item.p,val:item.v},found=!0;break main}}
for(var s=0,_s=item.s.length;s<_s;s++){var thisSecKey=item.s[s];if(keyCode===thisSecKey){out={found:!0,keyCode:item.k,
charCode:thisSecKey,secKeys:item.s,name:action,printable:item.p,val:item.v},found=!0;break main}}if(item.k===keyCode){
out={found:!0,keyCode:item.k,charCode:item.k,secKeys:item.s,name:action,printable:item.p,val:item.v},found=!0;break main
}}return out=!found?{found:!1,keyCode:keyCode,charCode:charCode,secKeys:[],name:"UNKNOWN",printable:0<(
val=0!==keyCode?String.fromCharCode(keyCode):String.fromCharCode(charCode)).length,val:val}:out},kc.bind=function(elm,ev
,callback){return void 0!==elm.attachEvent?elm.attachEvent("on"+ev,callback
):void 0!==elm.addEventListener&&elm.addEventListener(ev,callback,!1),!0},kc.stackWiper=null,kc.keyStack={},
kc.listeners=[],kc.p={o:{osx:!1,win:!1,linux:!1},b:{gecko:!1,webkit:!1,opera:!1,ie:!1}},kc.mapper={ESC:{v:"[Esc]",p:!1,
k:27,s:[],c:[]},F1:{v:"F1",p:!1,k:112,s:[],c:[]},F2:{v:"F2",p:!1,k:113,s:[],c:[]},F3:{v:"F3",p:!1,k:114,s:[],c:[]},F4:{
v:"F4",p:!1,k:115,s:[],c:[]},F5:{v:"F5",p:!1,k:116,s:[],c:[]},F6:{v:"F6",p:!1,k:117,s:[],c:[]},F7:{v:"F7",p:!1,k:118,s:[
],c:[]},F8:{v:"F8",p:!1,k:119,s:[],c:[]},F9:{v:"F9",p:!1,k:120,s:[],c:[]},F10:{v:"F10",p:!1,k:121,s:[],c:[]},F11:{
v:"F11",p:!1,k:122,s:[],c:[]},F12:{v:"F12",p:!1,k:123,s:[],c:[]},TICK:{v:"`",p:!0,k:192,s:[],c:[96,126]},HYPHEN:{v:"-",
p:!0,k:45,s:[],c:[95,8211,8212]},PLUS:{v:"+",p:!0,k:43,s:[],c:[177]},BACKSPACE:{v:"[BckSpce]",p:!1,k:8,s:[],c:[]},
DELETE:{v:"[Del]",p:!1,k:46,s:[],c:[]},TAB:{v:"[Tab]",p:!1,k:9,s:[],c:[]},BRACKET_LEFT:{v:"[",p:!0,k:219,s:[],c:[91,27,
123,8220,8221]},BRACKET_RIGHT:{v:"]",p:!0,k:221,s:[],c:[93,29,125,8216,8217]},SLASH_BACK:{v:"\\",p:!0,k:220,s:[],c:[92,
28,124,171,187]},ARROW_UP:{v:"[ArrowUp]",p:!1,k:38,s:[],c:[]},ARROW_DOWN:{v:"[ArrowDn]",p:!1,k:40,s:[],c:[]},
ARROW_LEFT:{v:"[ArrowLt]",p:!1,k:37,s:[],c:[]},ARROW_RIGHT:{v:"[ArrowRt]",p:!1,k:39,s:[],c:[]},SHIFT:{v:"[Shift]",p:!1,
k:16,s:[],c:[]},CONTROL:{v:"[Ctrl]",p:!1,k:17,s:[],c:[]},ALT:{v:"[Alt]",p:!1,k:18,s:[],c:[]},COMMAND:{v:"[CMD]",p:!1,
k:224,s:[],c:[]},A:{v:"a",p:!0,k:65,s:[],c:[65,97,229,197]},B:{v:"b",p:!0,k:66,s:[],c:[66,98,8747,305]},C:{v:"c",p:!0,
k:67,s:[],c:[67,99,231,199]},D:{v:"d",p:!0,k:68,s:[],c:[68,100,8706,206]},E:{v:"e",p:!0,k:69,s:[],c:[69,101,180]},F:{
v:"f",p:!0,k:70,s:[],c:[70,102,402,207]},G:{v:"g",p:!0,k:71,s:[],c:[71,103,169,733]},H:{v:"h",p:!0,k:72,s:[],c:[72,104,
729,211]},I:{v:"i",p:!0,k:73,s:[],c:[73,105,710]},J:{v:"j",p:!0,k:74,s:[],c:[74,106,8710,212]},K:{v:"k",p:!0,k:75,s:[],
c:[75,107,730,63743]},L:{v:"l",p:!0,k:76,s:[],c:[76,108,172,210]},M:{v:"m",p:!0,k:77,s:[],c:[77,109,181,194]},N:{v:"n",
p:!0,k:78,s:[],c:[78,110,732]},O:{v:"o",p:!0,k:79,s:[],c:[79,111,248,216]},P:{v:"p",p:!0,k:80,s:[],c:[80,112,960,8719]},
Q:{v:"q",p:!0,k:81,s:[],c:[81,113,339,338]},R:{v:"r",p:!0,k:82,s:[],c:[82,114,174,8240]},S:{v:"s",p:!0,k:83,s:[],c:[83,
115,223,205]},T:{v:"t",p:!0,k:84,s:[],c:[84,116,8224,711]},U:{v:"u",p:!0,k:85,s:[],c:[85,117,168]},V:{v:"v",p:!0,k:86,
s:[],c:[86,118,8730,9674]},W:{v:"w",p:!0,k:87,s:[],c:[87,119,8721,8222]},X:{v:"x",p:!0,k:88,s:[],c:[88,120,8776,731]},
Y:{v:"y",p:!0,k:89,s:[],c:[89,121,165,193]},Z:{v:"z",p:!0,k:90,s:[],c:[90,122,937,184]},EQUAL:{v:"=",p:!0,k:61,s:[221],
c:[61,8800]},SPACE:{v:"[SpaceBar]",p:!1,k:32,s:[192],c:[32,160]},ONE:{v:"1",p:!0,k:49,s:[81],c:[49,33,161,8260]},TWO:{
v:"2",p:!0,k:50,s:[82],c:[50,64,8482,8364]},THREE:{v:"3",p:!0,k:51,s:[83],c:[51,35,164,8249]},FOUR:{v:"4",p:!0,k:52,s:[
84],c:[52,36,162,8250]},FIVE:{v:"5",p:!0,k:53,s:[85],c:[53,37,8734,64257]},SIX:{v:"6",p:!0,k:54,s:[86],c:[54,94,167,
64258]},SEVEN:{v:"7",p:!0,k:55,s:[87],c:[55,38,182,8225]},EIGHT:{v:"8",p:!0,k:56,s:[88],c:[56,42,8226,176]},NINE:{v:"9",
p:!0,k:57,s:[89],c:[57,40,170,183]},ZERO:{v:"0",p:!0,k:48,s:[80],c:[48,41,186,8218]},SEMICOLON:{v:";",p:!0,k:59,s:[219],
c:[59,58,8230,218]},QUOTE_SINGLE:{v:"'",p:!0,k:222,s:[71],c:[39,34,230,198]},RETURN:{v:"[Return]",p:!1,k:13,s:[77,67],
c:[]},COMMA:{v:",",p:!0,k:188,s:[76],c:[44,60,8804,175]},PERIOD:{v:".",p:!0,k:190,s:[78],c:[46,62,8805,728]},
SLASH_FORWARD:{v:"/",p:!0,k:191,s:[79],c:[47,63,247,191]}},kc}(),nomouse=function(){function nomouse(){}
return nomouse.init=function(){return this.chars=this.prefs(),this.buildContainer(),this.buildLabels(),this.built=!0},
nomouse.buildContainer=function(){return this.container=document.body.appendChild(document.createElement("div")),
this.container.id="nomouse_container",this.container.style.display="none",this.container.style.position="absolute",
this.container.style.top="0px",this.container.style.left="0px",!0},nomouse.arrAdd=function(temp,val){temp=kc.clone(temp)
;return temp[temp.length]=val,temp},nomouse.getSetTrigger=function(){var triggerNew=this,triggerOrig=GM_getValue(
"trigger",null);if(null!==triggerOrig&&""!==triggerOrig)return triggerOrig
;triggerNew=kc.p.o.osx?triggerNew.keyconf.trigger.osx:kc.p.o.win?triggerNew.keyconf.trigger.win:kc.p.o.linux?triggerNew.keyconf.trigger.linux:null
;if(null===triggerNew)throw new Error("Could not find OS");return GM_setValue("trigger",triggerNew),triggerNew},
nomouse.getSetLabels=function(){var labelsNew=GM_getValue("labels",null);if(null!==labelsNew&&""!==labelsNew
)return labelsNew;labelsNew=this.keyconf.labels;return GM_setValue("labels",labelsNew),labelsNew},
nomouse.prefs=function(){var triggerPref=this.getSetTrigger(),labelsPref=this.getSetLabels(),chars="",
trigger=triggerPref.split(/\W+/gi),labels=labelsPref.split(/\W+/gi);kc.register(trigger,["up","down","press"],
this.toggler.bind(this));for(var i=0,_i=labels.length;i<_i;i++)1===kc.mapper[labels[i]].v.length&&(kc.register(
this.arrAdd(trigger,labels[i]),["down","press"],this.press.bind(this)),chars+=kc.mapper[labels[i]].v)
;return kc.register(["RETURN"],["down"],this.enter.bind(this)),chars},nomouse.buildLabels=function(){
var j=this.charIncrement(this.chars),elms=document.evaluate("//a|//input|//select|//textarea",document,null,
XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,null);this.zindexer+=elms.snapshotLength;for(var i=0,
_i=elms.snapshotLength;i<_i&&i<nomouse.limit;i++){var snapshot=elms.snapshotItem(i);this.register(snapshot,j.val,j.id),
j=this.charIncrement(this.chars,j.val)}return!0},nomouse.charIncrement=function(chars,val){if(void 0===val)return{
val:chars.charAt(0),id:"1"};for(var carryIndex=!1,addDigit=!1,str="",id="",i=val.length-1;0<=i;i--){
var newValIndex=val.charAt(i),valIndex=chars.indexOf(newValIndex),newValIndex=0;i===val.length-1||carryIndex?(
newValIndex=valIndex+1,carryIndex=!1):newValIndex=valIndex,newValIndex>=chars.length?(carryIndex=!(newValIndex=0),
0===i&&(addDigit=!0)):carryIndex=!1,str=chars.charAt(newValIndex)+str,id=(newValIndex+1).toString()+id,addDigit&&(
str=chars.charAt(0)+str,id=1..toString()+id,addDigit=!1)}return{val:str,id:id}},nomouse.toggler=function(action,type){
return"down"===type?this.showLabels():"up"===type&&(this.cleanup(),null!==this.lastNode&&this.lastNode.node.focus()),!1}
,nomouse.pos=function(rootObj){var curleft=0,curtop=0,obj=rootObj;if(obj.offsetParent)for(curleft=obj.offsetLeft,
curtop=obj.offsetTop;;){if(null==(obj=obj.offsetParent))break;curleft+=obj.offsetLeft,curtop+=obj.offsetTop}return{
left:curleft,top:curtop}},nomouse.register=function(elm,val,index){if(null===this.container)return!1
;var elmPos=this.pos(elm),numLabel=document.createElement("div");return numLabel.appendChild(document.createTextNode(val
)),numLabel.style.position="absolute",numLabel.style.top=elmPos.top+"px",numLabel.style.left=elmPos.left+"px",
numLabel.style.fontWeight="normal",numLabel.style.fontSize="12px",
numLabel.style.fontFamily="Courier, Courier New, Andale Mono, monospace",numLabel.style.backgroundColor="#000000",
numLabel.style.color="#FFFFFF",numLabel.style.padding="1px",numLabel.style.letterSpacing="0px",
numLabel.style.border="1px solid green",numLabel.style.zIndex=this.zindexer.toString(),numLabel.className="nomouse",
this.container.appendChild(numLabel),this.nodemap[index]={node:elm},this.zindexer++,!0},nomouse.doClick=function(elm){
var evtObj=unsafeWindow.document.createEvent("MouseEvents");return evtObj.initMouseEvent("click",!0,!0,unsafeWindow,1,12
,345,7,220,!1,!1,!0,!1,0,null),elm.dispatchEvent(evtObj),!0},nomouse.press=function(action,type){
return"down"===type&&this.process(action.val),!1},nomouse.enter=function(action,type){
return null!==this.lastNode&&this.doClick(this.lastNode.node),!0},nomouse.showLabels=function(){
return null!==this.container&&(this.container.style.display="block",!0)},nomouse.cleanup=function(){
return null!==this.container&&(this.container.style.display="none",this.kill(),!0)},nomouse.process=function(elm){
this.killTimer(),this.current+=elm,window.status=this.current,this.timer=window.setTimeout(this.kill,this.timeout)
;elm=this.getCodeID(this.chars,this.current);return void 0!==this.nodemap[elm]&&(null!==this.lastNode&&(
this.lastNode.node.style.backgroundColor=this.lastNode.backgroundColor,
this.lastNode.node.style.border=this.lastNode.border,this.lastNode.node.style.color=this.lastNode.color,
this.lastNode.node.style.backgroundImage=this.lastNode.backgroundImage),elm=this.nodemap[elm].node,this.lastNode={
node:elm,backgroundColor:elm.style.backgroundColor,border:elm.style.border,color:elm.style.color,
backgroundImage:elm.style.backgroundImage},elm.style.backgroundColor="#FF0",elm.style.border="1px solid #F00",
elm.style.color="#000",elm.style.backgroundImage="none"),!0},nomouse.getCodeID=function(chars,val){for(var out="",
i=0;i<val.length;i++){var valChar=val.charAt(i);out+=(chars.indexOf(valChar)+1).toString()}return out},
nomouse.kill=function(){return this.killTimer(),this.current="",window.status=window.defaultStatus,!0},
nomouse.killTimer=function(){return null!==this.timer&&(window.clearTimeout(this.timer),!(this.timer=null))},
nomouse.timeout=3e3,nomouse.timer=null,nomouse.lastNode=null,nomouse.current="",nomouse.nodemap={},nomouse.zindexer=100,
nomouse.built=!1,nomouse.container=null,nomouse.limit=1e3,nomouse.trigger=null,nomouse.chars="",nomouse.keyconf={
trigger:{win:"SHIFT SPACE",osx:"ALT",linux:"SHIFT ALT"},labels:"J K L SEMICOLON"},nomouse}();kc.init(),nomouse.init()}(
);