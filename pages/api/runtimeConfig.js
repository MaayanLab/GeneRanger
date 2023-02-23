export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      NEXT_PUBLIC_ENTRYPOINT: process.env.NEXT_PUBLIC_ENTRYPOINT || '',
      NEXT_PUBLIC_TARGETRANGERURL: process.env.NEXT_PUBLIC_TARGETRANGERURL || '',
      NEXT_PUBLIC_DOWNLOADS: process.env.NEXT_PUBLIC_DOWNLOADS || '',
    })
  } else {
    res.status(404).end()
  }
}