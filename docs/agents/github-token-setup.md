# Enable durable agent task records (GitHub)

Terminal agent runs can open an issue on this repo for audit.

## 1. Create a fine-grained or classic PAT

- Scope: **Issues: Read and write** on `eluan216/Elite-Data-Intelligence`
- Do not enable broad repo admin unless required

## 2. Add to Vercel (project `web-app`)

| Name | Value |
|------|--------|
| `GITHUB_TOKEN` | the PAT |
| `GITHUB_REPO` | `eluan216/Elite-Data-Intelligence` (optional; this is the default) |

Target: **Production** (and Preview if you test there).

## 3. Redeploy

Env vars apply on the next deployment.

## 4. Verify

Run the PowerShell agent check. In the JSON look for:

```json
"persistence": {
  "kind": "github_issue",
  "url": "https://github.com/eluan216/Elite-Data-Intelligence/issues/..."
}
```

If kind is `memory`, read the `error` string (missing token or GitHub API error).

## 5. Label

Issues are created with labels `agent:runtime` and `quality-gate`. Create those labels in the repo if GitHub rejects unknown labels.
