# Flowchart 功能地圖

## 目的

這份文件把 user-facing features 對應到目前的 code entry points。它的目標是減少人與 LLM agents 搜尋時間。大部分程式目前仍在 `flowchart.html`，所以這裡保留 line numbers 作為起點，但它們不是永久 contract。

維護時請把 function name、CSS class、DOM id、state key 視為主要索引；line number 只當「大概在附近」的提示。改動某個 feature 後，只需要重新確認該 feature 區塊列出的入口是否仍可用，不需要因為前面新增幾行程式就重算整份文件的所有 line numbers。

當 feature 被移到獨立檔案時，請把本文件更新成新的 path，並移除過期的 single-file line references。

## 快速搜尋指令

從 project root 執行：

```powershell
Select-String -Path .\flowchart.html, .\docs\*.md -Pattern 'featureId|css-class|functionName|stateName'
Select-String -Path .\flowchart.html -Pattern 'btnSearchPrev|btnSearchNext|flow-search-button|jumpProjectSearch'
```

## Search Bar

使用者介面元素：

- `#flowSearch`
- `#flowSearchInput`
- `#btnSearchPrev`
- `#btnSearchNext`
- `.flow-search-button`

目前程式入口：

- CSS 樣式：`flowchart.html:1383`, `flowchart.html:1407`, `flowchart.html:1418`
- HTML 結構：`flowchart.html:1913` to `flowchart.html:1917`
- DOM 參照：`flowchart.html:2020` to `flowchart.html:2024`
- State 狀態：`state.search` at `flowchart.html:2235`
- 搜尋結果建立：`buildProjectSearchResults()` at `flowchart.html:2782`
- 文字正規化：`normalizeSearchText()` at `flowchart.html:2767`
- 文字比對：`searchTextMatches()` at `flowchart.html:2775`
- 狀態顯示更新：`updateFlowSearchStatus()` at `flowchart.html:2847`
- 搜尋結果刷新：`refreshProjectSearchResults()` at `flowchart.html:2856`
- 搜尋結果聚焦：`focusProjectSearchResult()` at `flowchart.html:2880`
- 上一筆/下一筆：`jumpProjectSearch()` at `flowchart.html:2908`
- Focus 清理：`releaseSearchNavFocus()` at `flowchart.html:2934`, `releaseFlowSearchFocus()` at `flowchart.html:2940`
- Event binding：`flowchart.html:5852` to `flowchart.html:5884`

驗證方式：

- 在 search input 輸入 keyword。
- 按 Enter 移動到下一筆結果。
- 點擊 previous / next buttons。
- 確認目前 result 有正確 focus，且 `0/0` status 會更新。

不建議從這裡開始處理：

- Saving project files。
- Import/export behavior。
- Edge path rendering。
- Node creation/deletion。

## Flow / Subflow Navigation

使用者介面元素：

- Flow breadcrumb。
- Back button。
- Remove current empty subflow button。
- Node subflow button。

目前程式入口：

- CSS 樣式：flow navigation area near `flowchart.html:1436`
- Node control / subflow CSS：`.node-control-stack` around `flowchart.html:844`, `.node-subflow` around `flowchart.html:1594`
- DOM 參照：`flowchart.html:2016` to `flowchart.html:2019`
- Flow helpers：`rootFlow()` at `flowchart.html:2695`, `currentFlow()` at `flowchart.html:2702`
- Flow id helpers：`nodeFlowId()` at `flowchart.html:2706`, `edgeFlowId()` at `flowchart.html:2710`, `groupFlowId()` at `flowchart.html:2714`
- Current collections：`currentNodes()` at `flowchart.html:2718`, `currentEdges()` at `flowchart.html:2722`, `currentGroups()` at `flowchart.html:2726`
- Flow path helpers：`flowPath()` at `flowchart.html:2743`, `flowPathLabel()` at `flowchart.html:2771`
- Breadcrumb render：`updateFlowNav()` at `flowchart.html:2755`
- Empty subflow check：`isCurrentSubflowEmpty()` at `flowchart.html:2946`
- Current flow render：`renderCurrentFlow()` at `flowchart.html:2974`
- Flow switch：`setCurrentFlow()` at `flowchart.html:2984`
- Node subflow creation：`ensureNodeSubflow()` at `flowchart.html:2995`
- Flow deletion helpers：`descendantFlowIds()` at `flowchart.html:3011`, `deleteFlows()` at `flowchart.html:3020`, `removeCurrentEmptySubflow()` at `flowchart.html:3036`
- Node subflow button render/click：`flowchart.html:4871` to `flowchart.html:4888`
- Event binding：`flowchart.html:5847` to `flowchart.html:5851`

