"use strict";(()=>{var we=Object.create;var O=Object.defineProperty;var Pe=Object.getOwnPropertyDescriptor;var ke=Object.getOwnPropertyNames;var Ae=Object.getPrototypeOf,Be=Object.prototype.hasOwnProperty;var ye=(e,a,t)=>a in e?O(e,a,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[a]=t;var K=(e,a)=>()=>(a||e((a={exports:{}}).exports,a),a.exports);var Fe=(e,a,t,u)=>{if(a&&typeof a=="object"||typeof a=="function")for(let o of ke(a))!Be.call(e,o)&&o!==t&&O(e,o,{get:()=>a[o],enumerable:!(u=Pe(a,o))||u.enumerable});return e};var R=(e,a,t)=>(t=e!=null?we(Ae(e)):{},Fe(a||!e||!e.__esModule?O(t,"default",{value:e,enumerable:!0}):t,e));var H=(e,a,t)=>ye(e,typeof a!="symbol"?a+"":a,t);var ue=K(f=>{"use strict";var S=Symbol.for("react.element"),Me=Symbol.for("react.portal"),De=Symbol.for("react.fragment"),Re=Symbol.for("react.strict_mode"),Te=Symbol.for("react.profiler"),qe=Symbol.for("react.provider"),be=Symbol.for("react.context"),ve=Symbol.for("react.forward_ref"),Ue=Symbol.for("react.suspense"),Oe=Symbol.for("react.memo"),He=Symbol.for("react.lazy"),_=Symbol.iterator;function Ee(e){return e===null||typeof e!="object"?null:(e=_&&e[_]||e["@@iterator"],typeof e=="function"?e:null)}var $={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},j=Object.assign,Q={};function I(e,a,t){this.props=e,this.context=a,this.refs=Q,this.updater=t||$}I.prototype.isReactComponent={};I.prototype.setState=function(e,a){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,a,"setState")};I.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Y(){}Y.prototype=I.prototype;function G(e,a,t){this.props=e,this.context=a,this.refs=Q,this.updater=t||$}var V=G.prototype=new Y;V.constructor=G;j(V,I.prototype);V.isPureReactComponent=!0;var Z=Array.isArray,ee=Object.prototype.hasOwnProperty,z={current:null},ae={key:!0,ref:!0,__self:!0,__source:!0};function te(e,a,t){var u,o={},d=null,s=null;if(a!=null)for(u in a.ref!==void 0&&(s=a.ref),a.key!==void 0&&(d=""+a.key),a)ee.call(a,u)&&!ae.hasOwnProperty(u)&&(o[u]=a[u]);var r=arguments.length-2;if(r===1)o.children=t;else if(1<r){for(var l=Array(r),n=0;n<r;n++)l[n]=arguments[n+2];o.children=l}if(e&&e.defaultProps)for(u in r=e.defaultProps,r)o[u]===void 0&&(o[u]=r[u]);return{$$typeof:S,type:e,key:d,ref:s,props:o,_owner:z.current}}function Ge(e,a){return{$$typeof:S,type:e.type,key:a,ref:e.ref,props:e.props,_owner:e._owner}}function W(e){return typeof e=="object"&&e!==null&&e.$$typeof===S}function Ve(e){var a={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(t){return a[t]})}var J=/\/+/g;function E(e,a){return typeof e=="object"&&e!==null&&e.key!=null?Ve(""+e.key):a.toString(36)}function q(e,a,t,u,o){var d=typeof e;(d==="undefined"||d==="boolean")&&(e=null);var s=!1;if(e===null)s=!0;else switch(d){case"string":case"number":s=!0;break;case"object":switch(e.$$typeof){case S:case Me:s=!0}}if(s)return s=e,o=o(s),e=u===""?"."+E(s,0):u,Z(o)?(t="",e!=null&&(t=e.replace(J,"$&/")+"/"),q(o,a,t,"",function(n){return n})):o!=null&&(W(o)&&(o=Ge(o,t+(!o.key||s&&s.key===o.key?"":(""+o.key).replace(J,"$&/")+"/")+e)),a.push(o)),1;if(s=0,u=u===""?".":u+":",Z(e))for(var r=0;r<e.length;r++){d=e[r];var l=u+E(d,r);s+=q(d,a,t,l,o)}else if(l=Ee(e),typeof l=="function")for(e=l.call(e),r=0;!(d=e.next()).done;)d=d.value,l=u+E(d,r++),s+=q(d,a,t,l,o);else if(d==="object")throw a=String(e),Error("Objects are not valid as a React child (found: "+(a==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":a)+"). If you meant to render a collection of children, use an array instead.");return s}function T(e,a,t){if(e==null)return e;var u=[],o=0;return q(e,u,"","",function(d){return a.call(t,d,o++)}),u}function ze(e){if(e._status===-1){var a=e._result;a=a(),a.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var p={current:null},b={transition:null},We={ReactCurrentDispatcher:p,ReactCurrentBatchConfig:b,ReactCurrentOwner:z};function oe(){throw Error("act(...) is not supported in production builds of React.")}f.Children={map:T,forEach:function(e,a,t){T(e,function(){a.apply(this,arguments)},t)},count:function(e){var a=0;return T(e,function(){a++}),a},toArray:function(e){return T(e,function(a){return a})||[]},only:function(e){if(!W(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};f.Component=I;f.Fragment=De;f.Profiler=Te;f.PureComponent=G;f.StrictMode=Re;f.Suspense=Ue;f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=We;f.act=oe;f.cloneElement=function(e,a,t){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var u=j({},e.props),o=e.key,d=e.ref,s=e._owner;if(a!=null){if(a.ref!==void 0&&(d=a.ref,s=z.current),a.key!==void 0&&(o=""+a.key),e.type&&e.type.defaultProps)var r=e.type.defaultProps;for(l in a)ee.call(a,l)&&!ae.hasOwnProperty(l)&&(u[l]=a[l]===void 0&&r!==void 0?r[l]:a[l])}var l=arguments.length-2;if(l===1)u.children=t;else if(1<l){r=Array(l);for(var n=0;n<l;n++)r[n]=arguments[n+2];u.children=r}return{$$typeof:S,type:e.type,key:o,ref:d,props:u,_owner:s}};f.createContext=function(e){return e={$$typeof:be,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:qe,_context:e},e.Consumer=e};f.createElement=te;f.createFactory=function(e){var a=te.bind(null,e);return a.type=e,a};f.createRef=function(){return{current:null}};f.forwardRef=function(e){return{$$typeof:ve,render:e}};f.isValidElement=W;f.lazy=function(e){return{$$typeof:He,_payload:{_status:-1,_result:e},_init:ze}};f.memo=function(e,a){return{$$typeof:Oe,type:e,compare:a===void 0?null:a}};f.startTransition=function(e){var a=b.transition;b.transition={};try{e()}finally{b.transition=a}};f.unstable_act=oe;f.useCallback=function(e,a){return p.current.useCallback(e,a)};f.useContext=function(e){return p.current.useContext(e)};f.useDebugValue=function(){};f.useDeferredValue=function(e){return p.current.useDeferredValue(e)};f.useEffect=function(e,a){return p.current.useEffect(e,a)};f.useId=function(){return p.current.useId()};f.useImperativeHandle=function(e,a,t){return p.current.useImperativeHandle(e,a,t)};f.useInsertionEffect=function(e,a){return p.current.useInsertionEffect(e,a)};f.useLayoutEffect=function(e,a){return p.current.useLayoutEffect(e,a)};f.useMemo=function(e,a){return p.current.useMemo(e,a)};f.useReducer=function(e,a,t){return p.current.useReducer(e,a,t)};f.useRef=function(e){return p.current.useRef(e)};f.useState=function(e){return p.current.useState(e)};f.useSyncExternalStore=function(e,a,t){return p.current.useSyncExternalStore(e,a,t)};f.useTransition=function(){return p.current.useTransition()};f.version="18.3.1"});var g=K((_e,de)=>{"use strict";de.exports=ue()});var i=R(g());var U=R(g());var le=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),v=(...e)=>e.filter((a,t,u)=>!!a&&a.trim()!==""&&u.indexOf(a)===t).join(" ").trim();var w=R(g());var re={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var fe=(0,w.forwardRef)(({color:e="currentColor",size:a=24,strokeWidth:t=2,absoluteStrokeWidth:u,className:o="",children:d,iconNode:s,...r},l)=>(0,w.createElement)("svg",{ref:l,...re,width:a,height:a,stroke:e,strokeWidth:u?Number(t)*24/Number(a):t,className:v("lucide",o),...r},[...s.map(([n,m])=>(0,w.createElement)(n,m)),...Array.isArray(d)?d:[d]]));var L=(e,a)=>{let t=(0,U.forwardRef)(({className:u,...o},d)=>(0,U.createElement)(fe,{ref:d,iconNode:a,className:v(`lucide-${le(e)}`,u),...o}));return t.displayName=`${e}`,t};var P=L("Maximize2",[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);var k=L("Minimize2",[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);var A=L("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);var B=L("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);var c=R(g());function se({onSendMessage:e,messages:a,isLoading:t,uiContent:u,theme:o}){let[d,s]=(0,c.useState)(""),r=()=>{d.trim()&&(e(d),s(""))};return c.default.createElement("div",{className:"flex flex-col h-full bg-white"},c.default.createElement("div",{className:"flex-1 overflow-y-auto p-4 space-y-4"},a.map(l=>c.default.createElement("div",{key:l.id},c.default.createElement("div",{className:`flex ${l.role==="user"?"justify-end":"justify-start"}`},c.default.createElement("div",{className:`max-w-[80%] rounded-lg p-3 ${l.role==="user"?"bg-blue-600 text-white":"bg-gray-100 text-gray-900"}`},l.content)),l.role==="assistant"&&u&&c.default.createElement("div",{className:"mt-2"},c.default.createElement("div",{dangerouslySetInnerHTML:{__html:u}})))),t&&c.default.createElement("div",{className:"flex justify-start"},c.default.createElement("div",{className:"bg-gray-100 rounded-lg p-3"},c.default.createElement("div",{className:"animate-pulse"},"Typing...")))),c.default.createElement("div",{className:"border-t p-4"},c.default.createElement("div",{className:"flex items-center space-x-2"},c.default.createElement("input",{type:"text",value:d,onChange:l=>s(l.target.value),onKeyPress:l=>l.key==="Enter"&&r(),placeholder:"Type your message...",className:"flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2",style:{fontFamily:o?.fontFamily,"--tw-ring-color":o?.primaryColor}}),c.default.createElement("button",{onClick:r,className:"text-white rounded-lg p-2 hover:opacity-90",style:{backgroundColor:o?.primaryColor}},c.default.createElement(A,{className:"w-5 h-5"})))))}var N=class{constructor(a,t="http://localhost:3000"){H(this,"apiKey");H(this,"baseUrl");this.apiKey=a,this.baseUrl=t}async request(a,t={}){try{let u=await fetch(`${this.baseUrl}${a}`,{...t,headers:{"Content-Type":"application/json","X-API-Key":this.apiKey,...t.headers}}),o=await u.json();if(!u.ok)throw{code:o.error?.code||"UNKNOWN_ERROR",message:o.error?.message||"An unknown error occurred"};return{data:o}}catch(u){return console.error("API Request Error:",u),{error:{code:u.code||"REQUEST_FAILED",message:u.message||"Failed to complete the request"}}}}async initializeChat(a={}){return this.request("/api/v1/sdk/chat/init",{method:"POST",body:JSON.stringify({programId:a.programId,metadata:a.metadata,domain:window.location.hostname})})}async sendMessage(a,t,u){let o=await this.request("/api/v1/sdk/chat/message",{method:"POST",body:JSON.stringify({sessionId:a,message:t,metadata:u})});if(o.error)throw new Error(o.error.message);if(!o.data)throw new Error("No data received from server");return o.data}async endSession(a){return this.request(`/api/v1/sdk/chat/${a}/end`,{method:"POST"})}async saveSessionState(a){return this.request(`/api/v1/sdk/chat/${a}/state`,{method:"POST",body:JSON.stringify({sessionId:a,lastActive:new Date().toISOString()})})}async validateSession(a){return this.request(`/api/v1/sdk/chat/${a}/validate`,{method:"GET"})}async getSessionHistory(a,t=50,u){let o=new URLSearchParams({limit:t.toString(),...u&&{before:u}});return this.request(`/api/v1/sdk/chat/${a}/history?${o}`,{method:"GET"})}async getOrgSettings(a){return this.request("/api/v1/sdk/org-settings",{method:"GET",headers:{"X-API-Key":a}})}async*streamChat(a,t,u,o){try{let d=await fetch(`${this.baseUrl}/api/v1/sdk/chat/stream`,{method:"POST",headers:{"Content-Type":"application/json","X-API-Key":this.apiKey},body:JSON.stringify({message:a,sessionId:t,previousMessages:u,metadata:o})});if(!d.ok)throw new Error("Stream request failed");let s=d.body?.getReader();if(!s)throw new Error("No reader available");let r=new TextDecoder,l="";for(;;){let{done:n,value:m}=await s.read();if(n)break;l+=r.decode(m,{stream:!0});let F=l.split(`
`);l=F.pop()||"";for(let x of F)if(x.trim())try{yield JSON.parse(x)}catch(C){console.error("Error parsing SSE data:",C)}}}catch(d){throw console.error("Stream error:",d),d}}},y=null,ie=(e,a)=>(y||(y=new N(e,a)),y),ce=()=>{if(!y)throw new Error("API client not initialized. Call createApiClient first.");return y};function Pa({apiKey:e,programId:a,mode:t,sessionId:u,metadata:o={},onClose:d,settings:s,theme:r}){let[l,n]=(0,i.useState)(!1),[m,F]=(0,i.useState)(!1),[x,C]=(0,i.useState)([]),[ne,Ne]=(0,i.useState)(!1),[pe,me]=(0,i.useState)(u),[Le,Ie]=(0,i.useState)(null);(0,i.useEffect)(()=>{ie(e)},[e,r]);let xe=async X=>{let he=ce(),Se={role:"user",content:X,id:Date.now().toString()};C(h=>[...h,Se]);try{let h=await he.streamChat(X,pe,x,{...o,programId:a});for await(let M of h)switch(M.type){case"session":me(M.sessionId);break;case"message":C(ge=>{let D=[...ge];return D[D.length-1]?.isTemp&&D.pop(),[...D,...M.content.messages]});break;case"ui":Ie(M.content);break}}catch(h){console.error("Error in chat:",h)}},Ce=r?{"--edubot-primary":r.primaryColor,"--edubot-secondary":r.secondaryColor,"--edubot-accent":r.accentColor,"--edubot-font":r.fontFamily}:{};return i.default.createElement("div",{className:`${t==="widget"?"fixed bottom-4 right-4":""} z-50`,style:Ce},i.default.createElement("div",{className:`bg-white rounded-lg shadow-xl ${m?"w-72":"w-96 h-[600px]"}`,style:{fontFamily:r?.fontFamily}},i.default.createElement("div",{className:"flex items-center justify-between p-4 border-b text-white",style:{backgroundColor:r?.primaryColor}},i.default.createElement("h3",{className:"font-semibold"},"Student Counseling"),i.default.createElement("div",{className:"flex items-center space-x-2"},i.default.createElement("button",{onClick:()=>F(!m),className:"hover:opacity-80"},m?i.default.createElement(P,{className:"w-4 h-4"}):i.default.createElement(k,{className:"w-4 h-4"})),i.default.createElement("button",{onClick:()=>{n(!1),d?.()},className:"hover:opacity-80"},i.default.createElement(B,{className:"w-4 h-4"})))),!m&&i.default.createElement("div",{className:"h-[calc(600px-64px)]"},i.default.createElement(se,{messages:x,onSendMessage:xe,isLoading:ne,uiContent:Le,theme:r}))))}})();
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
