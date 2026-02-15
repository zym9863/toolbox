"use client";
import { useMemo, useState } from "react";
import { CopyButton } from "@/components/CopyButton";
import { ToolPanel } from "@/components/ToolLayout";

interface GitCommand {
  command: string;
  description: string;
  example: string;
  category: string;
}

const GIT_COMMANDS: GitCommand[] = [
  // Setup
  { category: "Setup", command: "git config --global user.name \"Name\"", description: "Set your global username", example: "git config --global user.name \"John Doe\"" },
  { category: "Setup", command: "git config --global user.email \"email\"", description: "Set your global email", example: "git config --global user.email \"john@example.com\"" },
  { category: "Setup", command: "git config --list", description: "List all configuration settings", example: "git config --list" },
  { category: "Setup", command: "git init", description: "Initialize a new Git repository", example: "git init" },
  { category: "Setup", command: "git clone <url>", description: "Clone a remote repository", example: "git clone https://github.com/user/repo.git" },
  { category: "Setup", command: "git config --global core.editor <editor>", description: "Set default editor", example: "git config --global core.editor vim" },
  // Basics
  { category: "Basics", command: "git status", description: "Show working tree status", example: "git status" },
  { category: "Basics", command: "git add <file>", description: "Stage a file", example: "git add index.js" },
  { category: "Basics", command: "git add .", description: "Stage all changes", example: "git add ." },
  { category: "Basics", command: "git commit -m \"msg\"", description: "Commit staged changes with message", example: "git commit -m \"fix: resolve login bug\"" },
  { category: "Basics", command: "git commit --amend", description: "Modify the last commit", example: "git commit --amend -m \"updated message\"" },
  { category: "Basics", command: "git diff", description: "Show unstaged changes", example: "git diff" },
  { category: "Basics", command: "git diff --staged", description: "Show staged changes", example: "git diff --staged" },
  { category: "Basics", command: "git rm <file>", description: "Remove a file and stage deletion", example: "git rm old-file.txt" },
  { category: "Basics", command: "git mv <old> <new>", description: "Rename/move a file", example: "git mv old.js new.js" },
  // Branching
  { category: "Branching", command: "git branch", description: "List local branches", example: "git branch" },
  { category: "Branching", command: "git branch <name>", description: "Create a new branch", example: "git branch feature/login" },
  { category: "Branching", command: "git branch -d <name>", description: "Delete a branch (safe)", example: "git branch -d feature/login" },
  { category: "Branching", command: "git branch -D <name>", description: "Force delete a branch", example: "git branch -D feature/login" },
  { category: "Branching", command: "git checkout <branch>", description: "Switch to a branch", example: "git checkout main" },
  { category: "Branching", command: "git checkout -b <name>", description: "Create and switch to new branch", example: "git checkout -b feature/signup" },
  { category: "Branching", command: "git switch <branch>", description: "Switch to a branch (modern)", example: "git switch main" },
  { category: "Branching", command: "git switch -c <name>", description: "Create and switch to new branch (modern)", example: "git switch -c feature/auth" },
  { category: "Branching", command: "git branch -a", description: "List all branches (local + remote)", example: "git branch -a" },
  // Merging
  { category: "Merging", command: "git merge <branch>", description: "Merge a branch into current branch", example: "git merge feature/login" },
  { category: "Merging", command: "git merge --no-ff <branch>", description: "Merge with a merge commit", example: "git merge --no-ff feature/login" },
  { category: "Merging", command: "git merge --abort", description: "Abort a merge in progress", example: "git merge --abort" },
  { category: "Merging", command: "git rebase <branch>", description: "Rebase current branch onto another", example: "git rebase main" },
  { category: "Merging", command: "git rebase --abort", description: "Abort a rebase in progress", example: "git rebase --abort" },
  { category: "Merging", command: "git cherry-pick <commit>", description: "Apply a specific commit", example: "git cherry-pick abc1234" },
  // Remote
  { category: "Remote", command: "git remote -v", description: "List remote repositories", example: "git remote -v" },
  { category: "Remote", command: "git remote add <name> <url>", description: "Add a remote repository", example: "git remote add origin https://github.com/user/repo.git" },
  { category: "Remote", command: "git fetch", description: "Download objects from remote", example: "git fetch origin" },
  { category: "Remote", command: "git pull", description: "Fetch and merge from remote", example: "git pull origin main" },
  { category: "Remote", command: "git push", description: "Push commits to remote", example: "git push origin main" },
  { category: "Remote", command: "git push -u origin <branch>", description: "Push and set upstream", example: "git push -u origin feature/login" },
  { category: "Remote", command: "git push --force", description: "Force push (use with caution!)", example: "git push --force origin main" },
  { category: "Remote", command: "git remote remove <name>", description: "Remove a remote", example: "git remote remove origin" },
  // Stash
  { category: "Stash", command: "git stash", description: "Stash current changes", example: "git stash" },
  { category: "Stash", command: "git stash save \"msg\"", description: "Stash with a message", example: "git stash save \"wip: login feature\"" },
  { category: "Stash", command: "git stash list", description: "List all stashes", example: "git stash list" },
  { category: "Stash", command: "git stash pop", description: "Apply and remove latest stash", example: "git stash pop" },
  { category: "Stash", command: "git stash apply", description: "Apply latest stash (keep in list)", example: "git stash apply" },
  { category: "Stash", command: "git stash drop", description: "Remove latest stash", example: "git stash drop" },
  { category: "Stash", command: "git stash clear", description: "Remove all stashes", example: "git stash clear" },
  // Log
  { category: "Log", command: "git log", description: "Show commit history", example: "git log" },
  { category: "Log", command: "git log --oneline", description: "Show compact commit history", example: "git log --oneline" },
  { category: "Log", command: "git log --graph", description: "Show commit history as graph", example: "git log --graph --oneline --all" },
  { category: "Log", command: "git log -p", description: "Show commits with diffs", example: "git log -p -2" },
  { category: "Log", command: "git log --author=\"name\"", description: "Filter by author", example: "git log --author=\"John\"" },
  { category: "Log", command: "git show <commit>", description: "Show details of a commit", example: "git show abc1234" },
  { category: "Log", command: "git blame <file>", description: "Show who changed each line", example: "git blame index.js" },
  // Undo
  { category: "Undo", command: "git restore <file>", description: "Discard working directory changes", example: "git restore index.js" },
  { category: "Undo", command: "git restore --staged <file>", description: "Unstage a file", example: "git restore --staged index.js" },
  { category: "Undo", command: "git reset HEAD~1", description: "Undo last commit (keep changes)", example: "git reset HEAD~1" },
  { category: "Undo", command: "git reset --hard HEAD~1", description: "Undo last commit (discard changes)", example: "git reset --hard HEAD~1" },
  { category: "Undo", command: "git revert <commit>", description: "Create a commit that undoes changes", example: "git revert abc1234" },
  { category: "Undo", command: "git clean -fd", description: "Remove untracked files and directories", example: "git clean -fd" },
  { category: "Undo", command: "git reflog", description: "Show reference log (recover lost commits)", example: "git reflog" },
];

