"use strict";(()=>{var Se=Object.create;var X=Object.defineProperty;var ge=Object.getOwnPropertyDescriptor;var we=Object.getOwnPropertyNames;var Pe=Object.getPrototypeOf,ke=Object.prototype.hasOwnProperty;var K=(e,a)=>()=>(a||e((a={exports:{}}).exports,a),a.exports);var Ae=(e,a,t,u)=>{if(a&&typeof a=="object"||typeof a=="function")for(let o of we(a))!ke.call(e,o)&&o!==t&&X(e,o,{get:()=>a[o],enumerable:!(u=ge(a,o))||u.enumerable});return e};var D=(e,a,t)=>(t=e!=null?Se(Pe(e)):{},Ae(a||!e||!e.__esModule?X(t,"default",{value:e,enumerable:!0}):t,e));var ue=K(d=>{"use strict";var C=Symbol.for("react.element"),Be=Symbol.for("react.portal"),Fe=Symbol.for("react.fragment"),Me=Symbol.for("react.strict_mode"),ye=Symbol.for("react.profiler"),De=Symbol.for("react.provider"),Re=Symbol.for("react.context"),Te=Symbol.for("react.forward_ref"),qe=Symbol.for("react.suspense"),be=Symbol.for("react.memo"),ve=Symbol.for("react.lazy"),_=Symbol.iterator;function Ue(e){return e===null||typeof e!="object"?null:(e=_&&e[_]||e["@@iterator"],typeof e=="function"?e:null)}var $={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},j=Object.assign,Q={};function I(e,a,t){this.props=e,this.context=a,this.refs=Q,this.updater=t||$}I.prototype.isReactComponent={};I.prototype.setState=function(e,a){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,a,"setState")};I.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Y(){}Y.prototype=I.prototype;function H(e,a,t){this.props=e,this.context=a,this.refs=Q,this.updater=t||$}var G=H.prototype=new Y;G.constructor=H;j(G,I.prototype);G.isPureReactComponent=!0;var Z=Array.isArray,ee=Object.prototype.hasOwnProperty,E={current:null},ae={key:!0,ref:!0,__self:!0,__source:!0};function te(e,a,t){var u,o={},r=null,s=null;if(a!=null)for(u in a.ref!==void 0&&(s=a.ref),a.key!==void 0&&(r=""+a.key),a)ee.call(a,u)&&!ae.hasOwnProperty(u)&&(o[u]=a[u]);var l=arguments.length-2;if(l===1)o.children=t;else if(1<l){for(var f=Array(l),n=0;n<l;n++)f[n]=arguments[n+2];o.children=f}if(e&&e.defaultProps)for(u in l=e.defaultProps,l)o[u]===void 0&&(o[u]=l[u]);return{$$typeof:C,type:e,key:r,ref:s,props:o,_owner:E.current}}function Oe(e,a){return{$$typeof:C,type:e.type,key:a,ref:e.ref,props:e.props,_owner:e._owner}}function V(e){return typeof e=="object"&&e!==null&&e.$$typeof===C}function He(e){var a={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(t){return a[t]})}var J=/\/+/g;function O(e,a){return typeof e=="object"&&e!==null&&e.key!=null?He(""+e.key):a.toString(36)}function T(e,a,t,u,o){var r=typeof e;(r==="undefined"||r==="boolean")&&(e=null);var s=!1;if(e===null)s=!0;else switch(r){case"string":case"number":s=!0;break;case"object":switch(e.$$typeof){case C:case Be:s=!0}}if(s)return s=e,o=o(s),e=u===""?"."+O(s,0):u,Z(o)?(t="",e!=null&&(t=e.replace(J,"$&/")+"/"),T(o,a,t,"",function(n){return n})):o!=null&&(V(o)&&(o=Oe(o,t+(!o.key||s&&s.key===o.key?"":(""+o.key).replace(J,"$&/")+"/")+e)),a.push(o)),1;if(s=0,u=u===""?".":u+":",Z(e))for(var l=0;l<e.length;l++){r=e[l];var f=u+O(r,l);s+=T(r,a,t,f,o)}else if(f=Ue(e),typeof f=="function")for(e=f.call(e),l=0;!(r=e.next()).done;)r=r.value,f=u+O(r,l++),s+=T(r,a,t,f,o);else if(r==="object")throw a=String(e),Error("Objects are not valid as a React child (found: "+(a==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":a)+"). If you meant to render a collection of children, use an array instead.");return s}function R(e,a,t){if(e==null)return e;var u=[],o=0;return T(e,u,"","",function(r){return a.call(t,r,o++)}),u}function Ge(e){if(e._status===-1){var a=e._result;a=a(),a.then(function(t){(e._status===0||e._status===-1)&&(e._status=1,e._result=t)},function(t){(e._status===0||e._status===-1)&&(e._status=2,e._result=t)}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var p={current:null},q={transition:null},Ee={ReactCurrentDispatcher:p,ReactCurrentBatchConfig:q,ReactCurrentOwner:E};function oe(){throw Error("act(...) is not supported in production builds of React.")}d.Children={map:R,forEach:function(e,a,t){R(e,function(){a.apply(this,arguments)},t)},count:function(e){var a=0;return R(e,function(){a++}),a},toArray:function(e){return R(e,function(a){return a})||[]},only:function(e){if(!V(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};d.Component=I;d.Fragment=Fe;d.Profiler=ye;d.PureComponent=H;d.StrictMode=Me;d.Suspense=qe;d.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Ee;d.act=oe;d.cloneElement=function(e,a,t){if(e==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+e+".");var u=j({},e.props),o=e.key,r=e.ref,s=e._owner;if(a!=null){if(a.ref!==void 0&&(r=a.ref,s=E.current),a.key!==void 0&&(o=""+a.key),e.type&&e.type.defaultProps)var l=e.type.defaultProps;for(f in a)ee.call(a,f)&&!ae.hasOwnProperty(f)&&(u[f]=a[f]===void 0&&l!==void 0?l[f]:a[f])}var f=arguments.length-2;if(f===1)u.children=t;else if(1<f){l=Array(f);for(var n=0;n<f;n++)l[n]=arguments[n+2];u.children=l}return{$$typeof:C,type:e.type,key:o,ref:r,props:u,_owner:s}};d.createContext=function(e){return e={$$typeof:Re,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},e.Provider={$$typeof:De,_context:e},e.Consumer=e};d.createElement=te;d.createFactory=function(e){var a=te.bind(null,e);return a.type=e,a};d.createRef=function(){return{current:null}};d.forwardRef=function(e){return{$$typeof:Te,render:e}};d.isValidElement=V;d.lazy=function(e){return{$$typeof:ve,_payload:{_status:-1,_result:e},_init:Ge}};d.memo=function(e,a){return{$$typeof:be,type:e,compare:a===void 0?null:a}};d.startTransition=function(e){var a=q.transition;q.transition={};try{e()}finally{q.transition=a}};d.unstable_act=oe;d.useCallback=function(e,a){return p.current.useCallback(e,a)};d.useContext=function(e){return p.current.useContext(e)};d.useDebugValue=function(){};d.useDeferredValue=function(e){return p.current.useDeferredValue(e)};d.useEffect=function(e,a){return p.current.useEffect(e,a)};d.useId=function(){return p.current.useId()};d.useImperativeHandle=function(e,a,t){return p.current.useImperativeHandle(e,a,t)};d.useInsertionEffect=function(e,a){return p.current.useInsertionEffect(e,a)};d.useLayoutEffect=function(e,a){return p.current.useLayoutEffect(e,a)};d.useMemo=function(e,a){return p.current.useMemo(e,a)};d.useReducer=function(e,a,t){return p.current.useReducer(e,a,t)};d.useRef=function(e){return p.current.useRef(e)};d.useState=function(e){return p.current.useState(e)};d.useSyncExternalStore=function(e,a,t){return p.current.useSyncExternalStore(e,a,t)};d.useTransition=function(){return p.current.useTransition()};d.version="18.3.1"});var h=K((Ne,de)=>{"use strict";de.exports=ue()});var i=D(h());var v=D(h());var le=e=>e.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),b=(...e)=>e.filter((a,t,u)=>!!a&&a.trim()!==""&&u.indexOf(a)===t).join(" ").trim();var S=D(h());var re={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};var fe=(0,S.forwardRef)(({color:e="currentColor",size:a=24,strokeWidth:t=2,absoluteStrokeWidth:u,className:o="",children:r,iconNode:s,...l},f)=>(0,S.createElement)("svg",{ref:f,...re,width:a,height:a,stroke:e,strokeWidth:u?Number(t)*24/Number(a):t,className:b("lucide",o),...l},[...s.map(([n,B])=>(0,S.createElement)(n,B)),...Array.isArray(r)?r:[r]]));var m=(e,a)=>{let t=(0,v.forwardRef)(({className:u,...o},r)=>(0,v.createElement)(fe,{ref:r,iconNode:a,className:b(`lucide-${le(e)}`,u),...o}));return t.displayName=`${e}`,t};var g=m("Maximize2",[["polyline",{points:"15 3 21 3 21 9",key:"mznyad"}],["polyline",{points:"9 21 3 21 3 15",key:"1avn1i"}],["line",{x1:"21",x2:"14",y1:"3",y2:"10",key:"ota7mn"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);var w=m("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]);var P=m("Minimize2",[["polyline",{points:"4 14 10 14 10 20",key:"11kfnr"}],["polyline",{points:"20 10 14 10 14 4",key:"rlmsce"}],["line",{x1:"14",x2:"21",y1:"10",y2:"3",key:"o5lafz"}],["line",{x1:"3",x2:"10",y1:"21",y2:"14",key:"1atl0r"}]]);var k=m("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);var A=m("X",[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]]);var c=D(h());function se({onSendMessage:e,messages:a,isLoading:t,uiContent:u}){let[o,r]=(0,c.useState)(""),s=()=>{o.trim()&&(e(o),r(""))};return c.default.createElement("div",{className:"flex flex-col h-full bg-white"},c.default.createElement("div",{className:"flex-1 overflow-y-auto p-4 space-y-4"},a.map(l=>c.default.createElement("div",{key:l.id},c.default.createElement("div",{className:`flex ${l.role==="user"?"justify-end":"justify-start"}`},c.default.createElement("div",{className:`max-w-[80%] rounded-lg p-3 ${l.role==="user"?"bg-blue-600 text-white":"bg-gray-100 text-gray-900"}`},l.content)),l.role==="assistant"&&u&&c.default.createElement("div",{className:"mt-2"},c.default.createElement("div",{dangerouslySetInnerHTML:{__html:u}})))),t&&c.default.createElement("div",{className:"flex justify-start"},c.default.createElement("div",{className:"bg-gray-100 rounded-lg p-3"},c.default.createElement("div",{className:"animate-pulse"},"Typing...")))),c.default.createElement("div",{className:"border-t p-4"},c.default.createElement("div",{className:"flex items-center space-x-2"},c.default.createElement("input",{type:"text",value:o,onChange:l=>r(l.target.value),onKeyPress:l=>l.key==="Enter"&&s(),placeholder:"Type your message...",className:"flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2",style:{fontFamily:theme?.fontFamily,"--tw-ring-color":theme?.primaryColor}}),c.default.createElement("button",{onClick:s,className:"text-white rounded-lg p-2 hover:opacity-90",style:{backgroundColor:theme?.primaryColor}},c.default.createElement(k,{className:"w-5 h-5"})))))}var ie=null;var z=()=>{if(!ie)throw new Error("API client not initialized. Call createApiClient first.");return ie};function Pa({apiKey:e,programId:a,mode:t,sessionId:u,metadata:o={},onClose:r}){let[s,l]=(0,i.useState)(!1),[f,n]=(0,i.useState)(!1),[B,W]=(0,i.useState)([]),[ce,Ve]=(0,i.useState)(!1),[L,ne]=(0,i.useState)(null),[pe,me]=(0,i.useState)(u),[Le,Ie]=(0,i.useState)(null);(0,i.useEffect)(()=>{(async()=>{let F=await z().getOrgSettings(e);F.data?.theme&&ne(F.data.theme)})()},[e]);let xe=async U=>{let N=z(),F={role:"user",content:U,id:Date.now().toString()};W(x=>[...x,F]);try{let x=await N.streamChat(U,pe,B,{...o,programId:a});for await(let M of x)switch(M.type){case"session":me(M.sessionId);break;case"message":W(he=>{let y=[...he];return y[y.length-1]?.isTemp&&y.pop(),[...y,...M.content.messages]});break;case"ui":Ie(M.content);break}}catch(x){console.error("Error in chat:",x)}},Ce=L?{"--edubot-primary":L.primaryColor,"--edubot-secondary":L.secondaryColor,"--edubot-accent":L.accentColor,"--edubot-font":L.fontFamily}:{};return i.default.createElement("div",{className:"fixed bottom-4 right-4 z-50",style:Ce},s?i.default.createElement("div",{className:`bg-white rounded-lg shadow-xl ${f?"w-72":"w-96 h-[600px]"}`,style:{fontFamily:L?.fontFamily}},i.default.createElement("div",{className:"flex items-center justify-between p-4 border-b text-white",style:{backgroundColor:L?.primaryColor}},i.default.createElement("h3",{className:"font-semibold"},"Student Counseling"),i.default.createElement("div",{className:"flex items-center space-x-2"},i.default.createElement("button",{onClick:()=>n(!f),className:"hover:opacity-80"},f?i.default.createElement(g,{className:"w-4 h-4"}):i.default.createElement(P,{className:"w-4 h-4"})),i.default.createElement("button",{onClick:()=>{l(!1),r?.()},className:"hover:opacity-80"},i.default.createElement(A,{className:"w-4 h-4"})))),!f&&i.default.createElement("div",{className:"h-[calc(600px-64px)]"},i.default.createElement(se,{messages:B,onSendMessage:xe,isLoading:ce,uiContent:Le}))):i.default.createElement("button",{onClick:()=>l(!0),className:"text-white rounded-full p-4 shadow-lg transition-colors",style:{backgroundColor:L?.primaryColor}},i.default.createElement(w,{className:"w-6 h-6"})))}})();
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
