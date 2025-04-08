param (
    [Parameter(Mandatory=$false)]
    [string]$Action = "status",
    
    [Parameter(Mandatory=$false)]
    [string]$Repo = "all",
    
    [Parameter(Mandatory=$false)]
    [string]$CommitMessage = "Update repository",
    
    [Parameter(Mandatory=$false)]
    [switch]$Help
)

# Define repository paths
$repoInfo = @{
    "specs" = @{
        "path" = "specs"
        "branch" = "main"
        "remote" = "origin"
        "description" = "NeuralLog Specifications"
    }
    "server" = @{
        "path" = "server"
        "branch" = "main"
        "remote" = "origin"
        "description" = "NeuralLog Server"
    }
    "mcp-client" = @{
        "path" = "mcp-client"
        "branch" = "main"
        "remote" = "origin"
        "description" = "NeuralLog MCP Client"
    }
}

# Display help information
function Show-Help {
    Write-Host "NeuralLog Repository Manager" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\repo-manager.ps1 -Action <action> -Repo <repo> [-CommitMessage <message>]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Green
    Write-Host "  status        - Show the status of repositories"
    Write-Host "  pull          - Pull the latest changes from remote"
    Write-Host "  push          - Push local changes to remote"
    Write-Host "  add           - Add all changes to staging"
    Write-Host "  commit        - Commit staged changes (requires -CommitMessage)"
    Write-Host "  add-commit    - Add and commit all changes (requires -CommitMessage)"
    Write-Host "  add-commit-push - Add, commit, and push all changes (requires -CommitMessage)"
    Write-Host "  sync          - Pull, add, commit, and push all changes (requires -CommitMessage)"
    Write-Host ""
    Write-Host "Repositories:" -ForegroundColor Green
    Write-Host "  all           - All repositories"
    Write-Host "  specs         - NeuralLog Specifications"
    Write-Host "  server        - NeuralLog Server"
    Write-Host "  mcp-client    - NeuralLog MCP Client"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\repo-manager.ps1 -Action status -Repo all"
    Write-Host "  .\repo-manager.ps1 -Action pull -Repo server"
    Write-Host "  .\repo-manager.ps1 -Action add-commit -Repo mcp-client -CommitMessage 'Update documentation'"
    Write-Host "  .\repo-manager.ps1 -Action sync -Repo all -CommitMessage 'Weekly update'"
    Write-Host ""
}

# Execute git command in repository
function Execute-GitCommand {
    param (
        [string]$RepoPath,
        [string]$Command,
        [string]$Description
    )
    
    $currentLocation = Get-Location
    try {
        Set-Location -Path $RepoPath
        Write-Host "Executing in $RepoPath: $Command" -ForegroundColor Gray
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Error executing command in $RepoPath" -ForegroundColor Red
        }
    }
    finally {
        Set-Location -Path $currentLocation
    }
}

# Process a single repository
function Process-Repository {
    param (
        [string]$RepoKey,
        [hashtable]$RepoData
    )
    
    $repoPath = $RepoData.path
    $repoBranch = $RepoData.branch
    $repoRemote = $RepoData.remote
    $repoDesc = $RepoData.description
    
    Write-Host "Processing $repoDesc ($repoPath)" -ForegroundColor Cyan
    
    switch ($Action) {
        "status" {
            Execute-GitCommand -RepoPath $repoPath -Command "git status" -Description "Checking status"
        }
        "pull" {
            Execute-GitCommand -RepoPath $repoPath -Command "git pull $repoRemote $repoBranch" -Description "Pulling latest changes"
        }
        "push" {
            Execute-GitCommand -RepoPath $repoPath -Command "git push $repoRemote $repoBranch" -Description "Pushing changes to remote"
        }
        "add" {
            Execute-GitCommand -RepoPath $repoPath -Command "git add ." -Description "Adding all changes"
        }
        "commit" {
            if ([string]::IsNullOrEmpty($CommitMessage)) {
                Write-Host "Error: Commit message is required for commit action" -ForegroundColor Red
                return
            }
            Execute-GitCommand -RepoPath $repoPath -Command "git commit -m '$CommitMessage'" -Description "Committing changes"
        }
        "add-commit" {
            if ([string]::IsNullOrEmpty($CommitMessage)) {
                Write-Host "Error: Commit message is required for add-commit action" -ForegroundColor Red
                return
            }
            Execute-GitCommand -RepoPath $repoPath -Command "git add ." -Description "Adding all changes"
            Execute-GitCommand -RepoPath $repoPath -Command "git commit -m '$CommitMessage'" -Description "Committing changes"
        }
        "add-commit-push" {
            if ([string]::IsNullOrEmpty($CommitMessage)) {
                Write-Host "Error: Commit message is required for add-commit-push action" -ForegroundColor Red
                return
            }
            Execute-GitCommand -RepoPath $repoPath -Command "git add ." -Description "Adding all changes"
            Execute-GitCommand -RepoPath $repoPath -Command "git commit -m '$CommitMessage'" -Description "Committing changes"
            Execute-GitCommand -RepoPath $repoPath -Command "git push $repoRemote $repoBranch" -Description "Pushing changes to remote"
        }
        "sync" {
            if ([string]::IsNullOrEmpty($CommitMessage)) {
                Write-Host "Error: Commit message is required for sync action" -ForegroundColor Red
                return
            }
            Execute-GitCommand -RepoPath $repoPath -Command "git pull $repoRemote $repoBranch" -Description "Pulling latest changes"
            Execute-GitCommand -RepoPath $repoPath -Command "git add ." -Description "Adding all changes"
            Execute-GitCommand -RepoPath $repoPath -Command "git commit -m '$CommitMessage'" -Description "Committing changes"
            Execute-GitCommand -RepoPath $repoPath -Command "git push $repoRemote $repoBranch" -Description "Pushing changes to remote"
        }
        default {
            Write-Host "Unknown action: $Action" -ForegroundColor Red
            Show-Help
        }
    }
    
    Write-Host ""
}

# Main script execution
if ($Help) {
    Show-Help
    exit 0
}

# Validate action
$validActions = @("status", "pull", "push", "add", "commit", "add-commit", "add-commit-push", "sync")
if (-not $validActions.Contains($Action.ToLower())) {
    Write-Host "Error: Invalid action '$Action'" -ForegroundColor Red
    Show-Help
    exit 1
}

# Process repositories
if ($Repo -eq "all") {
    foreach ($key in $repoInfo.Keys) {
        Process-Repository -RepoKey $key -RepoData $repoInfo[$key]
    }
}
elseif ($repoInfo.ContainsKey($Repo)) {
    Process-Repository -RepoKey $Repo -RepoData $repoInfo[$Repo]
}
else {
    Write-Host "Error: Unknown repository '$Repo'" -ForegroundColor Red
    Show-Help
    exit 1
}

Write-Host "Repository operations completed." -ForegroundColor Green
