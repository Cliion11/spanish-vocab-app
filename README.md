# 轻·西语 / Spanish Vocab

A lightweight Spanish vocabulary learning website for Chinese learners.

Built with Next.js, React, TypeScript, and CSS.
Live site: https://cllion.xyz

## About

轻·西语 is a simple Spanish vocabulary learning tool designed for learners who want a cleaner and lighter way to memorize words.

It focuses on DELE A1 / A2 / B1 vocabulary practice, pronunciation, mistake review, daily random learning, and local progress tracking.

No account is required.
No app download is required.
Open the website and start learning.

## Features

* DELE A1 / A2 / B1 vocabulary levels
* Daily random word learning
* Spanish word cards with Chinese meanings and examples
* Web Speech API pronunciation support
* Three learning responses: 认识 / 模糊 / 不认识
* Mistake book
* Dedicated mistake review mode
* Learning streak tracking
* Check-in glass card after completing a session
* Settings page for daily goal, pronunciation, and data reset
* LocalStorage-based progress tracking
* Mobile-friendly glassmorphism interface
* PWA-ready app icon and manifest
* Basic SEO configuration with robots.txt and sitemap.xml

## Tech Stack

* Next.js
* React
* TypeScript
* CSS
* LocalStorage
* Web Speech API
* Vercel

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open locally:

```txt
http://localhost:3000
```

Build the project:

```bash
npm run build
```

## Live Demo

https://cllion.xyz

## Project Structure

```txt
app/
  page.tsx
  layout.tsx
  globals.css
  manifest.ts
  robots.ts
  sitemap.ts
  study/
    page.tsx
    [level]/
      page.tsx
  mistakes/
    page.tsx
  review/
    page.tsx
  settings/
    page.tsx

components/
  BottomNav.tsx

lib/
  words.ts

public/
  icon.svg
```

## Learning Data

The current vocabulary data includes A1, A2, and B1 level word lists designed for early-stage Spanish learners.

The word lists are organized around common beginner and intermediate topics such as greetings, family, food, travel, study, work, health, city life, and daily communication.

Future versions may include larger vocabulary sets, improved example sentences, audio enhancements, and more advanced review scheduling.

## Privacy

This app stores learning progress in the browser using LocalStorage.

There is currently no account system, no server database, and no cloud sync.

## License

MIT
