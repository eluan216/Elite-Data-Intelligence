# Internal runtime audit issues

This integration is optional and applies only to **trusted direct calls** to `createAndRunTask` outside a public model session. Public `/agents` requests bypass it, even when a GitHub token is configured. They return `persistence: {"kind":"response"}` and never publish visitor evidence.

## Configure an internal deployment

Use a fine-grained token limited to **Issues: read and write** on the intended repository. Store it in a local ignored environment file or the deployment's secret settings:

| Variable | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | Token for the internal audit destination |
| `GITHUB_REPO` | Destination in `owner/repository` form |

The legacy `GH_TOKEN` alias is supported. The code defaults the repository to `eluan216/Elite-Data-Intelligence`; set your own destination explicitly when self-hosting. Do not put private task content into a public issue.

There is no public endpoint that turns this internal persistence on. A maintainer must use a trusted internal caller and provide appropriate access control for any new integration.

## Result

Successful internal persistence returns `kind: "github_issue"` and a URL. Missing credentials or delivery failure returns `kind: "memory"` with an error. Instance memory is not durable or shared across serverless instances.

Issue labels are `agent:runtime` and `quality-gate`. Configure them on the target repository as needed. Persistence failures do not change the completed agent outcome.

Tests mock persistence and must never create live issues.
