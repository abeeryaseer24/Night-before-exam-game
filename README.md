# Night Before Exam · পরীক্ষার আগের রাত

It's **9:00 PM**. Your exam is at **9:00 AM**. You have read absolutely nothing.

A one-night survival game in the browser. Manage your time, energy and stress, fight through focus sessions, survive load shedding, decide whether to trust the leaked "suggestion", and walk into the exam hall with something in your head.

## Pick your exam

| Level | Subject | Setting |
| --- | --- | --- |
| SSC | Physics | Home |
| HSC | Physics 1st Paper | Home |
| University · EEE | Electrical Circuits & Electronics | Hall room |
| University · CSE | Data Structures & Algorithms | Hall room |
| University · ME | Thermo, Fluids & Materials | Hall room |

Home nights bring Ammu calling you to dinner, Abbu checking in and a neighbour's holud. Hall nights bring a gaming roommate, tong invitations and the CR's fake "exam postponed" message.

## How to play

- You have **12 hours**. Every action costs time: study, past papers, YouTube at 2×, short notes, cha, noodles, naps, cold showers, roof walks, prayer, "just one" match, packing your bag…
- **Study** a chapter in a 15-second focus session:
  - hold the page (or hold <kbd>Space</kbd>) to read
  - tap notifications away before they distract you
  - tap the **golden words** for bonus progress
  - splash water on your face when you start dozing off
- Low **energy** or high **stress** make studying less effective. Cha, noodles, naps and deep breaths help, but they cost time too.
- Random events: load shedding, Ammu calling you to dinner, a neighbour's holud night, mosquito attacks, fake (or real?) suggestions…
- In the exam, chapters you studied let you **cross out** wrong answers. For chapters you skipped you get joke options and a whisper from the next bench (which may be lying).
- Then comes the written part: big diagrams, endless pages, fancy rephrasing, or a heartfelt note to the examiner.
- Answer with a click or keys <kbd>1</kbd>–<kbd>4</kbd>. SSC/HSC use the GPA 5 scale; university uses CGPA 4.

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
