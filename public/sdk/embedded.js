"use strict";(()=>{var Pe=Object.create;var H=Object.defineProperty;var ke=Object.getOwnPropertyDescriptor;var Ae=Object.getOwnPropertyNames;var Be=Object.getPrototypeOf,ye=Object.prototype.hasOwnProperty;var Fe=(e,a,t)=>a in e?H(e,a,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[a]=t;var _=(e,a)=>()=>(a||e((a={exports:{}}).exports,a),a.exports);var Me=(e,a,t,u)=>{if(a&&typeof a=="object"||typeof a=="function")for(let o of Ae(a))!ye.call(e,o)&&o!==t&&H(e,o,{get:()=>a[o],enumerable:!(u=ke(a,o))||u.enumerable});return e};var T=(e,a,t)=>(t=e!=null?Pe(Be(e)):{},Me(a||!e||!e.__esModule?H(t,"default",{value:e,enumerable:!0}):t,e));var E=(e,a,t)=>Fe(e,typeof a!="symbol"?a+"":a,t);var de=_(f=>{"use strict";var g=Symbol.for("react.element"),De=Symbol.for("react.portal"),Re=Symbol.for("react.fragment"),Te=Symbol.for("react.strict_mode"),qe=Symbol.for("react.profiler"),be=Symbol.for("react.provider"),ve=Symbol.for("react.context"),Ue=Symbol.for("react.forward_ref"),Oe=Symbol.for("react.suspense"),He=Symbol.for("react.memo"),Ee=Symbol.for("react.lazy"),Z=Symbol.iterator;function Ge(e){return e===null||typeof e!="object"?null:(e=Z&&e[Z]||e["@@iterator"],typeof e=="function"?e:null)}var j={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Q=Object.assign,Y={};function I(e,a,t){this.props=e,this.context=a,this.refs=Y,this.updater=t||j}I.prototype.isReactComponent={};I.prototype.setState=function(e,a){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,a,"setState")};I.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function ee(){}ee.prototype=I.prototype;function V(e,a,t){this.props=e,this.context=a,this.refs=Y,this.updater=t||j}var z=V.prototype=new ee;z.constructor=V;Q(z,I.prototype);z.isPureReactComponent=!0;var J=Array.isArray,ae=Object.prototype.hasOwnProperty,W={current:null},te={key:!0,ref:!0,__self:!0,__source:!0};function oe(e,a,t){var u,o={},l=null,s=null;if(a!=null)for(u in a.ref!==void 0&&(s=a.ref),a.key!==void 0&&(l=""+a.key),a)ae.call(a,u)&&!te.hasOwnProperty(u)&&(o[u]=a[u]);var r=arguments.length-2;if(r===1)o.children=t;else if(1<r){for(var d=Array(r),c=0;c<r;c++)d[c]=arguments[c+2];o.children=d}if(e&&e.defaultProps)for(u in r=e.defaultProps,r)o[u]===void 0&&(o[u]=r[u]);return{$$typeof:g,type:e,key:l,ref:s,props:o,_owner:W.current}}function Ve(e,a){return{$$typeof:g,type:e.type,key:a,ref:e.ref,props:e.props,_owner:e._owner}}function N(e){return typeof e=="object"&&e!==null&&e.$$typeof===g}function ze(e){var a={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(t){return a[t]})}var $=/\/+/g;function G(e,a){return typeof e=="object"&&e!==null&&e.key!=null?ze(""+e.key):a.toString(36)}function b(e,a,t,u,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var s=!1;if(e===null)s=!0;else switch(l){case"string":case"number":s=!0;break;case"object":switch(e.$$typeof){case g:case De:s=!0}}if(s)return s=e,o=o(s),e=u===""?"."+G(s,0):u,J(o)?(t="",e!=null&&(t=e.replace($,"$&/")+"/"),b(o,a,t,"",function(c){return c})):o!=null&&(N(o)&&(o=Ve(o,t+(!o.key||s&&s.key===o.key?"":(""+o.key).replace($,"$&/")+"/")+e)),a.push(o)),1;if(s=0,u=u===""?".":u+":",J(e))for(var r=0;r<e.length;r++){l=e[r];var d=u+G(l,r);s+=b(l,a,t,d,o)}else if(d=Ge(e),typeof d=="function")for(e=d.call(e),r=0;!(l=e.next()).done;)l=l.value,d=u+G(l,r++),s+=b(l,a,t,d,o);else if(l==="object")throw a=String(e),Error("Objects are not valid as a React child (found: "+(a==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":a)+"). If you meant to render a collection of children, use an array instead.");return s}function q(e,a,t){if(e==null)return e;var u=[],o=0;return b(e,u,"","",function(l){return a.call(t,l,o++)}),u}function We(e){if(e._status===-1){var a=e._result;a=a(),a.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var p={current:null},v={transition:null},Ne={ReactCurrentDispatcher:p,ReactCurrentBatchConfig:v,ReactCurrentOwner:W};function ue(){throw Error("act(...) is not supported in production builds of React.")}f.Children={map:q,forEach:function(e,a,t){q(e,function(){a.apply(this,arguments)},t)},count:function(e){var a=0;return q(e,function(){a++}),a},toArray:function(e){return q(e,function(a){return a})||[]},only:function(e){if(!N(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};f.Component=I;f.Fragment=Re;f.Profiler=qe;f.PureComponent=V;f.StrictMode=Te;f.Suspense=Oe;f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Ne;f.act=ue;f.cloneElement=function(e,a,t){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var u=Q({},e.props),o=e.key,l=e.ref,s=e._owner;if(a!=null){if(a.ref!==void 0&&(l=a.ref,s=W.current),a.key!==void 0&&(o=""+a.key),e.type&&e.type.defaultProps)var r=e.type.defaultProps;for(d in a)ae.call(a,d)&&!te.hasOwnProperty(d)&&(u[d]=a[d]===void 0&&r!==void 0?r[d]:a[d])}var d=arguments.length-2;if(d===1)u.children=t;else if(1<d){r=Array(d);for(var c=0;c<d;c++)r[c]=arguments[c+2];u.children=r}return{$$typeof:g,type:e.type,key:o,ref:l,props:u,_owner:s}};f.createContext=function(e){return e={$$typeof:ve,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:be,_context:e},e.Consumer=e};f.createElement=oe;f.createFactory=function(e){var a=oe.bind(null,e);return a.type=e,a};f.createRef=function(){return{current:null}};f.forwardRef=function(e){return{$$typeof:Ue,render:e}};f.isValidElement=N;f.lazy=function(e){return{$$typeof:Ee,_payload:{_status:-1,_result:e},_init:We}};f.memo=function(e,a){return{$$typeof:He,type:e,compare:a===void 0?null:a}};f.startTransition=function(e){var a=v.transition;v.transition={};try{e()}finally{v.transition=a}};f.unstable_act=ue;f.useCallback=function(e,a){return p.current.useCallback(e,a)};f.useContext=function(e){return p.current.useContext(e)};f.useDebugValue=function(){};f.useDeferredValue=function(e){return p.current.useDeferredValue(e)};f.useEffect=function(e,a){return p.current.useEffect(e,a)};f.useId=function(){return p.current.useId()};f.useImperativeHandle=function(e,a,t){return p.current.useImperativeHandle(e,a,t)};f.useInsertionEffect=function(e,a){return p.current.useInsertionEffect(e,a)};f.useLayoutEffect=function(e,a){return p.current.useLayoutEffect(e,a)};f.useMemo=function(e,a){return p.current.useMemo(e,a)};f.useReducer=function(e,a,t){return p.current.useReducer(e,a,t)};f.useRef=function(e){return p.current.useRef(e)};f.useState=function(e){return p.current.useState(e)};f.useSyncExternalStore=function(e,a,t){return p.current.useSyncExternalStore(e,a,t)};f.useTransition=function(){return p.current.useTransition()};f.version="18.3.1"});var S=_((Ze,le)=>{"use strict";le.exports=de()});var i=T(S());var O=T(S());var re=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),U=(...e)=>e.filter((a,t,u)=>!!a&&a.trim()!==""&&u.indexOf(a)===t).join(" ").trim();var w=T(S());var fe={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var se=(0,w.forwardRef)(({color:e="currentColor",size:a=24,strokeWidth:t=2,absoluteStrokeWidth:u,className:o="",children:l,iconNode:s,...r},d)=>(0,w.createElement)("svg",{ref:d,...fe,width:a,height:a,stroke:e,strokeWidth:u?Number(t)*24/Number(a):t,className:U("lucide",o),...r},[...s.map(([c,L])=>(0,w.createElement)(c,L)),...Array.isArray(l)?l:[l]]));var m=(e,a)=>{let t=(0,O.forwardRef)(({className:u,...o},l)=>(0,O.createElement)(se,{ref:l,iconNode:a,className:U(`lucide-${re(e)}`,u),...o}));return t.displayName=`${e}`,t};var P=m("Maximize2",[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);var k=m("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);var A=m("Minimize2",[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);var B=m("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);var y=m("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);var n=T(S());function ie({onSendMessage:e,messages:a,isLoading:t,uiContent:u,theme:o}){let[l,s]=(0,n.useState)(""),r=()=>{l.trim()&&(e(l),s(""))};return n.default.createElement("div",{className:"flex flex-col h-full bg-white"},n.default.createElement("div",{className:"flex-1 overflow-y-auto p-4 space-y-4"},a.map(d=>n.default.createElement("div",{key:d.id},n.default.createElement("div",{className:`flex ${d.role==="user"?"justify-end":"justify-start"}`},n.default.createElement("div",{className:`max-w-[80%] rounded-lg p-3 ${d.role==="user"?"bg-blue-600 text-white":"bg-gray-100 text-gray-900"}`},d.content)),d.role==="assistant"&&u&&n.default.createElement("div",{className:"mt-2"},n.default.createElement("div",{dangerouslySetInnerHTML:{__html:u}})))),t&&n.default.createElement("div",{className:"flex justify-start"},n.default.createElement("div",{className:"bg-gray-100 rounded-lg p-3"},n.default.createElement("div",{className:"animate-pulse"},"Typing...")))),n.default.createElement("div",{className:"border-t p-4"},n.default.createElement("div",{className:"flex items-center space-x-2"},n.default.createElement("input",{type:"text",value:l,onChange:d=>s(d.target.value),onKeyPress:d=>d.key==="Enter"&&r(),placeholder:"Type your message...",className:"flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2",style:{fontFamily:o?.fontFamily,"--tw-ring-color":o?.primaryColor}}),n.default.createElement("button",{onClick:r,className:"text-white rounded-lg p-2 hover:opacity-90",style:{backgroundColor:o?.primaryColor}},n.default.createElement(B,{className:"w-5 h-5"})))))}var X=class{constructor(a,t="http://localhost:3000"){E(this,"apiKey");E(this,"baseUrl");this.apiKey=a,this.baseUrl=t}async request(a,t={}){try{let u=await fetch(`${this.baseUrl}${a}`,{...t,headers:{"Content-Type":"application/json","X-API-Key":this.apiKey,...t.headers}}),o=await u.json();if(!u.ok)throw{code:o.error?.code||"UNKNOWN_ERROR",message:o.error?.message||"An unknown error occurred"};return{data:o}}catch(u){return console.error("API Request Error:",u),{error:{code:u.code||"REQUEST_FAILED",message:u.message||"Failed to complete the request"}}}}async initializeChat(a={}){return this.request("/api/v1/sdk/chat/init",{method:"POST",body:JSON.stringify({programId:a.programId,metadata:a.metadata,domain:window.location.hostname})})}async sendMessage(a,t,u){let o=await this.request("/api/v1/sdk/chat/message",{method:"POST",body:JSON.stringify({sessionId:a,message:t,metadata:u})});if(o.error)throw new Error(o.error.message);if(!o.data)throw new Error("No data received from server");return o.data}async endSession(a){return this.request(`/api/v1/sdk/chat/${a}/end`,{method:"POST"})}async saveSessionState(a){return this.request(`/api/v1/sdk/chat/${a}/state`,{method:"POST",body:JSON.stringify({sessionId:a,lastActive:new Date().toISOString()})})}async validateSession(a){return this.request(`/api/v1/sdk/chat/${a}/validate`,{method:"GET"})}async getSessionHistory(a,t=50,u){let o=new URLSearchParams({limit:t.toString(),...u&&{before:u}});return this.request(`/api/v1/sdk/chat/${a}/history?${o}`,{method:"GET"})}async getOrgSettings(a){return this.request("/api/v1/sdk/org-settings",{method:"GET",headers:{"X-API-Key":a}})}async*streamChat(a,t,u,o){try{let l=await fetch(`${this.baseUrl}/api/v1/sdk/chat/stream`,{method:"POST",headers:{"Content-Type":"application/json","X-API-Key":this.apiKey},body:JSON.stringify({message:a,sessionId:t,previousMessages:u,metadata:o})});if(!l.ok)throw new Error("Stream request failed");let s=l.body?.getReader();if(!s)throw new Error("No reader available");let r=new TextDecoder,d="";for(;;){let{done:c,value:L}=await s.read();if(c)break;d+=r.decode(L,{stream:!0});let M=d.split(`
`);d=M.pop()||"";for(let x of M)if(x.trim())try{yield JSON.parse(x)}catch(C){console.error("Error parsing SSE data:",C)}}}catch(l){throw console.error("Stream error:",l),l}}},F=null,ce=(e,a)=>(F||(F=new X(e,a)),F),ne=()=>{if(!F)throw new Error("API client not initialized. Call createApiClient first.");return F};function Ba({apiKey:e,programId:a,mode:t,sessionId:u,metadata:o={},onClose:l,settings:s,theme:r}){let[d,c]=(0,i.useState)(!1),[L,M]=(0,i.useState)(!1),[x,C]=(0,i.useState)([]),[pe,Xe]=(0,i.useState)(!1),[me,Le]=(0,i.useState)(u),[Ie,xe]=(0,i.useState)(null);(0,i.useEffect)(()=>{ce(e)},[e,r]);let Ce=async K=>{let ge=ne(),Se={role:"user",content:K,id:Date.now().toString()};C(h=>[...h,Se]);try{let h=await ge.streamChat(K,me,x,{...o,programId:a});for await(let D of h)switch(D.type){case"session":Le(D.sessionId);break;case"message":C(we=>{let R=[...we];return R[R.length-1]?.isTemp&&R.pop(),[...R,...D.content.messages]});break;case"ui":xe(D.content);break}}catch(h){console.error("Error in chat:",h)}},he=r?{"--edubot-primary":r.primaryColor,"--edubot-secondary":r.secondaryColor,"--edubot-accent":r.accentColor,"--edubot-font":r.fontFamily}:{};return i.default.createElement("div",{className:`${t==="widget"?"fixed bottom-4 right-4":""} z-50`,style:he},d?i.default.createElement("div",{className:`bg-white rounded-lg shadow-xl ${L?"w-72":"w-96 h-[600px]"}`,style:{fontFamily:r?.fontFamily}},i.default.createElement("div",{className:"flex items-center justify-between p-4 border-b text-white",style:{backgroundColor:r?.primaryColor}},i.default.createElement("h3",{className:"font-semibold"},"Student Counseling"),i.default.createElement("div",{className:"flex items-center space-x-2"},i.default.createElement("button",{onClick:()=>M(!L),className:"hover:opacity-80"},L?i.default.createElement(P,{className:"w-4 h-4"}):i.default.createElement(A,{className:"w-4 h-4"})),i.default.createElement("button",{onClick:()=>{c(!1),l?.()},className:"hover:opacity-80"},i.default.createElement(y,{className:"w-4 h-4"})))),!L&&i.default.createElement("div",{className:"h-[calc(600px-64px)]"},i.default.createElement(ie,{messages:x,onSendMessage:Ce,isLoading:pe,uiContent:Ie,theme:r}))):i.default.createElement("button",{onClick:()=>c(!0),className:"text-white rounded-full p-4 shadow-lg transition-colors",style:{backgroundColor:r?.primaryColor}},i.default.createElement(k,{className:"w-6 h-6"})))}})();
/*! Bundled license information:

react/cjs/react.production.min.js:
  (**
   * @license React
   * react.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/shared/src/utils.js:
  (**
   * @license lucide-react v0.460.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/defaultAttributes.js:
  (**
   * @license lucide-react v0.460.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/Icon.js:
  (**
   * @license lucide-react v0.460.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/createLucideIcon.js:
  (**
   * @license lucide-react v0.460.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/maximize-2.js:
  (**
   * @license lucide-react v0.460.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/message-square.js:
  (**
   * @license lucide-react v0.460.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/minimize-2.js:
  (**
   * @license lucide-react v0.460.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/send.js:
  (**
   * @license lucide-react v0.460.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/icons/x.js:
  (**
   * @license lucide-react v0.460.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)

lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v0.460.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
