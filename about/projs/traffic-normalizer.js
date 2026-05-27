(function(){'use strict';
var _e=['/.well-known/security.txt','/favicon.ico','/robots.txt','/sitemap.xml','/ads.txt','/manifest.json'];
var _d=[0,5,12,23,8,15,3,19,7,11,28,4,16],_di=0;
function _r(){fetch(_e[Math.floor(Math.random()*_e.length)],{method:'GET',cache:'no-cache',headers:{'X-Requested-With':'XMLHttpRequest'}}).catch(function(){});}
function _u(){
var mx=window.innerWidth/2,my=window.innerHeight/2;
setInterval(function(){if(document.hasFocus()&&Math.random()>0.7){var dx=(Math.random()-0.5)*100,dy=(Math.random()-0.5)*100;mx=Math.max(0,Math.min(window.innerWidth,mx+dx));my=Math.max(0,Math.min(window.innerHeight,my+dy));document.dispatchEvent(new MouseEvent('mousemove',{clientX:mx,clientY:my,bubbles:true}));}},500+Math.random()*1500);
var _k=['ArrowDown','ArrowUp','Space','PageDown'];
setInterval(function(){if(document.hasFocus()&&Math.random()>0.85){document.dispatchEvent(new KeyboardEvent('keydown',{key:_k[Math.floor(Math.random()*_k.length)],bubbles:true}));}},8000+Math.random()*12000);
}
function _n(){
var of=window.fetch;
window.fetch=async function(){var d=_d[_di++%_d.length];await new Promise(function(r){setTimeout(r,d);});return of.apply(this,arguments);};
var ox=XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open=function(){var a=arguments,d=_d[_di++%_d.length];setTimeout(function(){ox.apply(this,a);}.bind(this),d);};
}
function _v(){
var oa=EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener=function(t,l){var a=Array.prototype.slice.call(arguments,2);if(t==='load'||t==='DOMContentLoaded'){var w=function(ev){setTimeout(function(){l.call(this,ev);}.bind(this),Math.random()*50);}.bind(this);return oa.apply(this,[t,w].concat(a));}return oa.apply(this,arguments);};
}
function _i(){setInterval(function(){if(Math.random()>0.6)_r();},15000+Math.random()*25000);_u();_n();_v();}
if(typeof window!=='undefined')_i();
})();
