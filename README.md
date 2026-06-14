# Spanish Vocab App

An open-source Spanish vocabulary learning app built with Next.js, TypeScript, and Tailwind CSS.

This project is designed for learners who want a lightweight Spanish vocabulary trainer with local progress tracking, mistake review, pronunciation support, and spaced repetition.

## Features

- A1 / A2 / B1 vocabulary decks
- Study mode with Spanish words, Chinese meanings, examples, and pronunciation
- Web Speech API pronunciation support
- Four review ratings: Forgot, Hard, Good, Easy
- Simple spaced repetition scheduling
- Mistake book
- Dedicated mistake training mode
- LocalStorage-based progress tracking
- Data management page for backup and reset
- Responsive glassmorphism-style interface

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- pnpm

## Getting Started

Install dependencies:

    pnpm install

Start the development server:

    pnpm dev

Open:

    https://cllion.xyz

Build the project:

    pnpm build

## Project Structure

    app/
      page.tsx
      layout.tsx
      globals.css
      study/[level]/page.tsx
      mistakes/page.tsx
      mistakes/study/page.tsx
      settings/page.tsx

    data/
      a1Words.ts
      a2Words.ts
      b1Words.ts

## Data and Learning Notes

The current vocabulary data is a small demo dataset for development and testing.

Future versions may include larger vocabulary sets, CEFR-aligned decks, better example sentences, audio improvements, and a more advanced spaced repetition algorithm.

## Privacy

This app currently stores learning progress in the browser using LocalStorage.

No account system, server database, or cloud sync is included in the current version.

## License

MIT
