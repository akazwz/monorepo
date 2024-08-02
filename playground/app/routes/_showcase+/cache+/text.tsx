import { Iframe } from "~/components/Iframe";
import Markdown from "~/components/Markdown";
import { Page, PageContent, PageFooter, PageTitle } from "~/components/Page";
import { CacheFirst, CacheOnly, NetworkFirst, StaleWhileRevalidate } from '@remix-pwa/sw';
import { Suspense, useCallback, useEffect, useState } from "react";
import { cn, createMockFetchWrapper } from "~/utils";
import { useRefresh } from '~/hooks/useRefresh';
import { Codeblock } from "~/components/Codeblock";
import { TableOfContents } from '~/types';
import { Button } from "~/components/Button";
import { usePromise } from '../../../hooks/usePromise';
import { Await } from "@remix-run/react";
import { ButtonGroup } from "~/components/ButtonGroup";

export const handle = {
  tableOfContents: [
    {
      title: 'Caching First',
      id: 'cache-first',
    },
    {
      title: 'Network First',
      id: 'network-first',
    },
    {
      title: 'Cache Only',
      id: 'cache-only',
    },
    {
      title: 'Stale While Revalidate',
      id: 'stale-while-revalidate',
    },
    {
      title: 'Conclusion',
      id: 'conclusion',
    }
  ]
} as { tableOfContents: TableOfContents };

