if(!self.define){let e,s={};const c=(c,a)=>(c=new URL(c+".js",a).href,s[c]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=c,e.onload=s,document.head.appendChild(e)}else e=c,importScripts(c),s()})).then((()=>{let e=s[c];if(!e)throw new Error(`Module ${c} didn’t register its module`);return e})));self.define=(a,n)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let i={};const r=e=>c(e,t),o={module:{uri:t},exports:i,require:r};s[t]=Promise.all(a.map((e=>o[e]||r(e)))).then((e=>(n(...e),i)))}}define(["./workbox-588899ac"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/static/EFyGUjXsGS5eHHVX0LHto/_buildManifest.js",revision:"2c3c72a63cd28be24fc07b4785ad0f42"},{url:"/_next/static/EFyGUjXsGS5eHHVX0LHto/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/120.8ddc6178aae72917.js",revision:"8ddc6178aae72917"},{url:"/_next/static/chunks/125-3f4d8b9086bcbb81.js",revision:"3f4d8b9086bcbb81"},{url:"/_next/static/chunks/203-c217233ee658e1cc.js",revision:"c217233ee658e1cc"},{url:"/_next/static/chunks/2060efa7-a9c88cf979c0926b.js",revision:"a9c88cf979c0926b"},{url:"/_next/static/chunks/377-a4fc5c3aa2f67e5b.js",revision:"a4fc5c3aa2f67e5b"},{url:"/_next/static/chunks/386-49b16c10cb2505ef.js",revision:"49b16c10cb2505ef"},{url:"/_next/static/chunks/39.dc9a547f158d93d7.js",revision:"dc9a547f158d93d7"},{url:"/_next/static/chunks/427-1601da823e532f9a.js",revision:"1601da823e532f9a"},{url:"/_next/static/chunks/794-e8efa0b8f5078658.js",revision:"e8efa0b8f5078658"},{url:"/_next/static/chunks/8138d893.691b7345b9db200c.js",revision:"691b7345b9db200c"},{url:"/_next/static/chunks/870-456ec0d108d2b7f1.js",revision:"456ec0d108d2b7f1"},{url:"/_next/static/chunks/908-c378c81497bd64d6.js",revision:"c378c81497bd64d6"},{url:"/_next/static/chunks/920-22830f75c0c8c8e5.js",revision:"22830f75c0c8c8e5"},{url:"/_next/static/chunks/framework-3b5a00d5d7e8d93b.js",revision:"3b5a00d5d7e8d93b"},{url:"/_next/static/chunks/main-563c1e2f4eda0bcf.js",revision:"563c1e2f4eda0bcf"},{url:"/_next/static/chunks/pages/_app-f8407ae3043b2385.js",revision:"f8407ae3043b2385"},{url:"/_next/static/chunks/pages/_error-8353112a01355ec2.js",revision:"8353112a01355ec2"},{url:"/_next/static/chunks/pages/backup-8ea12c35ba9cc717.js",revision:"8ea12c35ba9cc717"},{url:"/_next/static/chunks/pages/create-password-cfad0038e2ad5672.js",revision:"cfad0038e2ad5672"},{url:"/_next/static/chunks/pages/embed/getAccounts-c31472ea4b904a83.js",revision:"c31472ea4b904a83"},{url:"/_next/static/chunks/pages/embed/requestPermissions-5338653885eb969c.js",revision:"5338653885eb969c"},{url:"/_next/static/chunks/pages/embed/signSendTransaction-e90aee3a87a72c3b.js",revision:"e90aee3a87a72c3b"},{url:"/_next/static/chunks/pages/embed/wallet-connector-9607fc68d84685ac.js",revision:"9607fc68d84685ac"},{url:"/_next/static/chunks/pages/home-087488ba563e00f7.js",revision:"087488ba563e00f7"},{url:"/_next/static/chunks/pages/index-eb56c6f8eb109e43.js",revision:"eb56c6f8eb109e43"},{url:"/_next/static/chunks/pages/networks-200a6d468082876d.js",revision:"200a6d468082876d"},{url:"/_next/static/chunks/pages/networks/%5BnetworkId%5D-66b7070a66cc43be.js",revision:"66b7070a66cc43be"},{url:"/_next/static/chunks/pages/networks/add-1739455e8a235051.js",revision:"1739455e8a235051"},{url:"/_next/static/chunks/pages/permissions-3d38948bb42cf5cb.js",revision:"3d38948bb42cf5cb"},{url:"/_next/static/chunks/pages/permissions/%5BappPermissionsId%5D-7d0333304236edf6.js",revision:"7d0333304236edf6"},{url:"/_next/static/chunks/pages/tokens-60c0e6d59c8c3c63.js",revision:"60c0e6d59c8c3c63"},{url:"/_next/static/chunks/pages/tokens/%5BtokenAddress%5D-4047126b6b0265c6.js",revision:"4047126b6b0265c6"},{url:"/_next/static/chunks/pages/tokens/add-af8bfcd50659a3d1.js",revision:"af8bfcd50659a3d1"},{url:"/_next/static/chunks/pages/unlock-a3768cb1844288c3.js",revision:"a3768cb1844288c3"},{url:"/_next/static/chunks/pages/wallets-55787ed2da4abd13.js",revision:"55787ed2da4abd13"},{url:"/_next/static/chunks/pages/wallets/%5BwalletId%5D/accounts-45276ea90bb43760.js",revision:"45276ea90bb43760"},{url:"/_next/static/chunks/pages/wallets/%5BwalletId%5D/accounts/add-87e75f37c027e041.js",revision:"87e75f37c027e041"},{url:"/_next/static/chunks/pages/wallets/%5BwalletId%5D/accounts/import-2f0265137bad521c.js",revision:"2f0265137bad521c"},{url:"/_next/static/chunks/pages/wallets/create-f393720feb4b1df1.js",revision:"f393720feb4b1df1"},{url:"/_next/static/chunks/pages/wallets/import-d90d4c68b4865850.js",revision:"d90d4c68b4865850"},{url:"/_next/static/chunks/pages/welcome-6120aae5f8623a81.js",revision:"6120aae5f8623a81"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-07b83b7dec50429a.js",revision:"07b83b7dec50429a"},{url:"/_next/static/css/ab44ce7add5c3d11.css",revision:"ab44ce7add5c3d11"},{url:"/favicon.ico",revision:"485cc6e3d4e069a084d2b26c121499fa"},{url:"/logo-dark.png",revision:"9f87c8b151c7bbd7b555cca241f40e99"},{url:"/logo-txt.png",revision:"6a5a2c6d37b401daef13ecb28c55182a"},{url:"/logo.png",revision:"9f87c8b151c7bbd7b555cca241f40e99"},{url:"/manifest.json",revision:"fac217e296ac0149232e9d2b0d4c14fc"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:c,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
