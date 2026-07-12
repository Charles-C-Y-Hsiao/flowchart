# Flowchart 可導航架構與 LLM Context 管理計畫

## 1. 核心問題與目標

目前真正的痛點不是單純「檔案太長」，而是專案結構已逐漸承受不了 LLM 快速新增功能的速度。當功能持續加入同一個檔案，功能邊界、資料流與修改影響範圍會越來越難辨識；無論是人或 LLM，每次修改前都必須重新讀取大量程式碼，才能避免誤改其他功能。

因此，重構目標不只是把大檔案拆小，而是讓專案變得**可導航（Navigable）**：

- 能快速回答「某個功能在哪裡」。
- 能知道它讀取、修改哪些資料。
- 能知道它依賴哪些模組，又會影響哪些模組。
- 能明確排除與目前任務無關的檔案和功能。
- 讓人與 LLM 只載入完成任務所需的最小 Context。

## 2. `flowchart.html` 的現況與問題

目前 `flowchart.html` 約 **5,987 行**，並在單一檔案中同時承載多種責任，例如：

- HTML 結構與工具列 UI
- CSS 樣式與主題
- 節點與 Edge 的資料處理
- State 管理
- 搜尋、上一筆／下一筆與高亮
- SVG／畫面 Render
- Viewport、捲動與定位
- Storage、匯入與匯出
- History 或操作狀態

單檔的主要風險：

1. **Context 成本高**：修改搜尋也可能必須讀取數千行，才能找到相關狀態與 UI。
2. **責任邊界模糊**：搜尋、Render、Storage 等功能可能互相直接修改狀態。
3. **影響範圍難判斷**：很難確認一個函式是否被其他區塊隱性依賴。
4. **LLM 容易過度讀取或漏讀**：只靠全文搜尋，可能讀入大量無關內容，也可能漏掉間接依賴。
5. **拆檔後仍可能沒有改善**：如果只有多個檔案，卻沒有導航與邊界文件，仍然需要反覆全文搜尋。

## 3. `architecture.md` 的目的：導航，而不是介紹

`architecture.md` 不應只是專案背景或功能清單。它的核心用途是：

> 讓第一次接觸專案的人或 LLM，在十五分鐘內知道應該去哪裡找資料，以及哪些區域不需要讀取。

它應該像地圖，提供：

- 系統主要模組與彼此關係
- 每個模組的責任和禁止事項
- 資料的來源、擁有者與寫入者
- 主要入口點與檔案路徑
- 跨模組呼叫與資料流
- 常見任務的閱讀起點

概念架構可表示為：

```text
Toolbar / UI
     │
     ├── Search Module ── Navigator / Viewport
     │          │
     └── Node Module ──── Render Engine
                │
            Flow State
                │
          Storage / Import / Export
```

這張地圖應讓讀者立刻看出：搜尋可以讀取節點並要求 Navigator 聚焦，但不應直接建立節點、繪製 Edge 或寫入 Storage。

## 4. LLM 如何用 `architecture.md` 管理 Context

LLM 不會因為檔名叫 `architecture.md` 就自動理解整個專案；有效的快速定位來自**結構化、可驗證的導航資訊**，再配合逐層檢索。

建議流程：

1. **辨識任務意圖**：例如「修改搜尋結果的高亮行為」。
2. **查功能索引**：從 `feature-map.md` 找到 Search、Highlight、Selection、Viewport 的相關路徑。
3. **查模組邊界**：從 `architecture.md` 確認 Search 的輸入、輸出、依賴與禁止修改項目。
4. **建立候選 Context**：先讀 Search 的入口檔、直接依賴、相關測試與樣式。
5. **建立排除清單**：先排除文件明示不相關的 Storage、Import/Export、Edge 建立等區域。
6. **以程式碼驗證文件**：使用符號搜尋、引用搜尋或測試確認實際依賴；文件是導航，不是不可質疑的真相。
7. **按需擴張**：只有遇到未解符號、跨模組呼叫或測試失敗時，才向下一層載入更多檔案。

以 Search 任務為例：

```text
任務：修改搜尋的 next / previous
  ↓
納入：search.js、flow-state.js 的唯讀介面、navigator.js、搜尋 UI/CSS、相關測試
  ↓
暫時排除：storage.js、import-export.js、edge-renderer.js、node-create.js
  ↓
若引用搜尋顯示 Search 會更新 History，再加入 history.js
```

要讓這個流程可靠，每個模組條目應包含以下欄位：

- `Responsibility`：負責什麼
- `Inputs`：讀取哪些資料或事件
- `Outputs`：回傳值、事件或公開操作
- `Owns / Writes`：擁有或可修改哪些狀態
- `Dependencies`：允許依賴哪些模組
- `Entry points`：主要檔案和公開函式
- `Related tests/styles`：驗證與 UI 相關檔案
- `Do NOT`：禁止處理或修改的責任
- `Expand context when`：什麼情況才需讀取額外模組

其中 `Do NOT` 和 `Owns / Writes` 是排除 Context 的重要依據。不過排除應是「預設不載入」，不是永遠禁止檢查；若程式碼引用或測試結果顯示存在真實依賴，仍應擴張 Context，並回頭修正過期文件。

## 5. 建議的文件結構

過渡期可先將規劃文件放在 `plan/`；正式且穩定的專案知識移至 `docs/`：

```text
flowchart/
├── README.md
├── AGENTS.md
├── plan/
│   ├── architecture-plan.md
│   └── refactor-roadmap.md
└── docs/
    ├── architecture.md
    ├── folder-map.md
    ├── feature-map.md
    ├── module-boundary.md
    ├── coding-style.md
    └── data-flow.md
```

