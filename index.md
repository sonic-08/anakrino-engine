# Anakrino Engine (`anakrino-engine`) - Comprehensive Technical Analysis & Security Audit

> **Generated Date:** August 24, 2026  
> **Workspace:** `/home/reoo/anakrino-engine`  
> **Author:** Antigravity AI  

---

## 1. Project Overview

**Anakrino Engine** is a high-performance, aesthetically rich AI Tool Discovery Platform and Workflow Architecture Engine. Designed to help developers, creators, and business professionals discover, evaluate, and stack artificial intelligence tools, **Anakrino** bridges real-time web research with AI-assisted discovery.

The platform provides dual search modes:
1. **Tool Discovery Mode ("Find Tools"):** Synthesizes live web data to return the top 4–6 AI tools matching user queries with categorized strengths, weaknesses, and pricing structures.
2. **Project Architect Mode ("Plan Project"):** Generates structured, step-by-step 3-stage workflow plans using specialized AI tools to solve specific user objectives (e.g., automated video production, full-stack application development).

Additionally, **Anakrino** includes a floating real-time **AI Copilot**, custom **3D perspective tilt UI cards**, dynamic **generative HTML5 canvas mesh backgrounds**, and **Supabase cloud integration** for user authentication and bookmark management.

---

## 2. Technical Stack & How It Is Built

### 2.1 Technology Stack

| Layer | Technologies / Libraries | Description |
| :--- | :--- | :--- |
| **Frontend Core** | React 19 (`react`, `react-dom` `^19.2.7`), Vite 8 (`vite` `^8.1.1`) | High-speed React build setup using ES modules and Hot Module Replacement (HMR). |
| **Styling & UI** | Tailwind CSS v4 (`@tailwindcss/vite`, `tailwindcss` `^4.3.2`) | Utility-first CSS engine with Google Fonts (*Outfit*, *Plus Jakarta Sans*). |
| **Animations & 3D** | Framer Motion (`framer-motion` `^12.42.2`) | Spring-physics micro-animations, modal transitions, and 3D mouse-tracking card tilts (`Card3D`). |
| **Icons** | Lucide React (`lucide-react` `^1.23.0`) | Modern icon set for navigation, taxonomy, and UI status indicators. |
| **AI / LLM Engine** | `@google/generative-ai` (`^0.24.1`), Direct Gemini REST API | Calls Google Gemini models with live Google Search grounding (`tools: [{ googleSearch: {} }]`). |
| **Backend & Auth** | Supabase JS Client (`@supabase/supabase-js` `^2.110.1`) | Cloud PostgreSQL database + OAuth (Google) authentication and user bookmark persistence. |
| **Graphics / Visuals**| Native HTML5 2D Canvas API | Custom procedural particle mesh gradient background with active theme color swapping. |

---

### 2.2 Complete Repository File Tree

```
anakrino-engine/
├── .env                    # Environment variables (API Keys, Supabase Credentials)
├── .gitignore              # Git ignore rules
├── .vscode/                # VSCode editor configurations
│   ├── extensions.json
│   └── settings.json       # Deno & formatting settings
├── eslint.config.js        # ESLint flat configuration (React hooks, refresh rules)
├── index.html              # Core HTML entrypoint
├── package.json            # NPM dependencies and scripts
├── package-lock.json       # Locked dependency tree
├── README.md               # Standard Vite template documentation
├── vite.config.js          # Vite build config with React & Tailwind plugins
├── public/                 # Static public assets
│   ├── favicon.svg         # Site favicon
│   └── icons.svg           # Icon sprites
└── src/                    # Source application code
    ├── App.css             # Tailwind layers, Google Fonts imports, scrollbar utilities
    ├── App.jsx             # Main application component (~560 lines of React logic & UI)
    ├── index.css           # Global CSS variables (light/dark mode palette) and root layout
    ├── main.jsx            # React root mount script wrapped in StrictMode
    ├── assets/             # Visual image assets (hero.png, react.svg, vite.svg)
    └── lib/                # External service wrappers & client instances
        ├── gemini.js       # Search engine logic & Gemini API fallback runner
        └── supabase.js     # Supabase client initializer
```