驗證方式：

- 進入 node subflow。
- 回到 parent flow。
- 移除 empty subflow。
- 確認 search 與 render 在需要時仍以 current flow 為範圍。
- 如果 subflow button 被 CSS 收起，先做只讀驗證：breadcrumb、Back 狀態、Remove hidden、subflow button DOM、console error。

## Node Create / Edit / Render

使用者介面元素：

- Add text box button。
- Node title/body editing。
- Tag editor。
- Shape picker。
- Resize handles。
- Node move handle and subflow button。

對應 modules：

- 主要 module：`Node Renderer`
- 相關 modules：`Selection / Dragging`, `Flow / Subflow`, `Edge Router / Renderer`, `Storage / API`, `Display / Theme`

目前程式入口：

- CSS 樣式：node styles begin around `flowchart.html:620`
- Node selection classes：around `flowchart.html:689`
- Tag and shape picker CSS：around `flowchart.html:840` and `flowchart.html:1141`
- Display / shape helpers：`applyNodeDisplay()` at `flowchart.html:2373`, `applyNodeShape()` at `flowchart.html:2461`
- Editable undo helpers：`beginEditableUndo()` at `flowchart.html:3353`, `commitEditableUndo()` at `flowchart.html:3358`
- Selection helpers：`addNodeToSelection()` at `flowchart.html:3691`, `toggleNodeSelection()` at `flowchart.html:3701`, `select()` at `flowchart.html:3709`, `clearSelection()` at `flowchart.html:3716`
- Connector points render：`renderConnectorPoints()` at `flowchart.html:4459`
- Tag helpers：`normalizeTagText()` at `flowchart.html:4479`, `tagClass()` at `flowchart.html:4485`, `syncTagsFromRow()` at `flowchart.html:4490`, `focusTag()` at `flowchart.html:4514`, `createTagPill()` at `flowchart.html:4523`, `addTagFromPicker()` at `flowchart.html:4618`, `renderTagEditor()` at `flowchart.html:4628`
- Picker cleanup：`closeTagPickers()` at `flowchart.html:4547`, `closeShapePickers()` at `flowchart.html:4553`
- Shape picker：`renderShapePicker()` at `flowchart.html:4559`
- Node drag：`beginNodeDrag()` at `flowchart.html:4784`
- Node controls：`setNodeControlsOpen()` at `flowchart.html:4812`
- Node render：`renderNode()` at `flowchart.html:4816`
- Node position refresh：`refreshNodePosition()` at `flowchart.html:5024`
- Node creation：`addNode()` at `flowchart.html:5038`
- Delete selected：`deleteSelected()` at `flowchart.html:5089`
- Add button binding：`flowchart.html:5745`
- 相關資料格式：`docs/data-format.md` 的 `nodes` section

驗證方式：

- 新增 node。
- 編輯 title/body。
- 新增或編輯 tags。
- 變更 shape。
- Resize 並 move node。
- 確認 undo/save 仍正常。
- 如果只做低風險驗證，可以先檢查既有 node DOM：title/body contenteditable、tagrow、shape picker、move handle、connector points、resize handle、subflow button、console error。
- 若驗證牽涉 `subflowId`、`flowId`、`shape`、`tags`，同步檢查 `docs/data-format.md` 的 `nodes` section 是否描述完整。

## Edge Create / Edit / Route

使用者介面元素：

- Connector points。
- Edge paths。
- Selected edge style。
- Edge bend and endpoint grips。
- Reconnect behavior。

對應 modules：

- 主要 module：`Edge Router / Renderer`
- 相關 modules：`Node Renderer`, `Selection / Dragging`, `Flow / Subflow`, `Group Renderer`, `Storage / API`, `Import / Export`

目前程式入口：

