# Deployment Guide

This guide will walk you through deploying DevTools Hub to GitHub Pages.

## Quick Start

### 1. Prepare the Repository

Create a new git repository and commit your code:

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Create GitHub Repository

Go to [GitHub](https://github.com/new) and create a new repository.

Then push your code:

```bash
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - **Deploy from a branch**
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
4. Click **Save**

Your site will be live at: `https://your-username.github.io/your-repo/`

## Custom Domain Setup

### Step 1: Update _config.yml

Change the `url` and `baseurl` settings:

```yaml
# For custom domain
url: "https://devtoolshub.com"
baseurl: ""

# OR for project page
url: "https://your-username.github.io"
baseurl: "/your-repo"
```

### Step 2: Create CNAME File

Create a file named `CNAME` in the root:

```
devtoolshub.com
```

### Step 3: Configure DNS

With your domain registrar, set up these records:

**Option A: Root domain (e.g., devtoolshub.com)**
```
A @ 185.199.108.153
A @ 185.199.109.153
A @ 185.199.110.153
A @ 185.199.111.153
```

**Option B: www subdomain (e.g., www.devtoolshub.com)**
```
CNAME www your-username.github.io
```

Wait for DNS propagation (can take up to 24 hours).

### Step 4: Enable HTTPS

In GitHub Pages settings, check **Enforce HTTPS** (may need to wait for DNS to propagate first).

## Google AdSense

### 1. Apply for AdSense

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up and submit your site for review

### 2. Get Your Client ID

Once approved, find your client ID (looks like `ca-pub-1234567890123456`)

### 3. Update _config.yml

```yaml
adsense_client: ca-pub-1234567890123456
```

### 4. Uncomment AdSense Code

In the template files (e.g., `_includes/ad-top.html`, `_includes/ad-sidebar.html`), uncomment the AdSense code and replace with your client ID and ad slot IDs.

## Google Search Console

### 1. Add Your Site

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Add your site URL
3. Verify ownership (via DNS record, HTML file, or Google Analytics)

### 2. Submit Sitemap

1. In Search Console, go to **Sitemaps**
2. Add: `https://your-domain.com/sitemap.xml`

### 3. Request Indexing

1. Go to **URL inspection tool**
2. Enter your homepage URL
3. Click **Request Indexing**

## Performance Tips

1. Keep images small and compressed
2. Minify CSS/JS (Jekyll can do this automatically)
3. Use CDN for external libraries
4. Monitor with PageSpeed Insights

## Troubleshooting

### Site not updating?

- Wait a few minutes for GitHub Pages to build
- Try a hard refresh (Ctrl+Shift+R)
- Check the "Deployments" tab for build errors

### Links not working?

- Double-check `baseurl` in `_config.yml`
- Use absolute paths with `{{ '/page/' | relative_url }}`

### Custom domain not working?

- Verify your CNAME file is in the repository
- Check DNS propagation with `dig` or `nslookup`
- Make sure you're using HTTPS

## Next Steps After Deployment

1. **Monitor Traffic**: Set up Google Analytics
2. **Add Content**: Write blog posts about using the tools
3. **Promote**: Share on Reddit, Hacker News, Twitter, etc.
4. **Iterate**: Monitor feedback and add new tools
5. **Optimize**: Track rankings and improve SEO