export default function Component() {
  return (
    <Page>
      <PageTitle>
        {/* Text in a Flash: Content Caching */}
        Caching Text Content
      </PageTitle>
      <PageContent>
        <Codeblock>
          {`
        \`\`\`js
        const cache = new CacheFirst(\'cache-text-demo\', {maxAgeSeconds: 20 });
        const response = await cache.handleRequest(\'/api/cache-first\');
        const text = await response.text();
        setData(text);
        \`\`\`
        `}
        </Codeblock>
        <Markdown>
          {/* <!-- Think of caching as your app's personal assistant, always one step ahead, anticipating what you need before you even ask. It's not just about speed (though that's a big part of it); it's about creating smooth, responsive experiences for your users, even when the network decides to take a coffee break. --> */}
          {`
            // Start out with smthg like: Aren't you just curious about - smthg, smthg, remix, smthg, pwa -? blah, blah

            Welcome to our first showcase on caching strategies with text! 🎉 Let's dive into the world of caching and see how it can make our web apps faster and more reliable.

            Caching is like having a secret stash of your favorite snacks. When you need a quick bite, you grab from your stash instead of running to the store. Similarly, caching stores data locally so that we can quickly access it without making a round trip to the server. This is super handy for improving performance and making our apps feel snappy. It's not just about speed (though that's a big part of it); it's about creating smooth, responsive experiences for your users, even when the network decides to take a coffee break.

            // Disclamer: This showcase site isn't a guide but rather a showy way to demonstrate the concept of caching.

            Caching can be summed up as storing data in a temporary location so that it can be retrieved quickly when needed. This can be anything from images and videos to JSON responses and HTML pages. The location could also be in a variety of places, such as the browser, a CDN, or a server.

            This showcase is all Remix PWA though 💫, so we'll be focusing on caching content in the browser with Remix PWA! Remix PWA provides four strategies for caching text content: *Cache First*, *Network First*, *Stale While Revalidate*, and *Cache Only*.

            A strategy is a set of rules that determine how the browser should cache and retrieve content. Each strategy has its own use case, and you can choose the one that best fits your app's needs. You can even use multiple strategies in one app!

            ### Cache First

            Imagine you get your morning coffee from your favorite cafe every day. One day, the barista sees you coming and already has your coffee ready before you even ask. That's cache-first for you! We check our local stash first, and if it's there, we use it.

            In web terms, this strategy checks the cache first and only goes to the network if it can't find what it needs locally. It's perfect for content that doesn't change often, like your app's logo or base CSS.
            `}
        </Markdown>
        <CacheFirstDemo />
        <Markdown>
          {`
            // Disclaimer about the flicker being as a result of mocking the server in the client.

            // Add another info (here or above), explaining what exactly the demo window is all about.

            Play around with the demo. Try going offline, clearing the cache, and changing the cache expiration time. See how it falls back to cache when offline? Or how it automatically goes back to the server when the content becomes stale (expires)? That's the magic of caching strategies! This is like grabbing your favorite coffee that's already made before deciding to brew a new one. If the coffee has gone weird or is not there, you brew a fresh one. ☕
          `}
        </Markdown>
        <Markdown>
          {`
            ### Network First

            Picture this: you want to hang out with a friend. You call them first before checking if they’re at home. If they don’t pick up, then you try to visit. That’s network-first! We try the network first, and if that fails, we fall back to the cache.
          
            This strategy tries to fetch fresh data from the network first, falling back to the cache if the network is unavailable. It's ideal for content that updates frequently but where having slightly outdated information is better than having none at all.
          `}
        </Markdown>
        <NetworkFirstDemo />
        <Markdown>
          {`
            With network first strategy, we always try to get the freshest content from the network. If the network is down, we fall back to the cache.

            This is one of the most common strategies for dynamic content like news articles, social media feeds, or weather updates. It ensures that users always get the latest information, with something to show even when the network has gone for a snooze. 🛰️
          `}
        </Markdown>
        <Markdown>
          {`
            ### Cache Only

            Now, think about those times you rely solely on your grocery list at home. No internet, no new items, just what's on your list. Cache-only works the same way: it only looks at the local cache and doesn't even bother with the network.

            This strategy is perfect for content that doesn't change often and doesn't need to be updated frequently. It's like your app's grocery list: you know what's on it, and you don't need to check the store every time you need something.

            In our world, this means the app only looks at what's stored locally, never reaching out to the network. It's great for offline-first apps or when you want to guarantee lightning-fast responses. Just remember to actually store something in the cache first 💥!
            `}
        </Markdown>
        <CacheOnlyDemo />
        <Markdown>
          {`
            In this strategy, we relied solely on what's local. If the content isn't in the cache, boom! We get nothing, it simply won't be available. We also have the option to expire entries with this strategy, handy for ensuring periodic updates once in a while (like 365 days)

            This is a strategy that's great for offline-first apps or dormant (that should live forever) assets like favicon, other than that, tread carefully with this one 🤫.
          `}
        </Markdown>
        <Markdown>
          {`
            ### Stale While Revalidate

            Stale-while-revalidate is like eating leftovers while you wait for your delivery to arrive. You get quick access to something that might be a bit old, but you're also getting the freshest content in the background.

            In caching terms, this serves cached content immediately while fetching updates in the background. It's perfect for balancing speed and freshness. Your users get a quick response while the app ensures the content is up to date.
          `}
        </Markdown>
        <StaleWhileRevalidateDemo />
        <Markdown>
          {`
            ### Conclusion

            These strategies aren't just theoretical – they're the building blocks of smooth, responsive web applications. Whether you're building a news site that needs the latest updates, a documentation portal that prioritizes speed, or a progressive web app that works offline, understanding these caching strategies is key.

            If you liked the idea of these strategies, you can apply them to non-browser environments as well. Strategies are simply a set of rules that determine how you cache and retrieve content, not tied to any specific technology. You can have a redis cache that uses a cache-first strategy or a CDN that uses a network-first strategy. The possibilities are endless!

            Caching (in itself) isn't also just a neat trick; it's a game-changer. From improving page load times to making sure users can access content offline, the possibilities are endless. Whether you're building a blog, a news site, or a social media platform, smart caching and good strategy can make a huge difference.

            Next up, we'll see how we can apply similar principles to images. Ever wondered how some sites load images so fast you'd swear they were psychic? That's our next stop on this caching journey. Stay tuned, and keep your snack stash ready! 🥳
          `}
        </Markdown>
      </PageContent>
      <PageFooter />
    </Page>
  )
}