- CSS 樣式：SVG and edge styles around `flowchart.html:579`
- Connector constants：`flowchart.html:2087` and `flowchart.html:2088`
- State：`state.edges`, `state.hoverEdge`, `state.draftEdge`, `state.pendingPort`, `state.connectorDrag` around `flowchart.html:2218`
- Edge route helpers：`shortenPoint()` at `flowchart.html:3868`, `compactConnectorPoints()` at `flowchart.html:3879`
- Route scoring and obstacles：`routeObstacles()` at `flowchart.html:3929`, `scoreRoutePoints()` at `flowchart.html:4013`
- Route calculation：`routeMetrics()` at `flowchart.html:4099`, `edgeRoutePoints()` at `flowchart.html:4170`
- Edge normalization：`normalizeEdge()` at `flowchart.html:4185`, `normalizeAllEdges()` at `flowchart.html:4210`
- Edge drag/reconnect：`startConnectorDrag()` at `flowchart.html:4215`, `finishEndpointReconnect()` at `flowchart.html:4228`, `selectEdgeForEdit()` at `flowchart.html:4269`, `updateConnectorDrag()` at `flowchart.html:4278`
- Edge render：`redrawEdges()` at `flowchart.html:4299`
- Connector point click：`handleConnectorPointClick()` at `flowchart.html:4419`
- Connector point render：`renderConnectorPoints()` at `flowchart.html:4459`
- Edge creation：`addEdge()` at `flowchart.html:5063`
- Edge delete cleanup：`deleteSelected()` removes selected edge and related node edges around `flowchart.html:5089`
- Pointer / drag finish：stage pointer handlers update connector drag and draft edge around `flowchart.html:5208` and `flowchart.html:5302`
- Import / export：`exportJSON()` includes `edges` at `flowchart.html:5416`; `importJSON()` restores edges around `flowchart.html:5562`
- 相關資料格式：`docs/data-format.md` 的 `edges` section
- 相關 API：`docs/api.md` 的 `GET /api/flowchart` and `POST /api/flowchart`

驗證方式：

- 低風險只讀驗證：確認 `path.edge`、`path.edge-hit`、`.connector-point` 存在，且 console 沒有 error。
- 點選既有 edge，確認 selected edge、bend grips、endpoint grips、guide/halo 會出現。
- API/data 驗證：讀 `GET /api/flowchart` 或 `flowchart.json`，確認 `edges` 有 `from`、`to`、`fromPort`、`toPort`、`flowId`、`elbow`、`manualElbow` 等欄位。
- 高風險互動驗證需使用測試專案或先備份資料：從一個 node 建立 edge 到另一個 node、delete edge、drag bend grips、reconnect edge endpoint、move connected nodes 並確認 routes redraw。
- 不建議從 `redrawEdges()` 直接改資料結構；資料格式應先看 `normalizeEdge()`、`addEdge()`、`docs/data-format.md` 與 import/export flow。

## Selection / Dragging / Arrangement

使用者介面元素：

- Click selection。
- Multi-select。
- Marquee selection。
- Floating selection tools。
- Align、distribute、normalize size。
- Node/group drag and resize。

對應 modules：

- 主要 module：`Selection / Dragging`
- 相關 modules：`Node Renderer`, `Group Renderer`, `Edge Router / Renderer`, `Navigator / Viewport`, `Display / Theme`, `Storage / API`

目前程式入口：