各文件定位：

- `README.md`：專案用途、啟動方式與文件入口。
- `architecture.md`：高階模組地圖、責任、資料流與依賴方向。
- `folder-map.md`：資料夾／檔案用途及主要入口點。
- `feature-map.md`：由使用者功能映射到 JS、CSS、HTML 與測試。
- `module-boundary.md`：可依賴方向、狀態所有權與禁止跨界操作。
- `data-flow.md`：重要事件如何穿過 State、Render、Storage 等模組。
- `coding-style.md`：命名、事件、錯誤處理與模組匯出規則。
- `AGENTS.md`：給 LLM/Codex 的閱讀順序、驗證命令、可改範圍及文件同步規則。

## 6. 模組責任邊界範例

### Search Module

```yaml
Responsibility:
  - 接收 keyword
  - 計算符合條件的節點
  - 管理目前結果索引與 previous / next
  - 要求 Navigator 聚焦與高亮結果
Inputs:
  - FlowState 的唯讀 nodes
  - 搜尋輸入事件
Outputs:
  - SearchResult
  - focusNode(nodeId)
Owns / Writes:
  - query
  - resultIds
  - activeResultIndex
Dependencies:
  - FlowState read API
  - Navigator
Entry points:
  - assets/js/search.js
Do NOT:
  - 建立、刪除或直接修改 Node
  - 寫入 Storage
  - Render Edge
  - 處理 Import / Export
Expand context when:
  - focusNode 的行為或 Viewport 測試失敗
  - 搜尋狀態需要被 History 保存
```

### Node Renderer

```yaml
Responsibility:
  - renderNode()
  - updateNode()
  - removeNodeElement()
Inputs:
  - FlowState 的 node view model
  - Theme
Outputs:
  - DOM / SVG node elements
Dependencies:
  - FlowState read API
  - Theme
Do NOT:
  - save()
  - search()
  - 呼叫遠端 API
  - 擁有業務 State
```

## 7. 專案成熟度 L0–L4

| 等級 | 專案狀態 |
| --- | --- |
| L0 | 一個大檔案，主要依靠人的記憶定位程式。 |
| L1 | 拆成多個檔案，但仍需靠全文搜尋理解功能。 |
| L2 | 有 `architecture.md`、`feature-map.md` 等導航文件，人與 LLM 能快速定位。 |
| L3 | 模組責任、依賴方向、State 所有權明確，並有 `AGENTS.md` 約束修改與驗證流程。 |
| L4 | 建立可查詢的專案知識層，能回答功能位置、依賴與影響範圍，再決定載入哪些原始碼。 |

目前專案約位於 **L0 到 L1 的轉換期**；下一個關鍵目標是達到 L2，而不是一次追求完整知識圖譜。

## 8. 後續執行計畫

### Phase 0：建立基準與保護網

- 記錄目前可用功能與手動驗收清單。
- 找出 HTML 中 CSS、JS、資料與模板的邊界。
- 建立最小 smoke test，至少涵蓋載入、節點顯示、搜尋與儲存。
- 重構前保留可比較的基準行為。

### Phase 1：先拆 CSS

- 將 CSS 依基礎樣式、Toolbar、Node、Edge、Search、Theme 分區。
- 第一階段只搬移，不同時改變視覺或命名。
- 建立明確的載入順序，避免 cascade 改變。
- 每次搬移後做畫面與互動回歸驗證。

### Phase 2：抽離 Search Module

- 先列出目前搜尋讀取與寫入的所有狀態。
- 定義 Search 公開介面與內部狀態。
- 將 keyword、結果計算、previous / next 抽離。
- 將 scroll / focus / highlight 委派給 Navigator 或 Viewport。
- 加入搜尋結果、空結果、切換結果與節點刪除後的測試。

### Phase 3：建立正式導航文件

- 從實際抽離結果反寫 `docs/architecture.md`。
- 建立 `feature-map.md`，先涵蓋 Search、Node、Edge、Storage。
- 記錄 State 所有權與允許的依賴方向。
- 在每次跨模組重構後同步更新文件。

### Phase 4：加入 `AGENTS.md`

根目錄 `AGENTS.md` 至少應規定：

- 接到功能任務時先讀哪些文件。
- 依 `feature-map.md` 選擇初始 Context。
- 不得只依文件猜測，必須用符號／引用搜尋驗證。
- 不得修改任務範圍外的模組，除非先說明真實依賴。
- 必須執行哪些測試與手動驗收。
- 程式結構改變時，必須同步更新哪些文件。

### Phase 5：逐步進入 L3–L4

- 為 Node、Edge、Storage、History、Viewport 建立同格式的模組契約。
- 自動產生符號、呼叫與依賴索引，減少文件過期。
- 由 knowledge layer 回答「功能在哪、依賴什麼、會影響哪裡」。
- 讓 LLM 先查知識層，再按需讀取程式碼，而不是每次重讀整個專案。

## 9. 完成標準

這份計畫成功的判斷方式，不是檔案數量變多，而是：

- 修改 Search 時，不需要先讀完整的 `flowchart.html`。
- 可從文件在數分鐘內定位功能入口、狀態與測試。
- 模組能說明自己負責什麼，也能說明自己不負責什麼。
- LLM 能提出一份有依據的「納入／排除 Context 清單」。
- 文件和程式碼不一致時，有搜尋、測試與更新流程能發現並修正。

