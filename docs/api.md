# Flowchart API

## 目的

這份文件說明 `server.js` 提供的 API、檔案存放位置、前端呼叫入口與 fallback 行為。它是前後端契約文件，不是 UI 功能地圖。

當修改 `server.js`、`fetch('/api/...')`、project/user 儲存規則或 API response shape 時，請先檢查這份文件。

## Server 基本設定

| Item | Value |
| --- | --- |
| Server entry | `server.js` |
| Default port | `3013` |
| Root dir | `ROOT = __dirname` |
| Default project | `flowchart` |
| Default user | `000666888` |
| Main JSON | `flowchart.json` |
| Main Mermaid | `flowchart.mmd` |
| User projects dir | `flows/users/<user>/` |
| Legacy projects dir | `flows/` |

## Path / slug helpers

| Function | 位置 | 說明 |
| --- | --- | --- |
| `slugProject()` | `server.js:32` | 將 project name 正規化成 lowercase slug。 |
| `slugUser()` | `server.js:41` | 將 user id 正規化成 lowercase slug。 |
| `userDir()` | `server.js:50` | 回傳 user 專屬資料夾路徑。 |
| `projectPaths()` | `server.js:54` | 回傳 user/project 的 json、mmd、legacy json/mmd paths。 |
| `ensureFlowsDir()` | `server.js:69` | 建立 `flows` 與 `flows/users`。 |
| `ensureUserDir()` | `server.js:74` | 建立指定 user folder。 |

## API endpoints

### `GET /api/users`

位置：`server.js:307`

回傳目前可用 users。

Response shape：

```json
{
  "users": [
    {
      "id": "000666888",
      "name": "000666888",
      "path": "flows/users/000666888",
      "updatedAt": "2026-07-09T15:49:36.294Z"
    }
  ]
}
```

主要實作：

- `listUsers()` at `server.js:197`
- `ensureFlowsDir()`
- `ensureUserDir(DEFAULT_USER)`

前端呼叫：

- `syncUsersFromServer()` at `flowchart.html:2603`

### `GET /api/projects?user=<user>`

位置：`server.js:313`

回傳指定 user 的 project list。

Response shape：

```json
{
  "user": "000666888",
  "projects": [
    {
      "id": "flowchart",
      "name": "flowchart",
      "nodes": 7,
      "edges": 4,
      "updatedAt": "2026-07-11T12:13:49.845Z",
      "source": "user"
    }
  ]
}
```

主要實作：

- `listProjects()` at `server.js:229`
- 對 default user 會額外讀 legacy `flows/*.json`
- 如果沒有 default project，會嘗試加入 `flowchart.json`

前端呼叫：

- `loadProjects()` at `flowchart.html:3124`
- `refreshProjects()` at `flowchart.html:3141`

### `GET /api/flowchart?user=<user>&project=<project>`

位置：`server.js:320`

讀取指定 user/project 的 JSON。

成功時回傳 `flowchart.json` 相同格式；失敗時回傳：

```json
{
  "error": "<project>.json not found"
}
```

主要實作：

- `readFlowchart()` at `server.js:180`
- 先讀 `flows/users/<user>/<project>.json`
- default user 可 fallback 到 `flows/<project>.json`
- default project 可 fallback 到 root `flowchart.json`

前端呼叫：

- `loadSavedState()` at `flowchart.html:3403`
- `selectProject()` at `flowchart.html:3149`
- `selectUser()` at `flowchart.html:3209`
- Startup load near `flowchart.html:6040`

### `POST /api/flowchart?user=<user>&project=<project>`

位置：`server.js:332`

儲存指定 user/project 的 JSON，並同步產生 Mermaid `.mmd`。

Request body：`exportJSON()` 產生的 JSON 字串。

Response shape：

```json
{
  "ok": true,
  "user": "000666888",
  "project": "flowchart",
  "nodes": 7,
  "edges": 4
}
```

主要實作：

- `saveFlowchart()` at `server.js:148`
- 驗證 `nodes` / `edges` 必須是 array
- 寫入 `flows/users/<user>/<project>.json`
- 寫入 `flows/users/<user>/<project>.mmd`
- default user + default project 會同步寫入 root `flowchart.json` 與 `flowchart.mmd`

前端呼叫：

- `saveProjectFile()` at `flowchart.html:3387`
- `saveState()` at `flowchart.html:3316`
- `btnSaveFile` click binding at `flowchart.html:5950`

### `GET /api/mermaid?user=<user>&project=<project>`

位置：`server.js:341`

讀取指定 user/project 的 Mermaid `.mmd`。目前前端主要使用 client-side `exportMermaid()`，此 endpoint 是 server-side Mermaid file 讀取入口。

## Frontend fallback 行為

`loadSavedState()` at `flowchart.html:3403`：

1. 先呼叫 `GET /api/flowchart?user=...&project=...`。
2. 如果 server response ok，使用 server JSON。
3. 如果 server 失敗，fallback 到 localStorage：
   - `projectStorageKey(projectId)`
   - default user 時也會嘗試舊 key `${STORAGE_KEY}:${projectId || 'flowchart'}`

`saveState()` at `flowchart.html:3316`：

1. `normalizeAllEdges()`
2. `exportJSON()`
3. 先寫 localStorage
4. debounce 後呼叫 `saveProjectFile(json)`

因此 browser localStorage 是前端 fallback，server files 是主要跨裝置/跨重載保存來源。

## 只讀驗證指令

```powershell
Invoke-RestMethod -Uri 'http://192.168.1.105:3013/api/users' -Method Get | ConvertTo-Json -Depth 4
Invoke-RestMethod -Uri 'http://192.168.1.105:3013/api/projects?user=000666888' -Method Get | ConvertTo-Json -Depth 4
```

PowerShell 5 讀 raw JSON 時建議加 `-UseBasicParsing`：

```powershell
$r = Invoke-WebRequest -UseBasicParsing -Uri 'http://192.168.1.105:3013/api/flowchart?user=000666888&project=flowchart' -Method Get
$j = $r.Content | ConvertFrom-Json
```

## 何時更新這份文件

只要符合以下任一條件，就更新本文件：

- 新增、移除或修改 `/api/...` route。
- API request / response shape 改變。
- `server.js` 的 user/project path 規則改變。
- 前端 `fetch()` 呼叫位置或參數改變。
- localStorage fallback 與 server 儲存優先順序改變。
- `.json` / `.mmd` 寫入位置改變。
