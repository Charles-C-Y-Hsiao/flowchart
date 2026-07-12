# Feature Verification Status

## 目的

記錄逐條 feature 驗證狀態，避免重複驗證或忘記哪些 docs 已補強。

這份文件是「驗證看板」，不是 architecture 或 feature entry point 的主要來源：

- Module 邊界請看 `docs/architecture.md`。
- Feature 入口請看 `docs/feature-map.md`。
- Data format 請看 `docs/data-format.md`。
- API 行為請看 `docs/api.md`。

## 狀態定義

| Status | 說明 |
| --- | --- |
| `Not Started` | 尚未驗證。 |
| `In Progress` | 正在驗證。 |
| `Done` | 驗證完成，未發現明顯缺漏。 |
| `Partial` | 部分驗證完成，但有條件限制或仍需後續確認。 |
| `Needs Docs Update` | 驗證時發現 docs 需要補。 |
| `Blocked` | 因環境、資料或權限等因素暫時無法驗證。 |

## 驗證總表

| Feature | Primary Module | Related Modules | Status | Last Verified | Browser/API | Docs Updated | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Search Bar | Search | Flow / Subflow, Node Renderer, Group Renderer | Done | 2026-07-12 | Pass | Yes | Browser 搜尋、上一筆/下一筆、Escape 清除正常；已補 helper functions。 |
| Storage / API / Persistence | Storage / API | Account / Project, Import / Export, Data Format | Done | 2026-07-12 | Pass | Yes | API GET 驗證正常；已建立 `docs/data-format.md` 與 `docs/api.md`。 |
| Account / Project Switchers | Account / Project | Storage / API, Toolbar / UI Shell | Done | 2026-07-12 | Pass | Yes | API/user/project menu 只讀驗證正常；已補 helper functions。 |
| Flow / Subflow Navigation | Flow / Subflow | Node Renderer, Edge Router / Renderer, Search, Storage / API | Partial | 2026-07-12 | Partial | Yes | docs 已補 subflow helpers；Browser 曾因 IP/連線限制只能做部分只讀驗證。 |
| Node Create / Edit / Render | Node Renderer | Selection / Dragging, Flow / Subflow, Edge Router / Renderer, Storage / API, Display / Theme | Done | 2026-07-12 | Pass | Yes | Browser 只讀驗證 node DOM 正常；已補 editable undo、drag、selection helpers 與 `nodes.subflowId`。 |
| Edge Create / Edit / Route | Edge Router / Renderer | Node Renderer, Selection / Dragging, Flow / Subflow, Group Renderer, Storage / API, Import / Export | Done | 2026-07-12 | Pass | Yes | Browser 驗證 edge paths、hit paths、connector points 與 selected edge grips 正常；API/data 讀到 edges payload；已補 edge entry points 與 `manualElbow`。 |
| Group Create / Edit / Drag | Group Renderer | Selection / Dragging, Flow / Subflow, Node Renderer, Edge Router / Renderer, Storage / API, Import / Export | Partial | 2026-07-12 | Partial | Yes | 目前專案無 group，只驗證無 group 狀態、Create group button、console error；已補 group entry points。 |
| Selection / Dragging / Arrangement | Selection / Dragging | Node Renderer, Group Renderer, Edge Router / Renderer, Navigator / Viewport, Display / Theme, Storage / API | Done | 2026-07-12 | Pass | Yes | Browser marquee 驗證可選取 4 個 nodes，selection tools 與 alignment buttons 正常；已補 selection/drag/resize entry points。 |
| Toolbar / UI Shell | Toolbar / UI Shell | Display / Theme, Node Renderer, Group Renderer, Import / Export, Prompt Guide, Account / Project | Done | 2026-07-12 | Pass | Yes | Browser 驗證 toolbar buttons、More/help panel、Import/export drawer、Prompt drawer 正常；已補 UI shell entry points。 |
| Import / Export Drawer | Import / Export | Storage / API, Toolbar / UI Shell, Prompt Guide, Node Renderer, Edge Router / Renderer, Group Renderer, Flow / Subflow, Display / Theme | Done | 2026-07-13 | Pass | Yes | Browser 驗證 drawer open 與 invalid JSON 不清空資料；Node 測試驗證 merge import 只新增未存在的 flow/node/edge/group、略過重複 node/edge 與重複 owner subflow。 |
| Prompt Guide Drawer | Prompt Guide | Toolbar / UI Shell, Import / Export, Storage / API, Data Format | Done | 2026-07-13 | Pass | Yes | Browser 驗證 prompt drawer 輸出包含補強匯入規則、只輸出本次新增內容、保留既有節點/連線/群組/流程。 |
| Toolbar / Display Controls | Display / Theme | Toolbar / UI Shell, Node Renderer, Group Renderer, Edge Router / Renderer, Storage / API, Import / Export | Done | 2026-07-12 | Pass | Yes | Browser 驗證 theme panel Edit/View、最多 4 個 visible themes、select button 正常；visible theme preference reload 後仍保留，且已恢復原本清單。已補 Display / Theme entry points。 |

## 更新規則

每次完成 feature 驗證後，請更新此表：

- `Status`
- `Last Verified`
- `Browser/API`
- `Docs Updated`
- `Notes`

如果只是 docs entry point 微調，但沒有重新驗證功能，可以只更新 `Notes`，不要把 `Last Verified` 當成重新驗證日期。

## Viewer

可以用專案根目錄的 `verification-status-viewer.html` 讀取這份 markdown 表格並用 AG Grid 檢視、搜尋與篩選。
