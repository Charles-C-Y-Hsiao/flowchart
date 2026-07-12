# 新專案建立 architecture.md 與 feature-map.md 的 LLM 任務說明

## 使用目的

當我要在一個新專案中建立 `docs/architecture.md` 和 `docs/feature-map.md` 時，可以把這份文件的內容交給 LLM。目標是讓 LLM 快速理解：我不是要一般介紹文件，而是要建立能幫助人與 LLM agents 快速定位功能、縮小 context、避免亂改程式的導航文件。

## 任務目標

請在新專案中建立：

```text
docs/architecture.md
docs/feature-map.md
```

這兩份文件的目的如下：

- `docs/architecture.md`：描述專案的 module 邊界、state ownership、data flow、dependency direction，以及 LLM 修改程式時的 context rules。
- `docs/feature-map.md`：把 user-facing features 對應到目前 code entry points，包含 HTML / CSS / JS / state / API / verify steps。

## 重要原則

1. 文件要用來導航，不是寫完整教學。
2. 不要一次追求完美，先建立可用的第一版。
3. 程式相關名稱保留原文，例如 file path、function name、CSS class、DOM id、state name、API endpoint。
4. 說明文字使用繁體中文。
5. 如果專案目前是單檔大檔案，也先忠實記錄現況，不必急著拆檔。
6. 文件中的 line numbers 是定位起點，不是永久 contract。
7. 不要複製大量 implementation details，只記錄未來改功能時需要知道的入口、責任與驗證方式。

## 建議工作流程

請依照以下順序進行：

```text
1. 掃描專案檔案結構。
2. 找出主要 entry files，例如 HTML、frontend entry、server entry、config、data files。
3. 使用搜尋工具找出主要 features、functions、event bindings、API routes、state definitions。
4. 先建立 architecture.md，描述 module map、data flow、state ownership、context rules。
5. 再建立 feature-map.md，從 user-facing features 對應到 code entry points。
6. 用一個最小功能做驗證，確認 docs 能帶人找到正確程式。
7. 如果 docs 太粗或漏掉入口，補 feature-map.md。
8. 如果發現 module ownership 或 dependency direction 不準，補 architecture.md。
```

## 搜尋方式

如果在 PowerShell 環境，優先使用：

```powershell
Select-String -Path .\目標檔案 -Pattern 'keyword|functionName|className|stateName'
```

範例：

```powershell
Select-String -Path .\flowchart.html -Pattern 'btnSearchPrev|btnSearchNext|flow-search-button|jumpProjectSearch'
```

如果環境可使用 `rg`，也可以用：

```powershell
rg -n "keyword|functionName|className|stateName"
```

但文件中若要提供給 Windows PowerShell 使用者，請以 `Select-String` 範例為主。

## architecture.md 建議內容

`docs/architecture.md` 建議包含：

```text
# 專案 Architecture

## 目的
說明這份文件是導航文件，不是完整介紹文件。

## 目前結構
列出主要檔案、主要資料夾、前端入口、後端入口、資料檔。

## Module Map
用表格整理：
- Module
- Responsibility
- Owns / Writes
- Reads / Depends On
- Do Not Touch By Default

## Data Flow
描述 user event、state、render、storage、API 之間的流向。

## State Ownership
列出主要 state / data model 由誰擁有、誰可以修改。

## Context Rules For LLM Work
說明 LLM 修改功能時如何縮小 context：
先判斷 module -> 查 feature-map.md -> 只讀 entry points -> 有真實依賴再擴大。

## Future Split Direction
如果專案目前是大檔案，列出未來可能拆分方向，但不要要求一次完成。

## Documentation Update Workflow
說明每次修改功能後，什麼情況要同步更新 docs。
```

## feature-map.md 建議內容

`docs/feature-map.md` 建議用 user-facing feature 當章節，而不是用檔案名稱當章節。

每個 feature 建議包含：

```text
## Feature Name

使用者介面元素：
- DOM id / button / input / route / API endpoint

目前程式入口：
- CSS 樣式：`path/to/file`
- HTML / JSX / Template：`path/to/file`
- DOM 參照或 component：`functionName()` / `ComponentName`
- State 狀態：`stateName`
- 主要 action / handler：`functionName()`
- API / Storage：`endpoint` / `storageKey`
- Event binding：`path/to/file`

驗證方式：
- 操作步驟 1
- 操作步驟 2
- 預期結果

不建議從這裡開始處理：
- 與此 feature 無關的 module 或檔案
```

## 文件語言規則

請使用這種混合風格：

- 說明文字：繁體中文。
- 程式符號：保持原樣。
- 表格欄位若是常用架構詞可以保留英文，例如 `Module`、`Responsibility`、`State`、`Entry points`。
- Feature 標題可保留英文，例如 `Search Bar`、`Storage / API / Persistence`，方便和程式命名對應。

範例：

```md
目前程式入口：

- CSS 樣式：`flowchart.html:1383`
- DOM 參照：`flowchart.html:2020` to `flowchart.html:2024`
- State 狀態：`state.search`
- 搜尋結果建立：`buildProjectSearchResults()`
- Event binding：`flowchart.html:5852` to `flowchart.html:5884`
```

## 第一版驗證方式

建立完 docs 後，不要只停在文件產出。請選一個小功能驗證：

```text
1. 從 architecture.md 判斷 module。
2. 從 feature-map.md 找 entry points。
3. 用 Select-String 或 rg 驗證 entry points 存在。
4. 實際讀相關程式碼。
5. 如可執行，操作 UI 或跑測試驗證。
6. 如果文件有漏，更新 docs。
```

## 完成回報格式

完成時請回報：

```text
已建立：
- docs/architecture.md
- docs/feature-map.md

已涵蓋的主要 modules：
- ...

已涵蓋的主要 features：
- ...

已用哪個 feature 做第一輪驗證：
- ...

需要後續補充：
- data-format.md / api.md / tests / AGENTS.md 等
```