- CSS 樣式：selection tools around `flowchart.html:706`
- Resize handles CSS：`.resize`, `.resize-y` around `flowchart.html:1220`
- HTML：`#selectionMarquee`, `#selectionTools`, `#btnAlignCenterX`, `#btnAlignCenterY`, `#btnDistributeX`, `#btnDistributeY`, `#btnNormalizeSize` around `flowchart.html:1936`
- DOM 參照：alignment buttons around `flowchart.html:2058`
- Selection state：`state.selected`, `state.selectedNodeIds`, `state.drag`, `state.groupDrag`, `state.marquee`, `state.resize` around `flowchart.html:2218`
- Selection UI update：`updateSelectionUI()` at `flowchart.html:3666`
- Selection helpers：`selectNodes()` at `flowchart.html:3684`, `addNodeToSelection()` at `flowchart.html:3691`, `toggleNodeSelection()` at `flowchart.html:3701`, `select()` at `flowchart.html:3709`, `clearSelection()` at `flowchart.html:3716`
- Marquee helpers：`normalizeRect()` at `flowchart.html:3723`, `rectsIntersect()` at `flowchart.html:3731`, `updateMarqueeBox()` at `flowchart.html:3738`, `updateMarqueeSelection()` at `flowchart.html:3752`, `stopMarquee()` at `flowchart.html:3763`
- Selected nodes：`selectedNodes()` at `flowchart.html:3771`
- Arrangement helpers：`rerouteEdgesForNodes()` at `flowchart.html:3778`, `finishNodeArrangement()` at `flowchart.html:3790`, `arrangeSelectedNodes()` at `flowchart.html:3798`, `normalizeSelectedNodeSizes()` at `flowchart.html:3850`
- Node resize state setup：`flowchart.html:4960` to `flowchart.html:4982`
- Node click / multi-select binding：`flowchart.html:4985` to `flowchart.html:5015`
- Node drag setup：`beginNodeDrag()` at `flowchart.html:4784`
- Group drag setup：`beginGroupDrag()` at `flowchart.html:4738`
- Stage marquee / pan start：`flowchart.html:5165` to `flowchart.html:5194`
- Window mousemove drag / groupDrag / marquee / resize handling：`flowchart.html:5228` to `flowchart.html:5300`
- Window mouseup finish drag / resize / marquee：`flowchart.html:5322` to `flowchart.html:5339`
- Selection tool binding：`flowchart.html:5837` to `flowchart.html:5843`
- 相關資料格式：selection state 本身不序列化；drag / resize / arrange 會改 `docs/data-format.md` 的 `nodes` geometry、`edges` route fields、`groups.nodeIds` relation。

驗證方式：

- Select one node。
- Shift/Ctrl multi-select。
- Marquee select。
- Align and distribute selected nodes。
- Normalize selected node size。
- 低風險驗證可先做 marquee select，確認 `.node.selected` 數量、`#selectionTools.show`、alignment buttons enabled。
- 若驗證 drag / resize / arrange，會改 node geometry 或 edge route，請先備份資料或使用測試專案。

## Group Create / Edit / Drag

使用者介面元素：

- Create group button。
- Group label editing。
- Group drag。
- Group selection。

對應 modules：

- 主要 module：`Group Renderer`
- 相關 modules：`Selection / Dragging`, `Flow / Subflow`, `Node Renderer`, `Edge Router / Renderer`, `Storage / API`, `Import / Export`

目前程式入口：

- CSS 樣式：group styles around `flowchart.html:1310`
- State：`state.groups` and `state.groupDrag` around `flowchart.html:2226`
- Flow helper：`groupFlowId()` at `flowchart.html:2714`, `currentGroups()` at `flowchart.html:2726`
- Bounds：`groupBounds()` at `flowchart.html:2730`
- Render current groups：`renderGroups()` at `flowchart.html:2969`
- Selection UI：`updateSelectionUI()` at `flowchart.html:3666`
- Group render：`renderGroup()` at `flowchart.html:4677`
- Group refresh：`refreshGroups()` at `flowchart.html:4717`
- Group edge origins：`groupEdgeOrigins()` at `flowchart.html:4722`
- Group drag：`beginGroupDrag()` at `flowchart.html:4738`
- Group creation：`createGroupFromSelection()` at `flowchart.html:4758`
- Group drag move/up：`flowchart.html:5251` to `flowchart.html:5330`
- Group delete cleanup：`deleteSelected()` at `flowchart.html:5089`
- Import / export：`exportJSON()` includes `groups` at `flowchart.html:5414`; `importJSON()` restores groups around `flowchart.html:5563`
- Create group binding：`flowchart.html:5753`
- 相關資料格式：`docs/data-format.md` 的 `groups` section

驗證方式：

- Select multiple nodes。
- Create a group。
- Edit group label。
- Drag group，確認 member nodes 與 edges 會跟著移動。
- 如果目前專案沒有 group，先做低風險驗證：確認 Create group button 存在、`state.groups` / saved JSON groups 數量、`.node-group` 不存在時頁面沒有 console error。
- 若驗證牽涉 `flowId` 或 `nodeIds`，同步檢查 `docs/data-format.md` 的 `groups` section。

## Account / Project Switchers

使用者介面元素：

