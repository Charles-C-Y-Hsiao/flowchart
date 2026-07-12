# Flowchart Architecture

## 目的

這份文件是給人與 LLM agents 使用的導航地圖。它的目的不是完整介紹所有實作細節，而是協助判斷一個修改應該從哪裡開始、哪個 module 擁有哪些 state、哪些區域預設不需要載入 context。

目前主要實作仍集中在 `flowchart.html`。以下 architecture 會先用「邏輯 module」描述單檔內的責任邊界，讓專案在正式拆檔前也能被穩定維護。

## 目前結構

| 區域 | 目前位置 |
| --- | --- |
| CSS | `flowchart.html:16` to `flowchart.html:1826` |
| HTML shell | `flowchart.html:1828` to `flowchart.html:2008` |
| JavaScript | `flowchart.html:2009` to `flowchart.html:6056` |
| App state | `flowchart.html:2212` |
| Event binding cluster | `flowchart.html:5745` onward |

## Module Map

| Module | Responsibility | Owns / Writes | Reads / Depends On | Do Not Touch By Default |
| --- | --- | --- | --- | --- |
| Display / Theme | 管理 view mode、body line count、flowchart title size、flowchart theme。 | `state.display`、stage display classes、`visibleFlowThemeIds` local UI preference。 | Toolbar controls、theme constants、localStorage theme visibility preference。 | Display 欄位以外的 storage format、edge routing。 |
| Account / Project | 管理 user/project 切換、清單 render、建立、目前 label。 | `currentUser`、`users`、`currentProject`、`projects`、local current keys。 | Server `/api/users`、`/api/projects`、localStorage。 | Node geometry、edge routing、search result algorithm。 |
| Flow / Subflow | 管理 current flow、breadcrumb、back/remove subflow。 | `state.currentFlowId`、`state.flows`、flow ownership metadata。 | 依 flow 過濾的 nodes、edges、groups。 | Project persistence internals，除非切換 flow 真的需要 load/save。 |
| Search | 管理 project search query、results、previous/next navigation、focus request。 | `state.search`。 | Flow/node/group data、navigator/viewport focus helpers。 | Storage、import/export、edge rendering、node creation/deletion。 |
| Storage / API | 管理 save/load current project、local fallback、serialized state。 | localStorage project payloads、server flowchart files。 | `exportJSON()`、`importJSON()`、current user/project。 | UI layout decisions、search ranking、edge route math。 |
| Toolbar / UI Shell | 管理 top toolbar、overflow layout、drawers、action buttons。 | Toolbar open/overflow state、drawer visibility。 | DOM controls、display/search/project/account handlers。 | Core state mutation，除非透過對應 module action。 |
| Selection / Dragging | 管理 selected nodes/edges/groups、marquee、drag、resize、arrange tools。 | `state.selected`、`state.selectedNodeIds`、drag/marquee/resize state。 | Node/group/edge geometry、viewport transform。 | Storage/API、import/export parsing。 |
| Node Renderer | 建立與更新 node DOM、title/body editing、tag editor、shape picker、node controls。 | Node DOM、editable node fields、selected node UI。 | `state.nodes`、display/theme、connector point helpers。 | Project API、search state ownership、storage format migration。 |
| Group Renderer | 建立、render、編輯與拖曳 node groups。 | `state.groups`、group DOM。 | Selected nodes、group bounds、node geometry。 | Search ranking、project API、import/export syntax。 |
| Edge Router / Renderer | 管理 edge route math、SVG path drawing、connector grips、endpoint reconnect。 | `state.edges` route fields、SVG edge DOM。 | Node geometry、connector constants、selection state。 | Search、account/project management、prompt guide。 |
| Import / Export | 管理 JSON import/export、Mermaid export、clear/dedupe、補強式 merge import。 | Serialized payload shape、import side effects。 | State maps、node/edge/flow/group schemas。 | Toolbar layout、search UI styling。 |
| Prompt Guide | 產生外部 flow extraction/import 使用的 prompt text。 | Prompt drawer output。 | Current feature input、merge import expectations。 | Core state mutation、storage。 |

## Data Flow

```text
User event
  -> module handler
  -> state mutation or read-only query
  -> render/update DOM or SVG
  -> saveState() when persistence is needed
```

