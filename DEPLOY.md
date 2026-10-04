# 🚀 5-Minute Deployment Guide

Follow these exact steps to run your application locally or deploy it directly to **Render**.

---

## 💻 Local Development with Docker

To run the entire stack (Node.js app + MongoDB) locally in one command:

### Step 1: Initialize Environment Config
```bash
cp .env.example .env
```

### Step 2: Spin Up Containers
```bash
docker-compose up --build
```
Your app is now running at `http://localhost:10000` with an auto-configured MongoDB database!

---

## ☁️ Cloud Deployment to Render in under 3 minutes

### Step 1: Connect your Git Repository to Render
1. Push this repository to GitHub or GitLab.
2. Go to the [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** and select **Blueprint**.

### Step 2: Link the Blueprint Config
1. Connect your GitHub repository.
2. Render will automatically detect the `render.yaml` file.
3. Name your group of services (e.g., `jj-production`) and click **Approve**.

Render will automatically provision your MongoDB database and build the secure, multi-stage Docker container defined in the `Dockerfile`.

### Step 3: Setup Automated CI/CD (Optional but Recommended)
1. In the Render Dashboard, go to your Web Service -> **Settings** -> Copy the **Deploy Hook** URL.
2. Navigate to your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
3. Create a secret named `RENDER_DEPLOY_HOOK_URL` and paste the Deploy Hook URL.
4. Any push to `main`/`master` will now build, test, and instantly update your production server.