- Account trigger and panel。
- Project trigger and panel。
- Search account/project lists。
- Create user/project。

目前程式入口：

- CSS 樣式：project/account controls around `flowchart.html:80`
- DOM 參照：`flowchart.html:2028` to `flowchart.html:2043`
- User helpers：`userSlug()` at `flowchart.html:2542`, `normalizeUser()` at `flowchart.html:2551`, `validateNewUserId()` at `flowchart.html:2557`
- User create hint：`updateAccountCreateHint()` at `flowchart.html:2573`
- User load/sync：`loadLocalUsers()` at `flowchart.html:2584`, `saveLocalUsers()` at `flowchart.html:2598`, `syncUsersFromServer()` at `flowchart.html:2603`
- Project helpers：`projectStorageKey()` at `flowchart.html:2631`, `currentProjectKey()` at `flowchart.html:2635`, `projectSlug()` at `flowchart.html:2639`, `uniqueProjectSlug()` at `flowchart.html:2648`
- Layout sync：`syncProjectToolWidth()` at `flowchart.html:2657`
- Labels/menus：`setProjectMenu()` at `flowchart.html:2665`, `setAccountMenu()` at `flowchart.html:2676`, `updateProjectLabel()` at `flowchart.html:2687`, `updateAccountLabel()` at `flowchart.html:2691`
- Render lists：`renderUserList()` at `flowchart.html:3056`, `renderProjectList()` at `flowchart.html:3090`
- Project load/select/create：`loadProjects()` at `flowchart.html:3124`, `refreshProjects()` at `flowchart.html:3141`, `selectProject()` at `flowchart.html:3149`, `createProject()` at `flowchart.html:3177`
- User select/create：`selectUser()` at `flowchart.html:3209`, `createUser()` at `flowchart.html:3239`
- Event binding：`flowchart.html:5887` to `flowchart.html:5913`

驗證方式：

- Switch account。
- Search project。
- Create user。
- Create project。
- 確認 loaded flow 屬於 selected account/project。

## Storage / API / Persistence

使用者介面元素：

- Automatic save。
- Manual save file button。
- Project load on switch/startup。
- Local fallback when server is unavailable。

目前程式入口：

- Storage constants：`flowchart.html:2090` to `flowchart.html:2094`
- Save scheduling：`saveState()` at `flowchart.html:3316`
- Snapshot/undo serialization：`snapshotState()` at `flowchart.html:3327`
- Project save：`saveProjectFile()` at `flowchart.html:3387`
- Project load：`loadSavedState()` at `flowchart.html:3403`
- Export payload：`exportJSON()` at `flowchart.html:5404`
- Import payload：`importJSON()` at `flowchart.html:5521`
- Save file binding：`flowchart.html:5950`
- Startup load：near `flowchart.html:6040`
- Server path helpers：`projectPaths()` at `server.js:54`
- Server save/load：`saveFlowchart()` at `server.js:148`, `readFlowchart()` at `server.js:180`
- Server list helpers：`listUsers()` at `server.js:197`, `listProjects()` at `server.js:229`
- API routes：`GET /api/users` at `server.js:307`, `GET /api/projects` at `server.js:313`, `GET /api/flowchart` at `server.js:320`, `POST /api/flowchart` at `server.js:332`
- 詳細資料格式：`docs/data-format.md`
- 詳細 API 說明：`docs/api.md`

驗證方式：

- Edit node 後 reload。
- Switch projects 並確認 state change。
- Manual save。
- 必要時讓 server fail，確認 local fallback 行為。

## Import / Export Drawer

使用者介面元素：

- Import/export drawer。
- Copy JSON。
- Save file。
- Mermaid export。
- Apply imported JSON。

對應 modules：

- 主要 module：`Import / Export`
- 相關 modules：`Storage / API`, `Toolbar / UI Shell`, `Prompt Guide`, `Node Renderer`, `Edge Router / Renderer`, `Group Renderer`, `Flow / Subflow`, `Display / Theme`

目前程式入口：

