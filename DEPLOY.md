# Deploying to Vercel 🚀

## Quick Deploy Options

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? (Select your account)
   - Link to existing project? **No**
   - Project name? (Press Enter for default or enter a custom name)
   - Directory? (Press Enter for `./`)
   - Override settings? **No**

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via GitHub

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub repository** and push:
   ```bash
   git remote add origin <your-github-repo-url>
   git branch -M main
   git push -u origin main
   ```

3. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"

### Option 3: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag and drop your project folder
3. Vercel will automatically detect Next.js and deploy

## Environment Variables

No environment variables needed for this project!

## Build Settings

Vercel will automatically detect:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Post-Deployment

After deployment, you'll get:
- ✅ Production URL (e.g., `your-project.vercel.app`)
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on git push (if using GitHub)

## Custom Domain

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

**Build fails?**
- Check that all dependencies are in `package.json`
- Ensure Node.js version is 18+ in Vercel settings

**Type errors?**
- Run `npm run build` locally first to catch errors

**Deployment works but app doesn't load?**
- Check browser console for errors
- Verify all routes are working

---

**Your app is ready to deploy! 🎉**

