# Luna — Women's Wellness Tracker

## Setup (3 commands)

```bash
npm create vite@latest luna-app -- --template react
cd luna-app
npm install
```

## Where to put the files

After running those 3 commands, your folder will look like this.
Replace/add files exactly as shown:

```
luna-app/
├── index.html              ← leave as-is (Vite generates this)
├── package.json            ← leave as-is
├── vite.config.js          ← leave as-is
│
└── src/
    ├── main.jsx            ← REPLACE with our main.jsx
    ├── App.jsx             ← REPLACE with our App.jsx
    ├── App.css             ← REPLACE with our App.css
    │
    ├── pages/
    │   ├── HomePage.jsx    ← ADD
    │   ├── HomePage.css    ← ADD
    │   ├── TrackTodayPage.jsx  ← ADD
    │   ├── TrackTodayPage.css  ← ADD
    │   ├── AdvicePage.jsx  ← ADD
    │   └── AdvicePage.css  ← ADD
    │
    ├── components/
    │   ├── CalendarView.jsx    ← ADD
    │   ├── CalendarView.css    ← ADD
    │   ├── HormonesView.jsx    ← ADD
    │   └── HormonesView.css    ← ADD
    │
    └── utils/              ← CREATE this folder, add all 5 files
        ├── dataModels.js
        ├── cycleCalculator.js
        ├── storageLayer.js
        ├── labParser.js
        └── aiInsights.js
```

You need to manually create two folders that Vite doesn't make:
```bash
mkdir src/pages
mkdir src/components
mkdir src/utils
```

## Run it

```bash
npm run dev
```

Opens at http://localhost:5173

## Deploy to Vercel (for Devpost)

```bash
npm install -g vercel
vercel
```

Follow the prompts — it gives you a live URL in ~60 seconds.

## Wiring up the Claude API

The app runs fully with mock data right now. When you're ready to connect
the real AI and lab parser:

1. Create a `.env` file in the root:
   ```
   VITE_ANTHROPIC_KEY=sk-ant-your-key-here
   ```

2. In `HormonesView.jsx`, uncomment the labParser import and replace the mock.

3. In `AdvicePage.jsx`, uncomment the getInsights import and replace the mock.

The comments marked `── WIRE UP:` show exactly where to make these changes.