- CSS 樣式：drawer styles around `flowchart.html:1632`
- HTML：`#drawer`, `#ioArea`, `#btnSaveFile`, `#btnMermaid`, `#btnCopy`, `#btnApply`, `#btnClose` around `flowchart.html:1955`
- DOM 參照：`drawer`, `ioArea`, `btnSaveFile`, `btnMermaid`, `btnCopy`, `btnApply`, `btnClose` around `flowchart.html:2065`
- JSON export：`exportJSON()` at `flowchart.html:5404`
- Mermaid helpers：`escapeMermaidText()` at `flowchart.html:5421`, `mermaidNodeId()` at `flowchart.html:5430`, `mermaidNodeSyntax()` at `flowchart.html:5434`
- Mermaid export：`exportMermaid()` at `flowchart.html:5449`
- Clear/dedupe/import：`clearAll()` at `flowchart.html:5487`, `dedupeEdges()` at `flowchart.html:5502`, `nodeImportKey()`, `edgeImportKey()`, `mergeImportedJSON()`, `importJSON()` at `flowchart.html:5521`
- Save JSON：`saveProjectFile(exportJSON())` binding around `flowchart.html:5950`
- Drawer bindings：open/close around `flowchart.html:5771` and `flowchart.html:5920`; copy/save/Mermaid/apply around `flowchart.html:5941` to `flowchart.html:5963`; `btnApply` calls `importJSON(ioArea.value, { mode: 'merge' })`
- 相關資料格式：`docs/data-format.md` 的 top-level fields、`display`、`flows`、`groups`、`nodes`、`edges`
- 相關 API：`docs/api.md` 的 `GET /api/flowchart` and `POST /api/flowchart`
- 後端 Mermaid export：`toMermaid()` at `server.js:108`; `saveFlowchart()` writes `.json` and `.mmd` around `server.js:148`

驗證方式：

- Open drawer。
- 低風險驗證：Open drawer，確認 `#ioArea` 會填入可解析 JSON，且 prompt drawer 會關閉。
- 低風險驗證：Export Mermaid，確認 `#ioArea` 內容以 `flowchart TD` 開頭並包含 `-->` edge lines。
- 安全驗證：Apply invalid JSON，確認顯示 JSON parse error，且 current nodes / edges 沒被清空。
- Merge 驗證：Apply valid JSON 後只新增未存在的 flows / nodes / edges / groups；既有 node id 或同 flow title 不覆蓋，既有 edge `flowId + from + to` 不重複。
- API/data 驗證：讀 `GET /api/flowchart` 或 `flowchart.json`，確認 top-level keys 與 `docs/data-format.md` 一致。
- 高風險驗證需使用測試專案或先備份資料：Copy JSON、Save file、Apply valid JSON；正式資料套用會保存補強後狀態。
- 不建議從 drawer click handler 直接改資料格式；資料格式應先看 `exportJSON()`、`importJSON()`、`docs/data-format.md`、`docs/api.md`。

## Toolbar / UI Shell

使用者介面元素：

- Top toolbar shell。
- Action buttons row。
- View controls row。
- Action settings toggle。
- More / help panel。
- Toolbar overflow menu。
- Import/export drawer trigger。
- Prompt guide drawer trigger。

對應 modules：

- 主要 module：`Toolbar / UI Shell`
- 相關 modules：`Display / Theme`, `Node Renderer`, `Group Renderer`, `Import / Export`, `Prompt Guide`, `Account / Project`

目前程式入口：

