# Vercel Deployment Guide (Full-Stack React + Express) 🚀

Is guide mein shuru se aakhir tak project ko Vercel par live karne ka mukammal tareeqa likha hai. Kyun ke hamara project Full-Stack hai (React Frontend + Node.js Backend), isliye deployment ke liye kuch zaroori steps follow karne honge.

---

## Step 1: Online Database Setup (Zaroori hai!)
Vercel par `localhost` wala database (XAMPP/PgAdmin) nahi chalta, isliye aapko aik online database chahiye hoga.

1. **Neon.tech** par jayein (Yeh Prisma/PostgreSQL ke liye best aur free hai).
2. Account banayein, naya project banayein aur **PostgreSQL 15 ya 16** select karein.
3. Wahan se aapko aik **Connection String** milegi jo aisi dikhegi:
   `postgresql://user:password@hostname.neon.tech/dbname?sslmode=require`
4. Is string ko apne paas copy karke rakh lein, yeh aapka naya `DATABASE_URL` hoga.

---

## Step 2: Code Files Mein Tabdeeli (Necessary Changes)

### 1. `vercel.json` banana (Agr pehle se nahi hai)
Apne project ke main folder mein aik file banayein jiska naam **`vercel.json`** rakhein aur usme yeh code copy kar dein:
```json
{
  "version": 2,
  "builds": [
    { "src": "index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "index.js" }
  ]
}
```

### 2. `package.json` Update Karna
Vercel ko batana hai ke pehle React app ko "build" kare taake `dist` folder ban jaye aur backend usko read kar sake. Apni `package.json` file open karein aur `scripts` wale hisse mein **`vercel-build`** add karein:

```json
"scripts": {
  "dev": "concurrently \"npm run server\" \"vite\"",
  "build": "vite build",
  "preview": "vite preview",
  "server": "nodemon index.js",
  "vercel-build": "prisma generate && vite build"
}
```
*(Yahan humne `vite build` shamil kiya hai taake Vercel server par frontend tayar ho jaye).*

---

## Step 3: GitHub par Code Upload Karein
1. Apne code ko **GitHub** par aik nayi (Private ya Public) repository mein push karein.
2. Ensure karein ke `.env` file aur `node_modules` folder upload **NA HON** (yeh GitHub ignore kar dega agar `.gitignore` theek hai).

---

## Step 4: Vercel par Deploy Karna
1. **[Vercel.com](https://vercel.com/)** par login karein.
2. **"Add New Project"** par click karein aur apni GitHub wali repository ko **"Import"** karein.
3. Project setup screen par **"Environment Variables"** wale section ko open karein. Yahan aapko apni saari keys add karni hain:

   - **Name:** `DATABASE_URL` 
     **Value:** (Neon.tech wali lambi string)
   
   - **Name:** `GEOLOCATION_API_KEY` 
     **Value:** (Aapki API key - e.g., 0bf366ee12b64927...)
   
   - **Name:** `JWT_SECRET`
     **Value:** (Koi bhi secret password, jaise `shorty_jwt_super_secret_2024`)

   - **Name:** `PORT`
     *(Isay add karne ki zaroorat nahi, Vercel apna port khud set karta hai).*

4. Sab add karne ke baad **"Deploy"** button par click kar dein! 🚀

---

## Step 5: Troubleshooting (Agar masla aaye)
- Agar Vercel table nahi dhoond paa raha database mein (Table doesn't exist error): Apne computer ke terminal mein command run karein: `npx prisma db push`. Yeh terminal local `.env` uthayega toh online database connected hona ahem hai.
- Agar build fail ho jaye toh Vercel ke dashboard mein **"Logs"** tab check karein ke kahan error hai.
- Yaad rahe, proxy settings jo humne `/api` ke liye `vite.config.js` mein ki thi wo development ke liye theen, Vercel build automatically theek kaam karegi!

---

**Mubarak ho! 🎉** Aapka Full-Stack URL Shortener ab poori dunya mein online chal raha hai! 🌍🔥
