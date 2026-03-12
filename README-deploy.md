# Deploying North Star Maintenance site

This repository is a static site (HTML/CSS/JS). Below are simple ways to make it live.

Recommended: GitHub Pages (automatic from GitHub Actions)

1) Create a GitHub repo and push your local files:

```bash
cd /path/to/north-star-site
git init
git add .
git commit -m "Initial site"
git branch -M main
# create repo on GitHub and copy the repo URL, then:
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

2) Enable automatic deploy via the included GitHub Action: once you push to `main`, the workflow `.github/workflows/deploy.yml` will run and deploy the repository root to a `gh-pages` branch. GitHub Pages will serve it (site URL will be `https://<your-username>.github.io/<repo>`).

Alternative quick deploys:
- Netlify: drag-and-drop the project folder, or connect the GitHub repo for continuous deploys.
- Vercel: `vercel` CLI or connect the GitHub repo in the Vercel dashboard.

Notes:
- If you want a custom domain, add a `CNAME` file (one line with the domain) and configure DNS.
- The included GitHub Action uses the `GITHUB_TOKEN` so no extra secrets are required.

If you want, I can:
- Create a GitHub repo and push these files for you (you'll need to provide access).
- Configure a custom domain file (`CNAME`) if you have a domain to use.