- CSS 樣式：`.toolbar`, `.toolbar-row`, `.toolbar-actions`, `.toolbar-view` around `flowchart.html:233`
- More / overflow CSS：`.toolbar-more`, `.toolbar-more-section`, `.overflow-item` around `flowchart.html:456`
- Drawer CSS：`.drawer` around `flowchart.html:1621`, `.prompt-drawer` around `flowchart.html:1665`
- Toolbar HTML：`#toolbar`, `.toolbar-actions`, `.toolbar-view`, `#toolbarMore`, `#toolbarOverflow` around `flowchart.html:1862`
- Action buttons HTML：`#btnAdd`, `#btnAddLane`, `#btnActionSettings`, `#btnDelete`, `#btnIO`, `#btnPromptGuide`, `#btnHelpToggle` around `flowchart.html:1864`
- DOM 參照：`toolbar`, `toolbarActions`, `toolbarOverflow`, `btnActionSettings`, `btnIO`, `btnPromptGuide`, `btnHelpToggle`, `drawer`, `promptDrawer` around `flowchart.html:2025`
- Toolbar state：`toolbarLayoutTimer`, `toolbarRows`, `toolbarOverflowItems` around `flowchart.html:2197`
- Help panel open/close：`setHelpPanel()` at `flowchart.html:2533`, `closeHelpPanel()` at `flowchart.html:2538`
- Project label width sync：`syncProjectToolWidth()` at `flowchart.html:2657`
- Overflow helpers：`restoreToolbarItems()` at `flowchart.html:3265`, `moveToolbarItemToOverflow()` at `flowchart.html:3279`, `toolbarRowContentWidth()` at `flowchart.html:3285`, `fitToolbarRow()` at `flowchart.html:3292`
- Overflow layout：`layoutToolbarOverflow()` at `flowchart.html:3303`, `scheduleToolbarLayout()` at `flowchart.html:3311`
- Resize hooks：`flowchart.html:5204` to `flowchart.html:5205`
- Action settings binding：`flowchart.html:5754` to `flowchart.html:5763`
- Drawer trigger bindings：`btnIO` at `flowchart.html:5771`, `btnPromptGuide` at `flowchart.html:5780`
- Help panel binding：`btnHelpToggle` at `flowchart.html:5844`
- Drawer close bindings：`btnClose`, `btnPromptClose` at `flowchart.html:5920` to `flowchart.html:5921`

驗證方式：

- 低風險只讀驗證：確認 toolbar、action buttons、view controls、drawers DOM 存在。
- 點擊 More / help panel，確認 `#toolbar` 切換 `open` class，`#toolbarMore` 顯示，`aria-expanded` 正確。
- 點擊 Import/export trigger，確認 `#drawer` open，且 prompt drawer 關閉。
- 點擊 Prompt guide trigger，確認 `#promptDrawer` open，且 import/export drawer 關閉。
- Resize window，確認 overflow items 進入 `#toolbarOverflow`，Help button active state 更新。
- 不在 Toolbar / UI Shell 直接修改 node / edge / display / project data；應委派給對應 module action。

## Toolbar / Display Controls

使用者介面元素：

- Add node/group。
- Action settings。
- Delete。
- Import/export。
- Prompt guide。
- Knowledge/flowchart mode。
- Body line count。
- Flow title size。
- Theme menu。
- Alignment tools。

對應 modules：

- 主要 module：`Display / Theme`
- 相關 modules：`Toolbar / UI Shell`, `Node Renderer`, `Group Renderer`, `Edge Router / Renderer`, `Storage / API`, `Import / Export`

目前程式入口：

- CSS 樣式：toolbar styles around `flowchart.html:233`
- Theme CSS：`.flow-theme-tool`, `.flow-theme-button`, `.flow-theme-panel`, `.flow-theme-option`, `.flow-theme-select`, `.flow-theme-toggle` around `flowchart.html:291`
- Display controls HTML：`btnModeKnowledge`, `btnModeFlowchart`, `btnBodyLines`, `btnFlowTitleSize`, `btnFlowTheme`, `flowThemePanel` around `flowchart.html:1877`
- DOM 參照：`flowchart.html:2051` to `flowchart.html:2057`
- Display defaults/options：`DEFAULT_DISPLAY` at `flowchart.html:2095`, `BODY_LINE_OPTIONS` at `flowchart.html:2101`, `FLOW_TITLE_SIZE_OPTIONS` at `flowchart.html:2102`, `FLOWCHART_THEMES` at `flowchart.html:2103`, `FLOW_THEME_VISIBILITY_KEY`
- Theme panel UI preference state：`flowThemeEditMode`, `visibleFlowThemeIds`, `normalizeVisibleFlowThemeIds()`, `loadVisibleFlowThemeIds()`, `saveVisibleFlowThemeIds()` around `flowchart.html:2241`
- Display normalize：`normalizeDisplaySettings()` at `flowchart.html:2264`
- Display labels/theme helpers：`bodyLineLabel()` at `flowchart.html:2278`, `currentFlowchartTheme()` at `flowchart.html:2282`, `applyFlowchartTheme()` at `flowchart.html:2286`
- Theme panel render/open：`renderFlowchartThemePanel()` at `flowchart.html:2297`, `setFlowThemePanel()` at `flowchart.html:2356`
- Display controls update：`updateDisplayControls()` at `flowchart.html:2361`
- Node display apply：`applyNodeDisplay()` at `flowchart.html:2373`
- Display settings apply：`applyDisplaySettings()` at `flowchart.html:2386`
- View mode switch：`setViewMode()` at `flowchart.html:2398`
- Export/import data：`exportJSON()` includes `display` at `flowchart.html:5412`; `importJSON()` restores display around `flowchart.html:5550`
- 相關資料格式：`docs/data-format.md` 的 `display` section
- Toolbar overflow：`layoutToolbarOverflow()` at `flowchart.html:3303`
- Display/theme bindings：`flowchart.html:5788` to `flowchart.html:5835`

