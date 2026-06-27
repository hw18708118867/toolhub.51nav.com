# DevTools Hub

Free, fast, and easy-to-use online developer tools for programmers. Built with Jekyll and ready to deploy on GitHub Pages.

## Features

- **JSON Formatter & Validator** - Format, validate, and beautify JSON
- **Base64 Encoder & Decoder** - Encode and decode Base64 strings
- **UUID Generator** - Generate UUID v4 in bulk
- **Regex Tester** - Test and debug regular expressions
- **CSS Gradient Generator** - Create beautiful CSS gradients
- **Color Picker & Converter** - Pick colors and convert between HEX, RGB, HSL

## Design

- Dark mode by default (with light mode option)
- Responsive design for all screen sizes
- Clean, minimalist UI focused on functionality
- Optimized for SEO

## Development

### Prerequisites

- Ruby 3.0+
- Bundler

### Local Setup

1. Install dependencies:
```bash
bundle install
```

2. Run the development server:
```bash
bundle exec jekyll serve
```

3. Open your browser and visit: `http://localhost:4000`

### Build for Production

```bash
bundle exec jekyll build
```

## Deployment on GitHub Pages

### Step 1: Create a GitHub Repository

1. Create a new repository on GitHub
2. Push your code to the repository

### Step 2: Configure GitHub Pages

1. Go to your repository's **Settings**
2. Navigate to the **Pages** section
3. Under **Build and deployment**:
   - Select **Deploy from a branch**
   - Choose the `main` (or `master`) branch
   - Select the `/ (root)` folder
4. Click **Save**

### Step 3: Set Up Custom Domain (Optional)

1. Create a `CNAME` file in the root of your repository:
```
devtoolshub.com
```

2. Configure DNS with your domain registrar:
   - Add a CNAME record: `www` → `your-username.github.io`
   - Or add A records for apex domain pointing to GitHub's servers

### Step 4: Enable Plugins

GitHub Pages supports `jekyll-sitemap` and `jekyll-seo-tag` by default, no extra configuration needed.

## Google AdSense Setup

1. Sign up for [Google AdSense](https://www.google.com/adsense/)
2. Once approved, update `_config.yml` with your client ID
3. Uncomment the AdSense code in the template files

## SEO Optimization

- Page titles and descriptions for all tools
- Sitemap generated automatically
- robots.txt included
- Open Graph tags
- Schema markup for tools

## Adding New Tools

1. Create a new file in `_tools/` (e.g., `my-tool.md`)
2. Add front matter with title, description, etc.
3. Create the tool's JavaScript in `assets/js/tools/`
4. Update navigation links in `_includes/header.html` and homepage

## Project Structure

```
/
├── _config.yml          # Site configuration
├── Gemfile              # Ruby dependencies
├── index.html           # Homepage
├── robots.txt           # SEO crawler rules
├── _layouts/            # Page templates
├── _includes/           # Reusable components
├── _tools/              # Tool pages
├── assets/
│   ├── css/
│   │   └── main.css     # Main stylesheet
│   ├── js/
│   │   ├── theme.js     # Dark/light theme toggle
│   │   ├── utils.js     # Utility functions
│   │   └── tools/       # Tool-specific JS
│   └── images/
└── blog/                # Blog section
```

## License

MIT