建議方向是 UI event -> module action -> state -> render。避免新增讓 renderer 直接擁有不相關 business state 的程式，也避免讓 storage function 直接決定 UI behavior。

## State Ownership

| State | Primary owner | 說明 |
| --- | --- | --- |
| `state.flows` | Flow / Subflow | Import/export 在 load 時可以整批替換。 |
| `state.currentFlowId` | Flow / Subflow | Search 可以要求 flow module navigation，但不應擁有它。 |
| `state.nodes` | Node operations and Import / Export | Renderers 應反映 node data；creation/deletion 應留在 node actions。 |
| `state.edges` | Edge Router / Renderer and Import / Export | Node deletion 可以委派 cleanup related edges。 |
| `state.groups` | Group Renderer and Import / Export | Selection 可以讀取 group bounds。 |
| `state.selected`, `state.selectedNodeIds` | Selection / Dragging | Renderers 可以把 selected state 反映成 DOM classes。 |
| `state.view` | Navigator / Viewport | Search 與 flow navigation 可以要求 focus/center behavior。 |
| `state.display` | Display / Theme | Storage 只負責 serialize，不擁有 UI decisions。 |
| `state.search` | Search | 不應直接 create/delete nodes，也不應直接 write storage。 |
| `state.undoStack` | History / Undo | Feature modules 應透過既有 helpers capture undo。 |

## Context Rules For LLM Work

修改功能時，請依照這個順序縮小 context：

1. 先從本文件判斷這次修改屬於哪個 logical module。
2. 使用 `docs/feature-map.md` 找目前的 HTML、CSS、JS、state 與 verify entry points。
3. 一開始只讀列出的 entry points 與 direct dependencies。
4. 把 `Do Not Touch By Default` 當成預設排除清單，不是永久禁止檢查。
5. 只有在 symbol reference、runtime behavior 或 verification failure 顯示真實依賴時，才擴大 context。
6. 如果修改造成 entry point、ownership 或 dependency 改變，必須在同次修改中更新本文件與 `docs/feature-map.md`。

## Docs Navigation Map

這幾份 docs 的分工不同，修改時不要混在一起：

| 文件 | 主要用途 | 何時讀 | 何時更新 |
| --- | --- | --- | --- |
| `docs/architecture.md` | Module ownership / state ownership / dependency boundary。 | 開始修改前，用來判斷主要 module、相關 module、不要預設碰哪裡。 | Module 名稱、責任、owns/writes、reads/depends、Do Not Touch 邊界改變時。 |
| `docs/feature-map.md` | 從使用者 feature 找 HTML / CSS / JS / state / API / data entry points。 | 修改某個 feature 前，用來找入口 symbol。 | 新增、移除、移動 feature entry point，或驗證時發現漏掉重要 helper。 |
| `docs/data-format.md` | `flowchart.json` / import-export payload contract。 | 改到 `nodes`、`edges`、`flows`、`groups`、`display`、import/export payload 時。 | JSON 欄位、相容規則、import/export payload shape 改變時。 |
| `docs/api.md` | `server.js` API contract。 | 改到 `/api/...`、request / response、save/load path、server persistence 時。 | Endpoint、request/response shape、fallback、檔案寫入行為改變時。 |
| `docs/verification-status.md` | Feature 驗證看板。 | 想知道哪些 feature 已驗證、哪些是 Partial / Blocked 時。 | 每次完成 feature 驗證後更新。 |

`architecture.md` 和 `feature-map.md` 是導航文件，不是歷史紀錄。驗證狀態請放 `docs/verification-status.md`。

## Future Split Direction

目前 single-file implementation 可以逐步拆分。可能的目標結構如下：

```text
assets/css/base.css
assets/css/toolbar.css
assets/css/flow-nav.css
assets/css/nodes.css
assets/css/edges.css
assets/css/drawers.css

assets/js/config.js
assets/js/state.js
assets/js/storage.js
assets/js/flow.js
assets/js/search.js
assets/js/node-renderer.js
assets/js/edge-router.js
assets/js/selection.js
assets/js/import-export.js
assets/js/toolbar.js
assets/js/main.js
```

不要一次拆完。當某個 module 被反覆修改，或下一次修改會需要載入大量不相關程式時，再把該 module 抽出來。

## Documentation Update Workflow

每次 LLM-assisted code change 後，使用這段流程收尾。目標是讓 docs 保持「下一次能快速找到入口」，而不是把所有實作細節都搬進文件。

