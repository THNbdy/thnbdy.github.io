// BiliRandom Cloudflare Worker - 反代 B站 API + 边缘缓存
// 部署：npx wrangler deploy（需先 npm i -g wrangler 并登录）
// 免费套餐：10万次/天，单次CPU 10ms（本脚本每次 ~1-2ms，远低于上限）

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)

  // 路径格式：https://worker.example.workers.dev/api.bilibili.com/x/...
  //      → https://api.bilibili.com/x/...
  const target = 'https://' + url.pathname.replace(/^\//, '') + url.search

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'Referer': 'https://www.bilibili.com/',
    'Origin': 'https://www.bilibili.com'
  }

  // 可缓存的接口白名单（GET 且为只读查询）
  const CACHEABLE = [
    '/x/web-interface/wbi/search',
    '/x/web-interface/dynamic/region',
    '/x/web-interface/ranking/',
    '/x/article/newlist',
    '/x/topic/pub/search',
    '/room/v1/room/get_user_recommend',
    '/link_draw/v2/Doc/index'
  ]

  const isCacheable = CACHEABLE.some(p => url.pathname.includes(p))

  // 尝试读缓存
  const cache = caches.default
  if (isCacheable) {
    const cached = await cache.match(request)
    if (cached) return cached
  }

  // 请求上游
  const upstream = await fetch(target, { headers, method: request.method })

  // 构造响应：加 CORS 头
  const resp = new Response(upstream.body, upstream)
  resp.headers.set('Access-Control-Allow-Origin', '*')
  resp.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  resp.headers.set('Access-Control-Allow-Headers', 'Content-Type')

  // 可缓存接口：边缘缓存 60 秒
  if (isCacheable && upstream.status === 200) {
    resp.headers.set('Cache-Control', 'public, max-age=60')
    request.waitUntil(cache.put(request, resp.clone()))
  }

  return resp
}

// 处理 CORS 预检
addEventListener('fetch', event => {
  if (event.request.method === 'OPTIONS') {
    event.respondWith(new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
      }
    }))
  }
})
