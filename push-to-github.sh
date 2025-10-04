#!/bin/bash

echo ""
echo "╔════════════════════════════════════════╗"
echo "║      Push to GitHub Helper Script      ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if already has remote
if git remote | grep -q origin; then
    echo "✅ Remote 'origin' already configured"
    git remote -v
    echo ""
    read -p "Do you want to push to this remote? (y/N): " push_now

    if [ "$push_now" = "y" ] || [ "$push_now" = "Y" ]; then
        echo ""
        echo "📤 Pushing to GitHub..."
        git push -u origin main

        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Successfully pushed to GitHub!"
            echo ""
            echo "🌐 View your repository at:"
            git remote get-url origin | sed 's/\.git$//' | sed 's/^/   /'
            echo ""
        else
            echo ""
            echo "❌ Push failed. Check the error above."
            echo ""
            echo "Common issues:"
            echo "  • Authentication: Set up SSH key or use personal access token"
            echo "  • Permissions: Make sure you have write access to the repo"
            echo ""
        fi
    fi
    exit 0
fi

echo "📝 First, create a new repository on GitHub:"
echo "   1. Go to: https://github.com/new"
echo "   2. Repository name: n8n-make-bridge (or your preferred name)"
echo "   3. Description: AI-powered workflow automation bridge"
echo "   4. Visibility: Public or Private"
echo "   5. DO NOT initialize with README"
echo "   6. Click 'Create repository'"
echo ""

read -p "Have you created the GitHub repository? (y/N): " created

if [ "$created" != "y" ] && [ "$created" != "Y" ]; then
    echo ""
    echo "👉 Please create the repository first, then run this script again."
    echo ""
    exit 0
fi

echo ""
echo "Enter your GitHub repository URL:"
echo "Examples:"
echo "  • HTTPS: https://github.com/username/n8n-make-bridge.git"
echo "  • SSH:   git@github.com:username/n8n-make-bridge.git"
echo ""

read -p "Repository URL: " repo_url

if [ -z "$repo_url" ]; then
    echo ""
    echo "❌ No URL provided. Exiting."
    exit 1
fi

# Add remote
echo ""
echo "📡 Adding remote 'origin'..."
git remote add origin "$repo_url"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to add remote. It may already exist."
    echo ""
    echo "Try:"
    echo "  git remote remove origin"
    echo "  ./push-to-github.sh"
    exit 1
fi

echo "✅ Remote added successfully"
echo ""

# Verify
echo "🔍 Verifying remote..."
git remote -v
echo ""

# Push
read -p "Ready to push to GitHub? (Y/n): " ready

if [ "$ready" = "n" ] || [ "$ready" = "N" ]; then
    echo ""
    echo "👉 You can push later with: git push -u origin main"
    exit 0
fi

echo ""
echo "📤 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║     ✅ Successfully Published!         ║"
    echo "╚════════════════════════════════════════╝"
    echo ""
    echo "🌐 Your repository is now live at:"
    echo "   $(echo $repo_url | sed 's/\.git$//')"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update README.md with your GitHub username"
    echo "   2. Add topics/tags on GitHub"
    echo "   3. Set repository description"
    echo "   4. Share your project!"
    echo ""
    echo "See PUBLISH_TO_GITHUB.md for more tips"
    echo ""
else
    echo ""
    echo "❌ Push failed!"
    echo ""
    echo "Common solutions:"
    echo ""
    echo "1. Authentication with Personal Access Token (HTTPS):"
    echo "   git remote set-url origin https://YOUR_TOKEN@github.com/username/repo.git"
    echo ""
    echo "2. Set up SSH key (SSH method):"
    echo "   https://docs.github.com/en/authentication/connecting-to-github-with-ssh"
    echo ""
    echo "3. Or use GitHub CLI:"
    echo "   gh auth login"
    echo "   git push -u origin main"
    echo ""
fi
