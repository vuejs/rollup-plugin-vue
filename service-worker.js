/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "404.html",
    "revision": "f6d057d25ef120844eb9013c21b358db"
  },
  {
    "url": "assets/css/0.styles.dcae4551.css",
    "revision": "6d079eb24adec22d599ddb69f525f6dd"
  },
  {
    "url": "assets/img/search.83621669.svg",
    "revision": "83621669651b9a3d4bf64d1a670ad856"
  },
  {
    "url": "assets/js/10.f8f97ce2.js",
    "revision": "146e6a05d0344088c1fcb2ed252787c7"
  },
  {
    "url": "assets/js/2.cf0f7d64.js",
    "revision": "1c6b048b81dfea0ce9854bdbb68e1bc2"
  },
  {
    "url": "assets/js/3.95697403.js",
    "revision": "c5436d4cde72297a593df31511a09a83"
  },
  {
    "url": "assets/js/4.6770b26c.js",
    "revision": "bbf7f961cbb8c77e0a888526f1cd3987"
  },
  {
    "url": "assets/js/5.d198a83e.js",
    "revision": "e648ea3393859b8acd4cd267cdd46281"
  },
  {
    "url": "assets/js/6.111887b2.js",
    "revision": "d149b78436a3da9d221bd490a006e455"
  },
  {
    "url": "assets/js/7.610a3829.js",
    "revision": "23130fa1add89b8b2be89f9019a517fa"
  },
  {
    "url": "assets/js/8.60bc2663.js",
    "revision": "dff950ac54627b70576e46f7be9f821e"
  },
  {
    "url": "assets/js/9.e3b15a9c.js",
    "revision": "24b1c1d81b033605f54af4fb53c43f0b"
  },
  {
    "url": "assets/js/app.663fcef7.js",
    "revision": "ca565ab27a70238b3885e7d0ea18171d"
  },
  {
    "url": "changelog.html",
    "revision": "27a15b1ae439c1ad8f26e196a4c70290"
  },
  {
    "url": "examples.html",
    "revision": "41bee255df405ed9f4f44dd24da71e8b"
  },
  {
    "url": "faqs.html",
    "revision": "a8a4d0f87ab88a3234d8e478d406d21d"
  },
  {
    "url": "getting-started.html",
    "revision": "a3161a5d7aee1527bed4eca12c08d17d"
  },
  {
    "url": "index.html",
    "revision": "08990f3d36681199e8aa839ed2ef5593"
  },
  {
    "url": "logo.png",
    "revision": "b8c50251399a8890d798d2d531ca4d3b"
  },
  {
    "url": "migrating.html",
    "revision": "490ecd1be99e89ccbd11b8faf9d0addc"
  },
  {
    "url": "options.html",
    "revision": "a35103de743087f9f58279f78254ea9b"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
addEventListener('message', event => {
  const replyPort = event.ports[0]
  const message = event.data
  if (replyPort && message && message.type === 'skip-waiting') {
    event.waitUntil(
      self.skipWaiting().then(
        () => replyPort.postMessage({ error: null }),
        error => replyPort.postMessage({ error })
      )
    )
  }
})
