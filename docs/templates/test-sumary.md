# 🧪 QA Sprint Report – 2026-04-16

**Project:** Dutch-English Phrase Game Automation
**Type:** UI Cross-Browser Regression Sprint
**Tooling:** Playwright (Chromium, Firefox, WebKit)

---

## 🎯 Sprint Goal

Validate UI consistency of the final results screen across browsers and ensure layout alignment between key components:

* `.top-result`
* `.scoreboard`

---

## 🧪 Scope of Testing

* End-to-end user flow (name entry → game → results screen)
* UI validation on final results page
* Cross-browser execution (Chromium, Firefox, WebKit)

---

## 🔁 Test Flow Executed

1. Open application
2. Enter username: **Tester**
3. Confirm entry (Enter key)
4. Handle browser dialogs (OK)
5. Start game
6. Navigate to results via "View results" button
7. Capture UI measurements:

   * `.top-result`
   * `.scoreboard`

---

## ❌ Issues Found

### 🔴 Critical – WebKit layout breakdown

* `.top-result` width significantly larger than expected
* Measured:

  * Expected baseline: ~740px
  * WebKit: ~1178px
* Impact:

  * Severe layout inconsistency in Safari engine
  * UI structure visually broken

---

### 🟡 Medium – Cross-browser inconsistency

* Chromium: ~30px difference between elements
* Firefox: ~30px difference
* Indicates baseline layout drift across engines

---

## 🔧 Actions Taken

* Introduced Playwright UI consistency test
* Removed hard-coded pixel expectations
* Replaced with relative comparison:

  * `Math.abs(topWidth - scoreWidth) < threshold`

---

## ⚠️ Risks

* Safari/WebKit users experience significantly degraded layout
* UI inconsistency suggests missing or unstable CSS width constraints
* Current layout is not fully responsive across browsers

---

## 📊 Quality Assessment

| Browser  | Status        | Severity |
| -------- | ------------- | -------- |
| Chromium | Partial fail  | Medium   |
| Firefox  | Partial fail  | Medium   |
| WebKit   | Major failure | Critical |

---

## 📌 Conclusion

The system demonstrates functional correctness in user flow execution, but fails in UI consistency across browsers.

Cross-browser layout stability is currently **not production-ready**, with WebKit showing severe deviation.

---

## 🚀 Recommendation

* Align `.top-result` and `.scoreboard` using shared width constraints
* Introduce responsive container rules (max-width / flex alignment)
* Validate layout consistency as part of CI regression suite
