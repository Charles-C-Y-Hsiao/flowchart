# Search Docs 驗證與補強紀錄

## 背景

這份紀錄整理最近兩次針對 `Search Bar` 的 docs 驗證討論。目標是確認 `docs/architecture.md` 與 `docs/feature-map.md` 是否真的能協助定位 Search 相關程式，並判斷是否需要補強文件。

## 驗證清單狀態

```text
[x] architecture.md 能判斷 Search module 邊界
[x] feature-map.md 能找到 Search CSS / HTML / JS / state
[x] Select-String 搜尋結果與 docs 一致
[x] Browser 操作 Search 正常
[x] 讀完相關程式後沒有明顯缺漏
[x] docs 有需要補的地方已更新
```

## PowerShell 搜尋方式

如果無法使用 `rg`，可以使用 PowerShell 內建的 `Select-String`。

針對 `.flow-search-button`：

```powershell
Select-String -Path .\flowchart.html -Pattern '\.flow-search-button'
```

針對完整 Search Bar entry points：

```powershell
Select-String -Path .\flowchart.html -Pattern 'flow-search|btnSearchPrev|btnSearchNext|state\.search|buildProjectSearchResults|refreshProjectSearchResults|focusProjectSearchResult|jumpProjectSearch'
```

這次驗證中，`Select-String` 找到的 CSS、HTML、state、function、event binding 行號與 `docs/feature-map.md` 的 `Search Bar` 區塊一致。

## Search 相關程式清單

| 程式 | 作用 |
| --- | --- |
| `.flow-search` | 搜尋列容器，控制排版、間距、左側分隔線。 |
| `.flow-search-input` | 搜尋輸入框樣式。 |
| `.flow-search-button` | 上一筆/下一筆按鈕樣式，包含 icon size 與置中。 |
| `.flow-search-status` | 顯示目前搜尋位置，例如 `1/13`。 |
| `state.search` | 保存搜尋狀態：`query`、`results`、`index`。 |
| `normalizeSearchText()` | 將搜尋文字 trim 並轉小寫。 |
| `searchTextMatches()` | 判斷 title/body/tags/flow label/id 等文字是否包含 keyword。 |
| `buildProjectSearchResults()` | 建立搜尋結果，搜尋 nodes、groups、flows，並依 flow 順序與位置排序。 |
| `updateFlowSearchStatus()` | 更新 `0/0`、`1/13` 文字，切換 `has-results` class，啟用/停用 prev/next buttons。 |
| `refreshProjectSearchResults()` | 根據 input 重新建立 results，必要時保留目前 selected result。 |
| `focusProjectSearchResult()` | 聚焦搜尋結果；必要時切換 flow，並 select / center node 或 group。 |
| `jumpProjectSearch()` | 處理 previous / next，更新 `state.search.index`，再呼叫 focus。 |
| `releaseSearchNavFocus()` | 點擊 prev/next 後移除 button focus，避免 Space 重複觸發。 |
| `releaseFlowSearchFocus()` | 點擊搜尋列外部時 blur 搜尋區內的 focus。 |
| Event bindings | input 時刷新結果，Enter 跳下一筆，Shift+Enter 跳上一筆，Escape 清空搜尋。 |

## Browser 驗證結果

使用目前頁面上存在的 keyword：`load`。

```text
輸入 load:
status = 0/13
prev/next enabled

按 Enter:
status = 1/13
selected = loadProjects()

按 Next:
status = 2/13
selected = loadSavedState()

按 Prev:
status = 1/13
selected = loadProjects()

按 Escape:
status = 0/0
input 清空
prev/next disabled
has-results 移除
```

結論：`Search Bar` browser 操作正常。

## Docs 補強決策

原本 `docs/feature-map.md` 已經能找到主要 Search entry points，因此作為導航文件是可用的。不過為了讓第一次閱讀 Search 流程的人更快理解，已補上以下 helper functions：

- `normalizeSearchText()`
- `searchTextMatches()`
- `updateFlowSearchStatus()`
- `releaseSearchNavFocus()`
- `releaseFlowSearchFocus()`

這些補充仍維持導航用途，不展開 function 內部 implementation details。
