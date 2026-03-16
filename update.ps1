# Quick update script for North Star Maintenance website
# This will automatically add, commit, and push all changes to GitHub

Write-Host "Updating website..." -ForegroundColor Green

# Add all changes
git add .

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    # Commit with timestamp
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
    git commit -m "Update website - $timestamp"
    
    # Push to GitHub
    git push
    
    Write-Host "`nWebsite updated successfully!" -ForegroundColor Green
    Write-Host "Your changes will be live at https://ckuball106-code.github.io/North-Star-Maintance in 1-2 minutes" -ForegroundColor Cyan
} else {
    Write-Host "No changes to update." -ForegroundColor Yellow
}
