# RJN PRINT PORTAL upgraded project

## Upload from Android
1. Download and extract this ZIP.
2. Open your GitHub repository and choose Add file → Upload files.
3. Upload root files `package.json`, `server.js`, `render.yaml`, `README.md`, `.gitignore`.
4. Upload `public/index.html`, `public/style.css`, and `public/app.js` under a `public` folder. Keep the exact structure shown in the ZIP.
5. Commit changes.

## Render settings
Build command: `npm install`
Start command: `npm start`
Set `ADMIN_EMAIL`, a strong `ADMIN_PASSWORD`, and a random `SESSION_SECRET` of at least 32 characters in Render Environment.

Important: this is an upgraded starter, not a fully production-certified identity-document platform. Browser-local tools do not upload the customer's chosen files to this server. Some advanced features such as OCR/AI and PDF password removal require compatible libraries and testing before they can be described as working. The PAN tracking card opens the official Protean/NSDL tracking page. Use managed database and durable private storage before processing real customer data; Render's local filesystem can reset.
