# Flowchart 資料格式

## 目的

這份文件說明 `flowchart.json` 與前端 `exportJSON()` / `importJSON()` 使用的資料格式。它是資料契約文件，不是 UI 功能地圖。

當修改 `nodes`、`edges`、`flows`、`groups`、`display` 或 import/export 行為時，請先檢查這份文件。

## 主要入口

- 範例資料：`flowchart.json`
- User 專案資料：`flows/users/<user>/<project>.json`
- Legacy 專案資料：`flows/<project>.json`
- 前端 export：`exportJSON()` at `flowchart.html:5404`
- 前端 import：`importJSON()` at `flowchart.html:5521`
- 後端 save normalize：`saveFlowchart()` at `server.js:148`
- 後端 read fallback：`readFlowchart()` at `server.js:180`

## Top-level fields

目前 `exportJSON()` 會輸出：

| Field | Type | 說明 |
| --- | --- | --- |
| `user` | string | 目前使用者 id。 |
| `project` | string | 目前 project id。 |
| `projectName` | string | 顯示用 project name。 |
| `version` | number | 資料格式版本，目前前端輸出 `2`。 |
| `currentFlowId` | string | 目前所在 flow id。 |
| `view` | object | Viewport 位置與縮放。 |
| `display` | object | 顯示模式與主題設定。 |
| `flows` | array | Flow / subflow 清單。 |
| `groups` | array | Node group 清單。 |
| `nodes` | array | Node 清單。 |
| `edges` | array | Edge 清單。 |

## `view`

```json
{
  "x": 0,
  "y": 0,
  "scale": 1
}
```

| Field | 說明 |
| --- | --- |
| `x` | Viewport horizontal offset。 |
| `y` | Viewport vertical offset。 |
| `scale` | Viewport zoom scale。 |

## `display`

```json
{
  "viewMode": "flowchart",
  "knowledgeBodyLines": 1,
  "flowchartTitleSize": 20,
  "flowchartTheme": "blue"
}
```

| Field | 說明 |
| --- | --- |
| `viewMode` | `knowledge` 或 `flowchart`。 |
| `knowledgeBodyLines` | Knowledge mode 中 body 顯示行數。 |
| `flowchartTitleSize` | Flowchart mode 中 title font size。 |
| `flowchartTheme` | Flowchart theme id。 |

`importJSON()` 會使用 `normalizeDisplaySettings()` 處理 `display`，也支援舊欄位：

- `viewMode`
- `knowledgeBodyLines`
- `flowchartTitleSize`

## `flows`

```json
{
  "id": "main",
  "name": "主流程",
  "parentFlowId": null,
  "ownerNodeId": null
}
```

| Field | 說明 |
| --- | --- |
| `id` | Flow id。 |
| `name` | Breadcrumb / display name。 |
| `parentFlowId` | Parent flow id，root flow 通常是 `null`。 |
| `ownerNodeId` | 擁有此 subflow 的 node id。 |

如果匯入資料沒有 `flows`，`importJSON()` 會建立預設 `main` flow。

## `groups`

```json
{
  "id": "group-id",
  "flowId": "main",
  "label": "Group",
  "nodeIds": ["node-id"]
}
```

| Field | 說明 |
| --- | --- |
| `id` | Group id。 |
| `flowId` | 所屬 flow id，缺省時 fallback 為 `main`。 |
| `label` | Group 顯示名稱，缺省時 fallback 為 `Group`。 |
| `nodeIds` | Group 內的 node id 清單；應指向同一個 `flowId` 內存在的 nodes。 |

## `nodes`

常見 node shape：

```json
{
  "id": "node-id",
  "x": 0,
  "y": 0,
  "w": 180,
  "h": 95,
  "tags": ["API"],
  "title": "API Layer",
  "body": "GET /api/example",
  "flowId": "main",
  "shape": "rect",
  "subflowId": null
}
```

| Field | 說明 |
| --- | --- |
| `id` | Node id。 |
| `x`, `y` | Node 在 world space 的位置。 |
| `w`, `h` | Node 寬高。 |
| `tags` | Tag 清單。 |
| `title` | Node title。 |
| `body` | Node body。 |
| `flowId` | 所屬 flow id，缺省時 fallback 為 `main`。 |
| `shape` | Node shape，會由 `normalizeShape()` 正規化。 |
| `subflowId` | Node 對應的子流程 id；沒有子流程時通常為 `null`。由 `ensureNodeSubflow()` 建立，刪除 node 時會連同 descendant flows 一起處理。 |

## `edges`

常見 edge shape：

```json
{
  "id": "edge-id",
  "from": "source-node-id",
  "to": "target-node-id",
  "fromPort": { "side": "right", "offset": 50 },
  "toPort": { "side": "left", "offset": 50 },
  "flowId": "main",
  "elbow": { "x": 100, "y": 100 },
  "manualElbow": false
}
```

| Field | 說明 |
| --- | --- |
| `id` | Edge id。 |
| `from` | Source node id。 |
| `to` | Target node id。 |
| `fromPort` | Source connector port。 |
| `toPort` | Target connector port。 |
| `flowId` | 所屬 flow id，缺省時 fallback 為 `main`。 |
| `elbow` | 手動調整或計算後的 route elbow。 |
| `manualElbow` | 是否由使用者手動調整過 route elbow；endpoint reconnect 會重設為 `false`。 |

`dedupeEdges()` 會移除同 flow 中重複的 `from -> to` edge，並盡量保留較完整的 port/elbow 資訊。

## 相容性注意事項

- `nodes` 與 `edges` 是後端 `saveFlowchart()` 的必要 array；缺少時會視為 invalid flowchart data。
- `flows`、`groups`、`display` 是 optional，但會影響 subflow、group 與顯示模式。
- `importJSON()` 的內部載入預設是 replace mode，會替缺少的 `flowId` 補 `main`，並可還原 `view` / `display`。
- Import/export drawer 的「套用匯入」使用 merge mode：保留既有 `flows`、`nodes`、`edges`、`groups`、`view`、`display`，只新增未存在的內容。
- Merge mode 判斷重複 node 時優先使用 `id`，也會略過同一個 `flowId` 內 title 相同的 node；新增 edge 時會略過同一個 `flowId + from + to` 組合。
- Merge mode 會把 imported edge / group 參照的重複 node id 對應到既有 node，讓分批匯入能補新增關係而不重建舊節點。
- `importJSON()` 會透過 `normalizeAllEdges()` 修正 edge port / route 資料。
- 修改資料格式時，要同步檢查 `exportJSON()`、`importJSON()`、`saveFlowchart()` 和既有 `.json` 檔案。

## 何時更新這份文件

只要符合以下任一條件，就更新本文件：

- `flowchart.json` top-level field 改變。
- `nodes`、`edges`、`flows`、`groups`、`display` 欄位改變。
- `exportJSON()` 或 `importJSON()` 的 payload shape 改變。
- `server.js` 儲存時 normalize 的欄位改變。
- 舊資料 fallback / migration 規則改變。