### 可以直接貼給 LLM 的 docs 更新任務

```text
我剛修改完 [Feature Name / Change Summary]。

請依照專案 docs 更新流程檢查並同步文件：

1. 先讀 `docs/architecture.md`：
   - 判斷這次修改的主要 module。
   - 判斷相關 modules。
   - 檢查 owns / writes、reads / depends on、Do Not Touch By Default 是否仍準確。

2. 再讀 `docs/feature-map.md`：
   - 找對應 feature 章節。
   - 檢查 HTML / CSS / DOM refs / state / functions / API / data-format entry points 是否仍準確。
   - line number 只當附近位置提示，不是穩定 contract；請以 symbol、id、class、function name 為主。

3. 用 PowerShell `Select-String` 驗證實際程式入口：
   ```powershell
   Select-String -Path .\flowchart.html -Pattern 'changedSymbol|changedClass|changedId|functionName|stateName'
   Select-String -Path .\docs\*.md -Pattern 'Feature Name|Module Name|changedField|changedEndpoint'
   ```

   如果牽涉 server/API：
   ```powershell
   Select-String -Path .\server.js -Pattern 'apiRoute|functionName|project|user|changedEndpoint'
   ```

4. 如果改到資料格式，檢查並更新 `docs/data-format.md`：
   - `flowchart.json` top-level fields。
   - `nodes` / `edges` / `flows` / `groups` / `display` 欄位。
   - import/export payload shape。
   - 相容或 fallback 規則。

5. 如果改到 API，檢查並更新 `docs/api.md`：
   - endpoint。
   - request / response shape。
   - server.js helper。
   - file path / fallback / persistence 行為。

6. 如果完成 feature 驗證，更新 `docs/verification-status.md`：
   - Feature
   - Primary Module
   - Related Modules
   - Status
   - Last Verified
   - Browser/API
   - Docs Updated
   - Notes

7. 最後回報：
   - 哪些 docs 已更新。
   - 哪些 docs 檢查後不需要更新，原因是什麼。
   - 如果只是不穩定 line number 漂移，但 symbol 仍正確，不要為了行號重寫文件。
```

### 改動類型對應 docs

| 改動類型 | 必看 | 可能要更新 |
| --- | --- | --- |
| 新增 / 移動 / 刪除 UI control、id、class、event binding | `feature-map.md` | `feature-map.md` |
| 新增 / 改名 / 移動主要 function 或 helper | `feature-map.md` | `feature-map.md` |
| 改變 module 責任、state owner、跨 module dependency | `architecture.md` | `architecture.md`, `feature-map.md` |
| 改 `state.nodes` / `state.edges` / `state.flows` / `state.groups` / `state.display` 的資料 shape | `architecture.md`, `data-format.md` | `data-format.md`, `feature-map.md` |
| 改 `exportJSON()` / `importJSON()` payload | `data-format.md`, `feature-map.md` | `data-format.md`, `feature-map.md`, `verification-status.md` |
| 改 `server.js` route 或 API response | `api.md`, `feature-map.md` | `api.md`, `feature-map.md` |
| 改 Browser 可驗證的 feature 行為 | `feature-map.md`, `verification-status.md` | `verification-status.md`; 若 entry point 變了也更新 `feature-map.md` |
| 完成一條 feature 驗證 | `verification-status.md` | `verification-status.md` |

### 不需要更新 docs 的情況

- 只改 function 內部小邏輯，入口 symbol、module ownership、data/API contract 都沒變。
- 只改行號位置；只要 symbol、id、class、function name 仍可搜尋，不需要為行號漂移更新文件。
- 只改文字或樣式數值，且沒有改 class/id、feature behavior 或驗證方式。
- 只修 bug，但沒有新增重要 helper、沒有改 state shape、沒有改 API/data contract。

### docs 更新原則

- 寫「導航」，不要重寫 implementation。
- 優先記錄穩定 symbol：function name、id、class、state key、API route、data field。
- line number 可以保留，因為第一次閱讀時能快速跳到附近；但 line number 不是 contract。
- 一個 feature 可以對應多個 module；請在 `feature-map.md` 用「主要 module / 相關 modules」表達。
- `architecture.md` 負責 ownership；`feature-map.md` 負責 feature entry points；`verification-status.md` 負責驗證歷史。