---

## 3. Detailed Breakdown of All Features

### 3.1 Live AI Tool Discovery (`searchWithAnakrino`)
- **Web Grounding via Google Search:** Uses `@google/generative-ai` with `googleSearch` tool enabled so the model queries the live internet rather than relying solely on static training data.
- **Strict JSON Response Enforcement:** Prompts Gemini to return a structured JSON array containing `name`, `tagline`, `description`, `pricing`, `category`, `pros`, `cons`, and `url`.
- **Model Fallback Chain:** Implements an automated fallback retry loop across multiple model identifiers if the primary model fails.

### 3.2 Project Architect / Workflow Generator
- Toggleable mode on the main search bar (`Find Tools` vs `Plan Project`).
- Prompts the engine to construct a 3-step sequential stack of AI tools required to accomplish complex project goals.
- Displays step numbers on card overlays (`Step 1`, `Step 2`, `Step 3`).

### 3.3 Dynamic 3D Interactive UI & Aesthetics
- **Card3D Component:** Calculates mouse position over cards using Framer Motion springs (`useSpring`, `useTransform`) to produce a 3D tilt effect (`rotateX`, `rotateY`) and dynamic radial spotlight highlighting.
- **Button3D Component:** Provides tactile push-down motion with multi-layered inset shadows (`shadow-[0_8px_0_...]`) and gradient specular highlights.
- **Generative Interactive Mesh Canvas:** `InteractiveMeshBackground` renders multi-layered radial orb glows on HTML5 canvas with sinusoidal movement (`Math.sin`, `Math.cos`). Color palettes dynamically shift based on selected tool category (`default`, `coding`, `design`, `video`).

### 3.4 Floating AI Copilot Assistant
- A floating chat window at the bottom-right corner powered by `gemini-2.5-flash`.
- Retains chat history in state (`chatMessages`) and sends full context back-and-forth.
- Automatically scrolls to the newest message on submission.

### 3.5 Taxonomy & Category Browsing
- Sidebar navigation with preset category filters:
  - **Discover All** (`all`)
  - **Coding & Dev** (`coding`)
  - **Image Generators** (`design`)
  - **Video Creation** (`video`)
  - **Writing & SEO** (`writing`)
  - **Audio & Music** (`audio`)
  - **AI Agents** (`agents`)
  - **Business Tools** (`business`)
- Triggers targeted Gemini queries upon selection.

### 3.6 User Auth & Supabase Cloud Bookmarks
- **Google OAuth Login:** Integrates `supabase.auth.signInWithOAuth({ provider: 'google' })`.
- **Database Synchronization:** Saves tools into a `tools` table (upserted by URL) and records user saves in a `bookmarks` junction table (`user_id`, `tool_id`).
- **Personal Collection View:** Displays saved bookmarks in a filtered view and updates bookmark badge counts in real time.

---

## 4. Security Vulnerabilities & Security Risks Audit

> [!CAUTION]
> **CRITICAL SECURITY RISK: API Credentials Leaked in Source Code (`.env`)**
> - **File:** `.env`
> - **Issue:** Active Google Gemini API Key (`VITE_GEMINI_API_KEY`) and Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are committed directly into the project `.env` file.
> - **Impact:** Any user or bot with access to the repo or frontend JS bundle can steal the Google Gemini API key and perform unauthorized API requests, leading to rate limit exhaustion or billing charges.

> [!WARNING]
> **HIGH SECURITY RISK: Direct Client-Side LLM Execution & Key Transmission in Query String**
> - **Files:** `src/lib/gemini.js` & `src/App.jsx` (Lines 278–283)
> - **Issue:** 
>   1. `gemini.js` executes Gemini API calls directly inside browser space using client-side environment variables.
>   2. Copilot in `App.jsx` makes direct `fetch` requests to `https://generativelanguage.googleapis.com/...:generateContent?key=${envApiKey}` where the API key is passed in the URL query string.
> - **Impact:** Passing API keys in query parameters exposes them to browser history logs, server access logs, network proxies, and HTTP Referer headers.