const CacheFirstDemo = () => {
  const { refreshCounter, refresh } = useRefresh()
  const [data, setData] = useState({
    data: undefined as unknown as string, // don't repeat this at home 😂!
    cacheHit: false,
  })
  const [config, setConfig] = useState({ isOffline: false, expiration: 20 })

  // This mocks the server response for this demo
  const SERVER_DATA = 'Raw data from server.\nCurrent time is: ' + new Date().toLocaleTimeString()
  // Endpoint mock
  const URL = '/api/cache-first';

  // Simulates fetching data from a server with configurable behavior.
  //
  // For some reason, explicitly fetching loader (via the `_data`) param
  // is forbidden (403). And I did not want to create separate endpoints for
  // *every* single demo.
  const fetchFromLoader = async () => {
    await new Promise(res => setTimeout(res, 750)) /* Server stuffs */

    if (config.isOffline) {
      throw new Error('Failed to fetch')
    }

    return new Response(SERVER_DATA)
  }

  /**
   * Fetches data using a cache-first strategy with mocked fetch.
   */
  const fetchData = useCallback(async () => {
    const cache = new CacheFirst('cache-text-demo', { maxAgeSeconds: config.expiration });
    const response = await cache.handleRequest(URL);
    const text = await response.text();
    const wasCacheHit = response.headers.get('x-cache-hit') === 'true';
    setData({
      data: wasCacheHit
        ? text + '\nActual time is: ' + new Date().toLocaleTimeString()
          .replace('Current', 'Cached')
          .replace('Raw data from server', 'Cached content')
        : text + '\nActual time is: ' + new Date().toLocaleTimeString(),
      cacheHit: wasCacheHit,
    });
  }, []);

  // This useEffect mocks our worker thread :)
  useEffect(() => {
    // Create a wrapped version of fetchData that uses mocked fetch for the specified URL.
    //
    // Instead of hitting a non-existent endpoint, mock the fetch
    // on the client.
    const fetchDataWithMockedFetch = createMockFetchWrapper(URL, fetchFromLoader)(fetchData);

    fetchDataWithMockedFetch();
  }, [refreshCounter, fetchData])

  const clearCache = () => {
    caches.open('cache-text-demo').then(cache => cache.delete(URL));
  }

  return (
    <Iframe
      handleRefresh={() =>
        refresh(() => setData({
          data: undefined as unknown as string,
          cacheHit: false,
        }))
      }
      title="Cache First"
    >
      <div className="px-4 py-2.5" key={refreshCounter}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Cache First Strategy</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This strategy checks the cache first and only goes to the network if it can't find what it needs locally.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            variant="outline"
            className="bg-transparent hover:bg-red-50 text-red-600 border-2 outline-none border-red-500 dark:text-red-400 dark:hover:bg-red-900/25 focus:ring-red-500"
            onClick={() => setConfig(c => ({ ...c, isOffline: !c.isOffline }))}
          >
            {config.isOffline ? 'Come Online' : 'Go Offline'}
          </Button>
          <button
            onClick={clearCache}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1.5 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Clear Cache
          </button>
          <button
            onClick={() => setConfig(c => ({ ...c, expiration: c.expiration === 20 ? 30 : c.expiration === 30 ? 60 : 20 }))}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Set Expiration: {config.expiration === 20 ? '30s' : config.expiration === 30 ? '60s' : '20s'}
          </button>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 mb-6">
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            <code>
              {data.data}
            </code>
          </pre>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">Cache Hit: <span className="font-semibold">{data.cacheHit ? 'Yes' : 'No'}</span></p>
          <p className="mb-2">Network Status: <span className="font-semibold">{config.isOffline ? 'Offline' : 'Online'}</span></p>
          <p>Current Cache Expiration: <span className="font-semibold">{config.expiration}s</span></p>
        </div>
      </div>
    </Iframe>
  )
}

