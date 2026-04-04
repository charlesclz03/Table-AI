---
name: reply-memory-logger
description: Maintain the root `brainlast10replies.MD` file as a rolling log of the exact last 10 assistant replies in this repo. Use before every final user response in this repository, or whenever the user asks to save, track, archive, or remember recent replies.
---

# Reply Memory Logger

Before sending the final response in this repository:

1. Put the exact final reply text into a temporary file.
2. Run the logger from the repo root:

```powershell
node scripts/brainlast10replies.mjs --message-file <temp-file>
```

3. Confirm `brainlast10replies.MD` was updated.
4. Then send the same reply to the user.

## Rules

- Log the exact final text, not a summary.
- Keep `brainlast10replies.MD` as the system of record.
- Do not manually hand-edit the file unless the script is unavailable.
- Keep only the newest 10 replies.

## Output location

- Root file: `brainlast10replies.MD`
- Script: `scripts/brainlast10replies.mjs`