> [!WARNING]
> **MODERATE SECURITY RISK: Unsanitized External URL Injection (XSS)**
> - **File:** `src/App.jsx` (Line 504)
> - **Issue:** `<a href={selectedTool.url || '#'} target="_blank" rel="noopener noreferrer">` renders URLs returned directly by the AI model without sanitization or protocol validation (e.g. checking for `https://`).
> - **Impact:** If an attacker manipulates prompt injection or Gemini returns a malicious URL payload (such as `javascript:alert(document.cookie)`), clicking "Visit Website" can trigger Cross-Site Scripting (XSS).

---

## 5. Bugs, Logic Errors & Edge Cases

### 5.1 Invalid Gemini Model Identifiers (Fallback Chain Failure)
- **File:** `src/lib/gemini.js` (Lines 6–10)
- **Code:**
  ```javascript
  const fallbackModels = [
    "gemini-3.5-flash",       
    "gemini-3.1-flash-lite",  
    "gemini-2.5-flash"        
  ];
  ```
- **Bug:** `gemini-3.5-flash` and `gemini-3.1-flash-lite` do not exist in the official Google Gemini API catalog. Calling `genAI.getGenerativeModel()` with non-existent model names causes immediate HTTP 404 / model error failures, rendering the first two fallback attempts useless and delaying response times.

### 5.2 Fragile JSON Parsing in `searchWithAnakrino`
- **File:** `src/lib/gemini.js` (Lines 57–59)
- **Code:**
  ```javascript
  textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
  const toolData = JSON.parse(textResponse);
  ```
- **Bug:** If Gemini returns conversational introductory text before the JSON block or includes trailing commentary after the closing markdown backticks, string replacement will leave invalid JSON, causing `JSON.parse` to throw a fatal error.

### 5.3 Potential Null Pointer Exception in `fetchUserBookmarks`
- **File:** `src/App.jsx` (Lines 201–205)
- **Code:**
  ```javascript
  const fetchUserBookmarks = async (userId) => {
    if (!supabase) return;
    const { data } = await supabase.from('bookmarks').select(`tool_id, tools(url, *)`).eq('user_id', userId);
    if (data) { 
      setUserBookmarks(new Set(data.map(b => b.tools.url))); 
      setBookmarkedToolsData(data.map(b => b.tools)); 
    }
  };
  ```
- **Bug:** If a record in the `bookmarks` table references a deleted or null `tools` record, `b.tools` will be `null`. Accessing `b.tools.url` will cause an unhandled `TypeError: Cannot read properties of null (reading 'url')` crash in React.

### 5.4 Data Structure Mismatch on `pros` / `cons` Rendering
- **File:** `src/App.jsx` (Lines 485, 490)
- **Code:**
  ```javascript
  {(selectedTool.pros || [...]).map((pro, i) => ...)}
  ```
- **Bug:** If Gemini returns `pros` or `cons` as a string instead of an array, default fallback will not trigger (since a string is truthy), and calling `.map()` on a string or object will throw a runtime `TypeError`.

### 5.5 Missing HTML Title & Unused Template Assets
- **File:** `index.html` (Line 7) & `README.md`
- **Issue:** `index.html` retains the generic title `<title>anakrino-engine</title>` instead of an application-specific title. `README.md` is unedited standard Vite template boilerplate.

---

## 6. Recommendations & Remediation Plan

1. **Secure API Keys & Implement Backend Proxy:**
   - Remove hardcoded keys from `.env`.
   - Create a lightweight server or Supabase Edge Function to make LLM requests securely without exposing Gemini keys to the client.
2. **Fix Model Identifier Catalog:**
   - Update `fallbackModels` in `gemini.js` to valid available model names (e.g. `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`).
3. **Enhance JSON Parsing Robustness:**
   - Implement regex extraction to find JSON boundaries: `textResponse.match(/\[[\s\S]*\]/)?.[0]`.
4. **Add URL Sanitization & Null Guards:**
   - Validate URLs to start with `http://` or `https://` before rendering external links.
   - Add optional chaining in `fetchUserBookmarks` (`b.tools?.url`) and array checks (`Array.isArray(tool.pros)`).

---
*End of Report for Anakrino Engine.*