const CacheOnlyDemo = () => {
  const { refreshCounter, refresh } = useRefresh()
  const [data, setData] = useState<string | undefined>(undefined)
  const [config, setConfig] = useState({ isOffline: false, expiration: 10 })
  const [dataToCache, setDataToCache] = useState('')

  const URL = '/api/cache-only';

  const fetchData = useCallback(async () => {
    const cache = new CacheOnly('cache-text-demo', { maxAgeSeconds: config.expiration });

    try {
      const response = await cache.handleRequest(URL);
      const text = await response.text();
      setData(text);
    } catch (e) {
      setData('Error! No response found in cache.\nMake sure to always have a fallback, else things get ugly pretty fast 💥');
    }
  }, []);

  // This useEffect mocks our worker thread :)
  useEffect(() => {
    // We use an empty loader here cause cache only never reaches
    // the server.
    const fetchDataWithMockedFetch = createMockFetchWrapper(URL, async () => new Response())(fetchData);
    fetchDataWithMockedFetch();
  }, [refreshCounter, fetchData])

  const clearCache = () => {
    caches.open('cache-text-demo').then(cache => cache.delete(URL));
  }

  const putInCache = () => {
    const cache = new CacheOnly('cache-text-demo', { maxAgeSeconds: config.expiration });
    dataToCache.length && cache.addToCache(new Request(URL), new Response(dataToCache));
  }

  return (
    <Iframe
      title="Cache Only"
      handleRefresh={() =>
        refresh(() => setData(undefined))
      }
    >
      <div className="px-4 py-2.5 overflow-hidden" key={refreshCounter}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Cache Only Strategy</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This strategy checks the cache first and only goes to the network if it can't find what it needs locally.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            variant="outline"
            className="bg-transparent hover:bg-red-50 text-red-600 border-2 outline-none border-red-500 dark:text-red-400 dark:hover:bg-red-900/25 focus:ring-red-500"
            onClick={() => setConfig(c => ({ ...c, isOffline: !c.isOffline }))}
          >
            {config.isOffline ? 'Come Online' : 'Go Offline'}
          </Button>
          <button
            onClick={clearCache}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Clear Cache
          </button>
          <button
            onClick={() => setConfig(c => ({ ...c, expiration: c.expiration === 10 ? 30 : c.expiration === 30 ? 60 : 10 }))}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Set Expiration: {config.expiration === 10 ? '30s' : config.expiration === 30 ? '60s' : '10s'}
          </button>
        </div>
        <div className="flex gap-3 mb-6">
          {/* Input for putting in cache */}
          <input
            type="text"
            value={dataToCache}
            onChange={e => setDataToCache(e.target.value)}
            placeholder="Enter data to cache"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent text-dark dark:text-white"
          />
          <button
            onClick={putInCache}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Cache
          </button>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 mb-6">
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            <code>{data}</code>
          </pre>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">Network Status: <span className="font-semibold">{config.isOffline ? 'Offline' : 'Online'}</span></p>
          <p>Current Cache Expiration: <span className="font-semibold">{config.expiration}s</span></p>
        </div>
      </div>
    </Iframe>
  )
}

