import { Buffer } from "buffer";

// api/image.js
export default async function handler(req:any, res:any) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).send('Image URL is required');
    }

    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // كاش ليوم كامل
        res.status(200).send(buffer);
    } catch (error) {
        res.status(500).send('Error fetching image');
    }
}