驗證方式：

- Toggle knowledge/flowchart mode。
- Change body lines。
- Change title size。
- Change theme。
- Edit visible theme options：open theme panel、toggle Edit、select up to 4 visible themes、toggle View。
- Resize window 並確認 overflow 正常。
- 低風險只讀驗證：確認 `stage` 有 `mode-knowledge` 或 `mode-flowchart` class、`data-flow-theme`、theme CSS variables、display buttons active state、第一個 node 的 display classes。
- 若驗證牽涉 `viewMode`、`knowledgeBodyLines`、`flowchartTitleSize`、`flowchartTheme`，同步檢查 `docs/data-format.md` 的 `display` section。
- Theme panel visible theme selection is saved as browser UI preference in `localStorage` via `FLOW_THEME_VISIBILITY_KEY`；不寫入 `flowchart.json`，所以不需要更新 `docs/data-format.md`。

## Prompt Guide Drawer

使用者介面元素：

- Prompt guide drawer。
- Feature input。
- Prompt refresh/copy。

對應 modules：

- 主要 module：`Prompt Guide`
- 相關 modules：`Toolbar / UI Shell`, `Import / Export`, `Storage / API`, `Data Format`

目前程式入口：

- CSS 樣式：prompt drawer styles around `flowchart.html:1672`
- HTML：`#promptDrawer`, `#promptFeatureInput`, `#promptOutput`, `#btnPromptRefresh`, `#btnPromptCopy`, `#btnPromptClose` around `flowchart.html:1971`
- DOM 參照：`promptDrawer`, `promptFeatureInput`, `promptOutput`, `btnPromptClose`, `btnPromptRefresh`, `btnPromptCopy` around `flowchart.html:2072`
- Prompt build：`buildImportPrompt()` at `flowchart.html:5584`
- Prompt render：`updatePromptOutput()` at `flowchart.html:5741`
- Drawer trigger：`btnPromptGuide` binding around `flowchart.html:5780`
- Prompt bindings：close/refresh/input/copy around `flowchart.html:5921` to `flowchart.html:5929`
- 相關資料格式：Prompt 內容要求外部 LLM 輸出符合 `docs/data-format.md` 的 top-level fields、`flows`、`groups`、`nodes`、`edges`，並適合 merge import 補強既有圖
- 相關 API：Prompt Guide 本身不呼叫 API；產生的 JSON 後續會由 `Import / Export` 或 `Storage / API` 使用
- 不序列化 state：feature input / prompt output 只是 drawer UI text，不寫入 `flowchart.json`

驗證方式：

- Open prompt guide。
- Type feature description。
- Refresh prompt。
- Copy prompt。
- 確認 prompt drawer open 時 import/export drawer 會關閉。
- 確認輸出文字包含 feature name、只輸出純 JSON、必要 top-level keys、nodes/edges/groups/flows 格式、edge 匯入限制與補強式匯入規則。
- 確認 Refresh 會重新產生並選取 prompt output。
- 確認 Copy 成功或 fallback 選取文字，不應改變 nodes / edges / storage。
- 不建議在 Prompt Guide 直接修改 import behavior；匯入規則改變時應同步檢查 `importJSON()`、`docs/data-format.md` 與 `Import / Export Drawer`。

## Documentation Maintenance Rule

每次 code change 後，只要符合以下任一條件，就更新本文件：

- User-facing control、id、class 或 function entry point 改變。
- Feature 被移到新檔案。
- Verification steps 改變。
- Feature 開始依賴另一個 module。
- Feature 停止使用舊 dependency。

如果只是 implementation-only 的小修改，且不影響未來從哪裡開始找功能，就不需要更新本文件。
