/** Minimal Server-Sent Events parser for a fetch() body (EventSource can't POST). */
export async function* readSSE(response) {
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
  let buf = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += value
    let i
    while ((i = buf.indexOf('\n\n')) >= 0) {
      const raw = buf.slice(0, i)
      buf = buf.slice(i + 2)
      let event = 'message'
      let data = ''
      for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim()
        else if (line.startsWith('data:')) data += line.slice(5).trim()
      }
      if (data) yield { event, data: JSON.parse(data) }
    }
  }
}
