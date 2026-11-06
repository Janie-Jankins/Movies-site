import { setDefaultResultOrder } from 'node:dns'
import { Readable } from 'node:stream'
import { SAMPLE_VIDEOS } from '../src/config.js'

setDefaultResultOrder('ipv4first')

const videosById = new Map(SAMPLE_VIDEOS.map((video) => [video.id, video]))
const rangePattern = /^bytes=(?:\d+-\d*|-\d+)$/

function sendText(res, status, message, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  })
  res.end(message)
}

export async function handleMediaRequest(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendText(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' })
    return
  }

  const path = new URL(req.url || '/', 'http://localhost').pathname
  let id
  try {
    id = decodeURIComponent(path.split('/').filter(Boolean).at(-1) || '')
  } catch {
    sendText(res, 400, 'Invalid sample video ID')
    return
  }
  const video = videosById.get(id)
  if (!video) {
    sendText(res, 404, 'Sample video not found')
    return
  }

  const range = req.headers.range
  if (range && (range.length > 100 || !rangePattern.test(range))) {
    sendText(res, 400, 'Invalid byte range')
    return
  }

  const controller = new AbortController()
  req.once('aborted', () => controller.abort())
  res.once('close', () => {
    if (!res.writableEnded) controller.abort()
  })

  try {
    const upstream = await fetch(video.src, {
      method: req.method,
      headers: range ? { Range: range } : undefined,
      signal: controller.signal,
    })

    if (upstream.status !== 200 && upstream.status !== 206) {
      await upstream.body?.cancel()
      sendText(res, 502, 'The sample video provider is unavailable')
      return
    }

    const headers = {
      'Content-Type': upstream.headers.get('content-type') || 'video/mp4',
      'Cache-Control': 'private, no-store',
      'Accept-Ranges': upstream.headers.get('accept-ranges') || 'bytes',
      Vary: 'Range',
    }
    for (const name of ['content-length', 'content-range']) {
      const value = upstream.headers.get(name)
      if (value) headers[name] = value
    }

    res.writeHead(upstream.status, headers)
    if (req.method === 'HEAD' || !upstream.body) {
      res.end()
      return
    }

    const stream = Readable.fromWeb(upstream.body)
    stream.once('error', (error) => {
      console.error('Sample video stream failed:', error)
      if (!res.destroyed) res.destroy(error)
    })
    res.once('close', () => {
      if (!res.writableEnded) stream.destroy()
    })
    stream.pipe(res)
  } catch (error) {
    if (controller.signal.aborted) return
    console.error('Sample video request failed:', error)
    if (!res.headersSent) sendText(res, 502, 'The sample video provider is unavailable')
    else if (!res.destroyed) res.destroy(error)
  }
}
