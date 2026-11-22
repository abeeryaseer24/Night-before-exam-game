# Night Before Exam · পরীক্ষার আগের রাত

It's **9:00 PM**. Your **Physics final** is at **9:00 AM**. You have read absolutely nothing.

A one-night survival game in the browser. Manage your time, energy and stress, fight through focus sessions, survive load shedding, decide whether to trust the leaked "suggestion" — and walk into the exam hall with something in your head.

## How to play

- You have **12 hours**. Every action costs time.
- **Study** a chapter in a 15-second focus session:
  - hold the page (or hold <kbd>Space</kbd>) to read
  - tap notifications away before they distract you
  - tap the **golden words** for bonus progress
  - splash water on your face when you start dozing off
- Low **energy** or high **stress** make studying less effective. Cha, noodles, naps and deep breaths help, but they cost time too.
- Random events: load shedding, Ammu calling you to dinner, a neighbour's holud night, mosquito attacks, fake (or real?) suggestions…
- In the exam, chapters you didn't study show up **scrambled**. Sleep before the exam to get more time per question.
- Answer with a click or keys <kbd>1</kbd>–<kbd>4</kbd>. Grades follow the A+ to F scale.

## Tech

Plain HTML, CSS and JavaScript. No build step, no dependencies. Sound effects are generated with the Web Audio API.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx serve .
```

## Deploy on Vercel

1. Import this repository on [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Other**. Leave the build command empty and keep the output directory as the project root.
3. Deploy.
