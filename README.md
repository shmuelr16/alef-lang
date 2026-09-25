Alef - A Hebrew Programming Language 🇮🇱

Alef is a fully functional programming language written entirely in Hebrew. It features a custom Lexer and Parser that run directly in the browser. The language supports variables, conditions, loops, functions, and lists — all using standard Hebrew syntax (including native support for Hebrew punctuation like ״, ׳, and ־).

🔗 **Live Demo:** https://alef-lang.vercel.app

---

## How to use Git in this project

### Pushing new changes (The standard way)
After editing code on your computer, run these 3 commands in your terminal:
1. `git add .` (Collects all your changed files)
2. `git commit -m "your message"` (Saves the changes with a short note)
3. `git push` (Uploads the changes to the GitHub server)

### How to avoid errors?
Always run `git pull` before you start working on the code. This downloads the latest updates from the server to your computer and prevents conflicts.

### Common errors and how to fix them
**The Error:** `failed to push some refs (non-fast-forward)`
**Why it happens:** The GitHub server has new updates that your local computer doesn't have yet (for example, if you edited a file directly on the GitHub website).
**How to fix it:** 
Run this command to sync everything back together smoothly:
`git pull --rebase`
And then just push again:
`git push`

<img width="981" height="648" alt="Screenshot 5787-01-14 at 11 08 45" src="https://github.com/user-attachments/assets/e162d1d7-a0e4-4964-9634-b9108858f928" />
