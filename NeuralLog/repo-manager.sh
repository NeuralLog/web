#!/bin/bash

# Define repository paths
declare -A repos
repos["specs"]="specs"
repos["server"]="server"
repos["mcp-client"]="mcp-client"

# Define repository branches
declare -A branches
branches["specs"]="main"
branches["server"]="main"
branches["mcp-client"]="main"

# Define repository descriptions
declare -A descriptions
descriptions["specs"]="NeuralLog Specifications"
descriptions["server"]="NeuralLog Server"
descriptions["mcp-client"]="NeuralLog MCP Client"

# Default values
ACTION="status"
REPO="all"
COMMIT_MESSAGE="Update repository"

# Display help information
show_help() {
    echo -e "\033[36mNeuralLog Repository Manager\033[0m"
    echo -e "\033[36m============================\033[0m"
    echo ""
    echo -e "\033[33mUsage: ./repo-manager.sh [options]\033[0m"
    echo ""
    echo -e "\033[32mOptions:\033[0m"
    echo "  -a, --action ACTION       Action to perform (default: status)"
    echo "  -r, --repo REPO           Repository to operate on (default: all)"
    echo "  -m, --message MESSAGE     Commit message (required for commit actions)"
    echo "  -h, --help                Show this help message"
    echo ""
    echo -e "\033[32mActions:\033[0m"
    echo "  status        - Show the status of repositories"
    echo "  pull          - Pull the latest changes from remote"
    echo "  push          - Push local changes to remote"
    echo "  add           - Add all changes to staging"
    echo "  commit        - Commit staged changes (requires -m)"
    echo "  add-commit    - Add and commit all changes (requires -m)"
    echo "  add-commit-push - Add, commit, and push all changes (requires -m)"
    echo "  sync          - Pull, add, commit, and push all changes (requires -m)"
    echo ""
    echo -e "\033[32mRepositories:\033[0m"
    echo "  all           - All repositories"
    echo "  specs         - NeuralLog Specifications"
    echo "  server        - NeuralLog Server"
    echo "  mcp-client    - NeuralLog MCP Client"
    echo ""
    echo -e "\033[33mExamples:\033[0m"
    echo "  ./repo-manager.sh -a status -r all"
    echo "  ./repo-manager.sh -a pull -r server"
    echo "  ./repo-manager.sh -a add-commit -r mcp-client -m 'Update documentation'"
    echo "  ./repo-manager.sh -a sync -r all -m 'Weekly update'"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -a|--action)
            ACTION="$2"
            shift
            shift
            ;;
        -r|--repo)
            REPO="$2"
            shift
            shift
            ;;
        -m|--message)
            COMMIT_MESSAGE="$2"
            shift
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Execute git command in repository
execute_git_command() {
    local repo_path="$1"
    local command="$2"
    local description="$3"
    
    local current_dir=$(pwd)
    cd "$repo_path" || { echo "Error: Cannot change to directory $repo_path"; return 1; }
    
    echo -e "\033[90mExecuting in $repo_path: $command\033[0m"
    eval "$command"
    local status=$?
    
    if [ $status -ne 0 ]; then
        echo -e "\033[31mError executing command in $repo_path\033[0m"
    fi
    
    cd "$current_dir" || { echo "Error: Cannot change back to original directory"; return 1; }
    return $status
}

# Process a single repository
process_repository() {
    local repo_key="$1"
    local repo_path="${repos[$repo_key]}"
    local repo_branch="${branches[$repo_key]}"
    local repo_desc="${descriptions[$repo_key]}"
    
    echo -e "\033[36mProcessing $repo_desc ($repo_path)\033[0m"
    
    case "$ACTION" in
        status)
            execute_git_command "$repo_path" "git status" "Checking status"
            ;;
        pull)
            execute_git_command "$repo_path" "git pull origin $repo_branch" "Pulling latest changes"
            ;;
        push)
            execute_git_command "$repo_path" "git push origin $repo_branch" "Pushing changes to remote"
            ;;
        add)
            execute_git_command "$repo_path" "git add ." "Adding all changes"
            ;;
        commit)
            if [ -z "$COMMIT_MESSAGE" ]; then
                echo -e "\033[31mError: Commit message is required for commit action\033[0m"
                return 1
            fi
            execute_git_command "$repo_path" "git commit -m \"$COMMIT_MESSAGE\"" "Committing changes"
            ;;
        add-commit)
            if [ -z "$COMMIT_MESSAGE" ]; then
                echo -e "\033[31mError: Commit message is required for add-commit action\033[0m"
                return 1
            fi
            execute_git_command "$repo_path" "git add ." "Adding all changes"
            execute_git_command "$repo_path" "git commit -m \"$COMMIT_MESSAGE\"" "Committing changes"
            ;;
        add-commit-push)
            if [ -z "$COMMIT_MESSAGE" ]; then
                echo -e "\033[31mError: Commit message is required for add-commit-push action\033[0m"
                return 1
            fi
            execute_git_command "$repo_path" "git add ." "Adding all changes"
            execute_git_command "$repo_path" "git commit -m \"$COMMIT_MESSAGE\"" "Committing changes"
            execute_git_command "$repo_path" "git push origin $repo_branch" "Pushing changes to remote"
            ;;
        sync)
            if [ -z "$COMMIT_MESSAGE" ]; then
                echo -e "\033[31mError: Commit message is required for sync action\033[0m"
                return 1
            fi
            execute_git_command "$repo_path" "git pull origin $repo_branch" "Pulling latest changes"
            execute_git_command "$repo_path" "git add ." "Adding all changes"
            execute_git_command "$repo_path" "git commit -m \"$COMMIT_MESSAGE\"" "Committing changes"
            execute_git_command "$repo_path" "git push origin $repo_branch" "Pushing changes to remote"
            ;;
        *)
            echo -e "\033[31mUnknown action: $ACTION\033[0m"
            show_help
            return 1
            ;;
    esac
    
    echo ""
}

# Validate action
valid_actions=("status" "pull" "push" "add" "commit" "add-commit" "add-commit-push" "sync")
valid_action=0
for action in "${valid_actions[@]}"; do
    if [ "$ACTION" = "$action" ]; then
        valid_action=1
        break
    fi
done

if [ $valid_action -eq 0 ]; then
    echo -e "\033[31mError: Invalid action '$ACTION'\033[0m"
    show_help
    exit 1
fi

# Process repositories
if [ "$REPO" = "all" ]; then
    for repo_key in "${!repos[@]}"; do
        process_repository "$repo_key"
    done
elif [ -n "${repos[$REPO]}" ]; then
    process_repository "$REPO"
else
    echo -e "\033[31mError: Unknown repository '$REPO'\033[0m"
    show_help
    exit 1
fi

echo -e "\033[32mRepository operations completed.\033[0m"