const NetworkFirstDemo = () => {
  const { refreshCounter, refresh } = useRefresh()
  const { promise, reset, set } = usePromise<string>()
  const [config, setConfig] = useState({
    isOffline: false,
    networkTimeout: 2,
    throttleNetwork: '3g' as '2g' | '3g' | '4g'
  })

  const SERVER_DATA = 'Raw data from server.\nCurrent time is: ' + new Date().toLocaleTimeString()
  const URL = '/api/network-first';

  const fetchData = useCallback(async () => {
    const cache = new NetworkFirst('cache-text-demo', {
      networkTimeoutInSeconds: config.networkTimeout
    });

    try {
      const response = await cache.handleRequest(URL);
      const text = await response.text();
      const wasCacheHit = response.headers.get('x-cache-hit') === 'true';
      set((wasCacheHit ? text.replace('Current', 'Cached').replace('Raw data from server', 'Cached content') : text) + '\nActual time is: ' + new Date().toLocaleTimeString());
    } catch (e) {
      set('Error! Network timeout and no response found in cache either.');
    }
  }, []);

  const fetchLoader = async () => {
    const timeout = config.throttleNetwork === '2g' ? 3_150 : config.throttleNetwork === '3g' ? 1_900 : 700;

    if (config.isOffline) {
      throw new Error('Failed to fetch')
    }

    await new Promise(res => setTimeout(res, timeout)) /* Server stuffs */

    return new Response(SERVER_DATA)
  }

  useEffect(() => {
    const fetchDataWithMockedFetch = createMockFetchWrapper(URL, fetchLoader)(fetchData);
    fetchDataWithMockedFetch();
  }, [refreshCounter, fetchData])

  const clearCache = () => {
    caches.open('cache-text-demo').then(cache => cache.delete(URL));
  }

  return (
    <Iframe
      title="Network First"
      handleRefresh={() =>
        refresh(() => reset())
      }
    >
      <div className="px-4 py-2.5 overflow-hidden" key={refreshCounter}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Network First Strategy</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This strategy tries to fetch fresh data from the network first, falling back to the cache if the network is unavailable.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 md:text-sm font-semibold">
          <Button
            variant="outline"
            color="red"
            className="dark:hover:bg-red-900/25 md:text-sm"
            onClick={() => setConfig(c => ({ ...c, isOffline: !c.isOffline }))}
          >
            {config.isOffline ? 'Come Online' : 'Go Offline'}
          </Button>
          <Button
            onClick={clearCache}
            variant="ghost"
            color="yellow"
            className="md:text-sm"
          >
            Clear Cache
          </Button>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 mb-6">
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            <Suspense fallback={<div>Page Loading...</div>}>
              <Await resolve={promise}>
                {(resolvedData) => <code>{resolvedData}</code>}
              </Await>
            </Suspense>
          </pre>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-2">Network Status: <span className="font-semibold text-gray-700 dark:text-gray-300">{config.isOffline ? 'Offline' : 'Online'}</span></p>
          <div className="mb-2 flex items-center gap-2">
            <span className="whitespace-nowrap max-w-min">Current Network Timeout:</span>
            <ButtonGroup join className="inline-flex border-collapse flex-row">
              {[2, 3].map(timeout => (
                <Button
                  key={timeout}
                  size="sm"
                  variant={config.networkTimeout === timeout ? 'solid' : 'outline'}
                  onClick={() => setConfig(c => ({ ...c, networkTimeout: timeout }))}
                  className={cn(
                    'ring-0 outline-none focus:shadow-none ring-offset-0',
                    'focus:ring-offset-0 focus:ring-0',
                    config.networkTimeout === timeout ? 'font-semibold' : 'font-normal'
                  )}
                >
                  {timeout}s
                </Button>
              ))}
            </ButtonGroup>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="whitespace-nowrap max-w-min">Current Network Speed:</span>
            <ButtonGroup join className="inline-flex border-collapse flex-row">
              {(['2g', '3g', '4g'] as const).map(speed => (
                <Button
                  key={speed}
                  size="sm"
                  color="purple"
                  variant={config.throttleNetwork === speed ? 'solid' : 'outline'}
                  onClick={() => setConfig(c => ({ ...c, throttleNetwork: speed }))}
                  className={cn(
                    'ring-0 outline-none focus:shadow-none ring-offset-0',
                    'focus:ring-offset-0 focus:ring-0',
                    config.throttleNetwork === speed ? 'font-semibold' : 'font-normal'
                  )}
                >
                  {speed}
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </div>
      </div>
    </Iframe>
  )
}

const StaleWhileRevalidateDemo = () => {
  const { refreshCounter, refresh } = useRefresh()
  const [data, setData] = useState<string | undefined>(undefined)
  const [config, setConfig] = useState({ isOffline: false })

  const SERVER_DATA = 'Raw data from server.\nCurrent time is: ' + new Date().toLocaleTimeString()
  const URL = '/api/stale-while-revalidate';

  const fetchData = useCallback(async () => {
    const cache = new StaleWhileRevalidate('cache-text-demo');
    const response = await cache.handleRequest(URL);
    const text = await response.text();
    setData(text + '\nActual time is: ' + new Date().toLocaleTimeString());
  }, []);

  const fetchLoader = async () => {
    if (config.isOffline) {
      throw new Error('Failed to fetch')
    }

    await new Promise(res => setTimeout(res, 800)) /* Server stuffs */

    return new Response(SERVER_DATA, { status: 200 })
  }

  useEffect(() => {
    const fetchDataWithMockedFetch = createMockFetchWrapper(URL, fetchLoader)(fetchData);
    fetchDataWithMockedFetch();
  }, [refreshCounter, fetchData])

  const clearCache = () => {
    caches.open('cache-text-demo').then(cache => cache.delete(URL));
  }

  return (
    <Iframe
      title="Stale While Revalidate"
      handleRefresh={() =>
        refresh(() => setData(undefined))
      }
    >
      <div className="px-4 py-2.5 overflow-hidden" key={refreshCounter}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Stale While Revalidate Strategy</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This serves cached content immediately while fetching updates in the background. It's perfect for balancing speed and freshness.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button
            variant="outline"
            className="bg-transparent hover:bg-red-50 text-red-600 border-2 outline-none border-red-500 dark:text-red-400 dark:hover:bg-red-900/25 focus:ring-red-500"
            onClick={() => setConfig(c => ({ ...c, isOffline: !c.isOffline }))}
          >
            {config.isOffline ? 'Come Online' : 'Go Offline'}
          </Button>
          <Button
            onClick={clearCache}
            variant="solid"
            color="secondary"
          // className="bg-neon hover:bg-yellow-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            Clear Cache
          </Button>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3 mb-6">
          <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            <code>{data}</code>
          </pre>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-0">Network Status: <span className="font-semibold">{config.isOffline ? 'Offline' : 'Online'}</span></p>
        </div>
      </div>
    </Iframe>
  )
}
