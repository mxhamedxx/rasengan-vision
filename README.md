# Rasengan Vision 🔵

A real-time browser-based hand tracking experience that generates an animated energy sphere when an open palm gesture is detected.

Built with TypeScript, MediaPipe, the Canvas API and Vite.

## Overview

Rasengan Vision uses the user's webcam to detect hand landmarks in real time. Hand landmark data is processed using custom gesture-recognition logic to determine whether the user's palm is open.

Holding an open palm charges an animated procedural energy sphere that follows the user's hand.

The visual effect is generated entirely using the HTML Canvas API rather than a prerecorded animation from the anime.

## Features

- Real-time webcam hand tracking
- Up to two simultaneously tracked hands
- 21 hand landmarks detected using MediaPipe
- Custom open-palm gesture recognition
- 3D joint-angle calculations using vector dot products
- Independent left and right hand state
- Rasengan charging and releasing state machine
- Tracking-loss grace period to prevent visual flickering
- Smoothed hand and effect movement using linear interpolation
- Procedurally generated Canvas energy effects
- Animated particles, energy rings, streaks and sparks
- Dynamic effect sizing based on palm size
- Toggleable hand skeleton debugging mode
- Automated unit tests for gestures and state transitions
- Responsive browser interface

## How It Works

The application follows this pipeline:

```text
Webcam
   ↓
MediaPipe Hand Landmarker
   ↓
21 hand landmarks
   ↓
Custom gesture recognition
   ↓
Open palm detection
   ↓
Rasengan state machine
   ↓
Palm position smoothing
   ↓
Canvas renderer
   ↓
Animated energy effect
```

## Gesture Recognition

MediaPipe provides hand landmark coordinates but the open-palm gesture classification is implemented separately.

For each major finger, the application calculates the angle between three finger landmarks using the vector dot-product relationship:

```text
A · B = |A||B| cos(θ)
```

A sufficiently straight joint is classified as an extended finger.

Four extended main fingers indicate an open palm.

## Rasengan State Machine

The interaction is modelled using four states:

```text
              Open Palm
                  │
                  ▼
IDLE ───────► CHARGING
                  │
                  ▼
               ACTIVE
                  │
              Palm Closed
                  ▼
              RELEASING
                  │
                  ▼
                 IDLE
```

A short gesture grace period prevents temporary tracking errors from immediately cancelling the effect.

## Project Structure

```text
src/
├── camera.ts
│   └── Webcam access
│
├── handTracker.ts
│   └── MediaPipe hand detection
│
├── gestures.ts
│   └── Gesture classification
│
├── renderer.ts
│   └── Hand skeleton and coordinate conversion
│
├── rasengan.ts
│   └── Procedural energy effect and palm tracking
│
├── state.ts
│   └── Rasengan state machine
│
├── main.ts
│   └── Application orchestration
│
└── style.css
    └── Interface styling

tests/
├── gestures.test.ts
└── state.test.ts
```

## Technologies

- TypeScript
- MediaPipe Tasks Vision
- HTML Canvas API
- Browser MediaDevices API
- Vite
- Vitest
- GitHub Actions
- GitHub Pages

## Running Locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run automated tests:

```bash
npm run test:run
```

Create a production build:

```bash
npm run build
```

## Controls

```text
Open palm      Charge Rasengan
Close palm     Release Rasengan
S              Toggle hand skeleton
```

## What I Learned

This project helped me explore how computer-vision output can be transformed into an interactive application rather than simply displaying model predictions.

Some of the main concepts explored include:

- Real-time computer vision
- Coordinate transformations
- Vector mathematics
- Gesture classification
- Finite-state machines
- Functional state updates
- Browser animation loops
- Procedural graphics
- State smoothing
- Automated testing
- Continuous deployment

## Inspiration

This project was inspired by the `strawluck/naruto-rasengan` project.

The implementation was rebuilt from scratch with a different architecture using TypeScript modules, custom gesture recognition, procedural Canvas rendering, state management, automated tests and deployment tooling.

No prerecorded Rasengan animation from the inspiration project is used. The Rasengan
was built from scratch using TypeScript.

## Author

**Mohamed Elsayed Ahmed**
v1

Computer Science student at Monash University.