# 🚀 GitHub Pages Setup Instructions

## Quick Setup Guide

### 1. Repository Setup
1. Push your code to GitHub repository
2. Go to your repository on GitHub
3. Navigate to **Settings** → **Pages**
4. Under **Source**, select **"GitHub Actions"**

### 2. Automatic Deployment
- Every push to `main` branch will trigger automatic deployment
- The app will be available at: `https://yourusername.github.io/push-app/`
- First deployment may take 2-3 minutes

### 3. Custom Domain (Optional)
To use a custom domain:

1. **Add CNAME file:**
   ```bash
   echo "your-domain.com" > public/CNAME
   ```

2. **Update vite.config.ts:**
   ```typescript
   base: process.env.NODE_ENV === 'production' ? '/' : '/',
   ```

3. **Configure DNS:**
   - Add CNAME record pointing to `yourusername.github.io`
   - Or A records pointing to GitHub Pages IPs

### 4. GitHub Actions Workflow

The repository includes two workflows:

#### `deploy.yml` - Production Deployment
- Runs on push to `main` branch
- Builds and deploys to GitHub Pages
- Only deploys successful builds

#### `ci.yml` - Continuous Integration  
- Runs on all branches
- Tests code quality and build process
- Runs on Node.js 18.x and 20.x

### 5. Local Development with Production Base

To test with production base URL locally:

```bash
# Build with production settings
NODE_ENV=production npm run build

# Preview the build
npm run preview
```

### 6. Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Install gh-pages (already included)
npm install --save-dev gh-pages

# Deploy manually
npm run deploy
```

### 7. Troubleshooting

#### Assets not loading
- Check that `base` is set correctly in `vite.config.ts`
- Ensure your repository name matches the base path

#### Service Worker issues
- Clear browser cache and storage
- Check console for service worker errors
- Try in incognito mode

#### PWA not installable
- Ensure HTTPS (GitHub Pages provides this)
- Check manifest.json is accessible
- Verify all required PWA assets are present

### 8. Environment Variables

The app automatically detects production environment:
- `NODE_ENV=production` - Sets production base URL
- Base URL automatically set to `/push-app/` for GitHub Pages

### 9. Performance Optimization

Current bundle size: ~761KB (225KB gzipped)

To optimize further:
- Enable dynamic imports for routes
- Use Vite's manual chunks configuration
- Consider lazy loading heavy components

### 10. Security Headers

The `public/_headers` file includes security headers:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

---

## Quick Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages (manual)
npm run deploy

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🎉 That's it!

Your Push-Up Counter PWA is now ready for deployment to GitHub Pages!
