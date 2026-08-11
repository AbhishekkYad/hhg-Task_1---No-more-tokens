import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'og-image-endpoint',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/api/og')) {
            const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const format = url.searchParams.get('format') || 'format-a';
            const theme = url.searchParams.get('theme') || 'goa-emerald';
            const frame = url.searchParams.get('frame') || 'classic-arch';
            const name = url.searchParams.get('name') || 'Team No More Tokens';
            const title = url.searchParams.get('title') || 'AI & Web3 Sorcerer';
            const handle = url.searchParams.get('handle') || 'no_more_tokens';

            const bg = theme === 'sunset-gold' ? '#3B1800' : theme === 'cyber-lime' ? '#002B1D' : theme === 'royal-pink' ? '#380020' : '#08381D';
            const gold = '#F5CE15';
            const pink = '#E6007E';

            const svg = `<?xml version="1.0" encoding="UTF-8"?>
            <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
              <rect width="1200" height="630" fill="${bg}"/>
              <rect x="20" y="20" width="1160" height="590" rx="24" fill="none" stroke="${gold}" stroke-width="6"/>
              <rect x="36" y="36" width="1128" height="558" rx="16" fill="none" stroke="${pink}" stroke-width="3" stroke-dasharray="12 12"/>
              <text x="600" y="120" font-family="sans-serif" font-weight="900" font-size="28" fill="${gold}" text-anchor="middle" letter-spacing="4">GOA, INDIA</text>
              <text x="600" y="190" font-family="sans-serif" font-weight="900" font-size="56" fill="${gold}" text-anchor="middle">HACKER HOUSE GOA 2026</text>
              <text x="600" y="310" font-family="sans-serif" font-weight="900" font-size="52" fill="${gold}" text-anchor="middle">${name}</text>
              <text x="600" y="390" font-family="sans-serif" font-weight="800" font-size="38" fill="${pink}" text-anchor="middle">${title}</text>
              <text x="600" y="460" font-family="sans-serif" font-weight="700" font-size="30" fill="#FFFFFF" text-anchor="middle">@${handle}</text>
              <rect x="420" y="510" width="360" height="54" rx="27" fill="${pink}"/>
              <text x="600" y="546" font-family="sans-serif" font-weight="800" font-size="22" fill="#FFFFFF" text-anchor="middle">OFFICIAL ${format === 'format-b' ? 'BUILDER PASS' : 'PFP FRAME'}</text>
            </svg>`;

            res.setHeader('Content-Type', 'image/svg+xml');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.end(svg);
            return;
          }
          next();
        });
      }
    }
  ]
});
