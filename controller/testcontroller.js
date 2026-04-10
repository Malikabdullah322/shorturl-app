import prisma from "../config/db.js";
import axios from 'axios';
import { nanoid } from 'nanoid';
import { UAParser } from 'ua-parser-js';

const getCountryFromIP = async (ip) => {
    try {
        const apiKey = process.env.GEOLOCATION_API_KEY;
        if (!apiKey || !ip || ip === 'Unknown') return 'Unknown';

        const r = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`, { timeout: 4000 });
        const country = r.data?.country_name || 'Unknown';
        return country.replace(/^The\s+/i, '');
    } catch (err) {
        return 'Unknown';
    }
};

export const shorten = async (req, res) => {
    try {
        let { url, expiresAt, customAlias } = req.body;
        if (!url) return res.status(400).json({ error: "URL is required" });

        if (!/^https?:\/\//i.test(url)) url = `https://${url}`;

        // Basic validation for double dots or empty host segments
        try {
            const parsed = new URL(url);
            const host = parsed.hostname;
            if (!host || host.includes('..') || !host.includes('.') || /[^a-zA-Z0-9.-]/.test(host)) {
                return res.status(400).json({ error: "Invalid URL format" });
            }
        } catch (e) {
            return res.status(400).json({ error: "Invalid URL" });
        }

        // Global check for suspicious consecutive characters like ;; or ,,
        if (/[,;]{2,}/.test(url)) {
            return res.status(400).json({ error: "Invalid URL format (avoid consecutive symbols)" });
        }

        const shortCode = customAlias || nanoid(6);
        if (customAlias) {
            const existing = await prisma.link.findUnique({ where: { shortCode } });
            if (existing) return res.status(400).json({ error: "Name already taken" });
        }

        const link = await prisma.link.create({
            data: {
                originalUrl: url,
                shortCode,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                userId: req.user.id
            },
        });

        res.status(201).json({ message: "Success", link });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const redirect = async (req, res, next) => {
    try {
        const { code } = req.params;
        const link = await prisma.link.findUnique({ where: { shortCode: code } });

        if (!link) return next();

        if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
            return res.status(410).send("<h1>Error: Link Expired</h1>");
        }

        // 1. Identify Client Metadata
        const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const purpose = (req.headers['purpose'] || req.headers['sec-purpose'] || req.headers['x-purpose'] || '').toLowerCase();

        // 2. Ignore obvious Prefetch/Preview/Check requests early
        if (purpose.includes('prefetch') || purpose.includes('preview') || purpose.includes('check')) return next();

        // 3. Serve the loader page which will trigger the REAL click via JavaScript
        res.send(`
        <!DOCTYPE html><html><head><title>Redirecting...</title>
        <style>
            body{font-family:sans-serif;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#F3F4F6;margin:0;gap:20px;}
            .loader{width:48px;height:48px;border:5px solid #FFF;border-bottom-color:#3B82F6;border-radius:50%;animation:rot 1s linear infinite;}
            .text{font-weight:600;color:#64748B;font-size:14px;letter-spacing:0.5px;}
            @keyframes rot{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
        </style></head>
        <body>
            <div class="loader"></div>
            <div class="text">Redirecting you securely...</div>
            <script>
                (async () => {
                    const trackingData = {
                        linkId: ${link.id},
                        ip: "${ip}",
                        userAgent: navigator.userAgent
                    };
                    
                    try {
                        // Trigger tracking only for browsers that execute JS (Real Users)
                        await fetch('/api/track-click', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(trackingData),
                            keepalive: true
                        });
                    } catch (e) {
                        console.warn("Tracking failed, proceeding with redirect.");
                    } finally {
                        // Perform the final redirect
                        window.location.href = "${link.originalUrl}";
                    }
                })();
            </script>
        </body></html>`);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const trackClick = async (req, res) => {
    try {
        const { linkId, ip, userAgent } = req.body;
        const country = await getCountryFromIP(ip);
        const parser = new UAParser(userAgent);

        await prisma.click.create({
            data: {
                linkId: parseInt(linkId),
                ip: ip || 'Unknown',
                country,
                browser: parser.getBrowser().name || 'Unknown',
                os: parser.getOS().name || 'Unknown'
            }
        });
        res.sendStatus(200);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getDashboardData = async (req, res) => {
    try {
        const { country } = req.query;
        const query = { userId: req.user.id, ...(country ? { clicks: { some: { country } } } : {}) };

        const [totalLinks, totalClicks, rawLinks] = await Promise.all([
            prisma.link.count({ where: query }),
            prisma.click.count({ where: { link: { userId: req.user.id }, ...(country ? { country } : {}) } }),
            prisma.link.findMany({
                where: query,
                include: { clicks: country ? { where: { country } } : true, _count: { select: { clicks: true } } },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        const links = rawLinks.map(l => ({
            id: l.id,
            shortCode: l.shortCode,
            originalUrl: l.originalUrl,
            clicks: country ? (l.clicks?.length || 0) : (l._count?.clicks || 0),
            expiresAt: l.expiresAt,
            createdAt: l.createdAt
        }));

        const topLink = [...links].sort((a, b) => b.clicks - a.clicks)[0] || null;

        const countryStats = {};
        const allClicksForChart = await prisma.click.findMany({
            where: {
                link: { userId: req.user.id },
                ...(country ? { country } : {})
            }
        });
        allClicksForChart.forEach(c => {
            const name = c.country || 'Unknown';
            countryStats[name] = (countryStats[name] || 0) + 1;
        });

        res.json({ totalLinks, totalClicks, topLink, links, countryStats });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getStats = async (req, res) => {
    try {
        const { code } = req.params;
        const link = await prisma.link.findFirst({
            where: { shortCode: code, userId: req.user.id },
            include: { clicks: { orderBy: { timestamp: 'desc' } } }
        });

        if (!link) return res.status(404).json({ error: "Not Found" });

        const countryStats = {};
        link.clicks.forEach(c => {
            const name = c.country || 'Unknown';
            countryStats[name] = (countryStats[name] || 0) + 1;
        });

        const dateStats = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            dateStats[d.toISOString().split('T')[0]] = 0;
        }
        link.clicks.forEach(c => {
            const d = new Date(c.timestamp).toISOString().split('T')[0];
            if (dateStats[d] !== undefined) dateStats[d]++;
        });

        res.json({ ...link, totalClicks: link.clicks.length, countryStats, dateStats });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getAllCountries = async (req, res) => {
    try {
        const c = await prisma.click.findMany({
            where: { link: { userId: req.user.id } },
            distinct: ['country'],
            select: { country: true },
            orderBy: { country: 'asc' }
        });
        res.json({ countries: c.map(i => i.country).filter(Boolean) });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getAllClicks = async (req, res) => {
    try {
        const clicks = await prisma.click.findMany({
            where: { link: { userId: req.user.id } },
            orderBy: { timestamp: 'desc' },
            include: { link: { select: { shortCode: true, originalUrl: true } } }
        });
        res.json({ clicks });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const deleteLink = async (req, res) => {
    const { id } = req.params;
    try {
        const linkId = parseInt(id);

        const link = await prisma.link.findFirst({
            where: { id: linkId, userId: req.user.id }
        });

        if (!link) {
            return res.status(404).json({ error: "Link not found or unauthorized" });
        }

        // Delete associated clicks and the link in a transaction
        await prisma.$transaction([
            prisma.click.deleteMany({ where: { linkId } }),
            prisma.link.delete({ where: { id: linkId } })
        ]);

        res.json({ message: "Link deleted successfully" });
    } catch (e) {
        console.error("DEBUG: Delete failed for ID", id, e);
        res.status(500).json({ error: e.message });
    }
};