const CATEGORIES = ["All", "Setup", "Basics", "Branching", "Merging", "Remote", "Stash", "Log", "Undo"];

const inputClass = "rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground";

export default function GitCheatSheet() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return GIT_COMMANDS.filter((cmd) => {
      const matchCategory = category === "All" || cmd.category === category;
      const matchSearch =
        !q ||
        cmd.command.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [search, category]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, GitCommand[]>();
    for (const cmd of filtered) {
      const arr = map.get(cmd.category) || [];
      arr.push(cmd);
      map.set(cmd.category, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div className="flex flex-col gap-4">
      <ToolPanel title="Search & Filter">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            className={`${inputClass} flex-1`}
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  category === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground hover:bg-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{filtered.length} commands found</p>
      </ToolPanel>

      {Array.from(groupedByCategory.entries()).map(([cat, cmds]) => (
        <ToolPanel key={cat} title={cat}>
          <div className="flex flex-col gap-2">
            {cmds.map((cmd, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-background p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <code className="font-mono text-sm font-semibold text-foreground break-all">
                    {cmd.command}
                  </code>
                  <CopyButton text={cmd.command} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{cmd.description}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  Example: <span className="text-foreground">{cmd.example}</span>
                </p>
              </div>
            ))}
          </div>
        </ToolPanel>
      ))}

      {filtered.length === 0 && (
        <ToolPanel>
          <p className="text-center text-sm text-muted-foreground">No commands match your search.</p>
        </ToolPanel>
      )}
    </div>
  );
}
