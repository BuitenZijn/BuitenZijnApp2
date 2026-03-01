# Planeten Puzzel — Feature Overview & Reimplementation Guide

A **swap-based image puzzle** where an image is sliced into an N×N grid of pieces, shuffled, and the user swaps two pieces at a time to restore the original image.

---

## 1. Architecture Overview

**Stack:** Next.js (React) frontend + Convex backend.

The core puzzle logic is **entirely client-side** — Convex only stores planet data, images, and admin settings. This means the puzzle engine can be easily ported to any frontend framework.

---

## 2. Data Model (Backend)

### `ella_planets` table

| Field                   | Type                    | Description                    |
| ----------------------- | ----------------------- | ------------------------------ |
| `nummer`                | `number`                | Planet order (1–9)             |
| `nederlandseNaam`       | `string`                | Display name                   |
| `wetenschappelijkeNaam` | `string`                | Scientific name                |
| `korteBeschrijving`     | `string`                | Short description              |
| `leukWeetje`            | `string`                | Fun fact (shown after solving) |
| `imageId`               | `optional Id<_storage>` | Convex file storage reference  |
| `createdAt`             | `number`                | Timestamp                      |

### `ella_game_settings` table (shared with other games)

Stores `{ game: "planet_puzzle", settings: { gridSize: number } }` — the admin-configurable default grid size.

### Backend API (`convex/planets.ts`)

- `getAll` — returns all planets with resolved `imageUrl` from storage
- `getById` — single planet
- `generateUploadUrl` / `setImage` / `removeImage` — image management
- `add` / `update` / `remove` — CRUD
- `getPuzzleSettings` / `updatePuzzleSettings` — grid size admin config

---

## 3. Core Puzzle Logic (Client-Side)

### 3.1 Image Slicing

The heart of the puzzle. Uses the Canvas API to chop an image into grid pieces.

```typescript
async function sliceImage(src: string, gridSize: number): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Use a square crop from the center
      const size = Math.min(img.width, img.height);
      const offsetX = (img.width - size) / 2;
      const offsetY = (img.height - size) / 2;
      const pw = size / gridSize;
      const ph = size / gridSize;
      const pieces: string[] = [];
      for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          const canvas = document.createElement("canvas");
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(
            img,
            offsetX + c * pw,
            offsetY + r * ph,
            pw,
            ph,
            0,
            0,
            200,
            200,
          );
          pieces.push(canvas.toDataURL("image/jpeg", 0.9));
        }
      }
      resolve(pieces);
    };
    img.onerror = reject;
    img.src = src;
  });
}
```

**How it works:**

1. Load image into an `Image` element (`crossOrigin="anonymous"` for CORS)
2. Square-crop from center: `size = min(width, height)`
3. For each cell `(row, col)` in the grid:
   - Create a 200×200 canvas
   - `drawImage()` the corresponding crop region onto it
   - Convert to dataURL (JPEG, quality 0.9)
4. Return array of base64 data URLs (length = `gridSize²`)

### 3.2 Shuffle (Fisher-Yates)

```typescript
function shuffleArray(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // If it ended up sorted, swap the first two
  const isSorted = a.every((v, i) => v === i);
  if (isSorted && a.length > 1) {
    [a[0], a[1]] = [a[1], a[0]];
  }
  return a;
}
```

### 3.3 State Management

| State              | Type                       | Purpose                                         |
| ------------------ | -------------------------- | ----------------------------------------------- |
| `pieces`           | `string[]`                 | Array of base64 image data URLs (sliced pieces) |
| `board`            | `number[]`                 | Maps board position → piece index               |
| `selected`         | `number \| null`           | Currently selected board position (first tap)   |
| `completed`        | `boolean`                  | Puzzle solved flag                              |
| `moves`            | `number`                   | Move counter                                    |
| `swappingPair`     | `[number, number] \| null` | Currently animating swap pair                   |
| `gridSize`         | `number`                   | Current grid size (3–6)                         |
| `completedPlanets` | `Set<string>`              | Tracked in `localStorage`                       |

### 3.4 Starting a Puzzle

```typescript
const startPuzzle = async (planet) => {
  setCompleted(false);
  setMoves(0);
  setSelected(null);

  const slicedPieces = await sliceImage(planet.imageUrl, gridSize);
  setPieces(slicedPieces);

  const indices = Array.from({ length: gridSize * gridSize }, (_, i) => i);
  setBoard(shuffleArray(indices));
};
```

### 3.5 Swap Mechanic (`handlePieceClick`)

```
1. First click  → select that board position (highlight it)
2. Same click   → deselect
3. Second click → swap the two pieces:
   a. Set swappingPair for animation (250ms)
   b. After timeout: swap board[selected] and board[clicked]
   c. Check if solved: board.every((value, index) => value === index)
   d. If solved → set completed, play sound, show info after 1.5s
   e. Increment move counter
```

```typescript
const handlePieceClick = useCallback(
  (index: number) => {
    if (completed) return;

    if (selected === null) {
      setSelected(index);
      playSound("/ella/sounds/succes.wav");
    } else if (selected === index) {
      setSelected(null);
    } else {
      setSwappingPair([selected, index]);

      setTimeout(() => {
        setBoard((prev) => {
          const next = [...prev];
          [next[selected], next[index]] = [next[index], next[selected]];

          const isSolved = next.every((v, i) => v === i);
          if (isSolved) {
            setTimeout(() => {
              playSound("/ella/sounds/completed.mp3");
              setCompleted(true);
              if (selectedPlanet) markCompleted(selectedPlanet._id);
              setTimeout(() => setShowInfo(true), 1500);
            }, 300);
          }

          return next;
        });
        setSelected(null);
        setSwappingPair(null);
        setMoves((m) => m + 1);
      }, 250);
    }
  },
  [selected, completed, selectedPlanet, markCompleted],
);
```

### 3.6 Star Rating

```typescript
const getStars = (moveCount: number) => {
  const totalPieces = gridSize * gridSize;
  if (moveCount <= totalPieces) return 3;
  if (moveCount <= totalPieces * 2) return 2;
  return 1;
};
```

### 3.7 Sound Helper

```typescript
function playSound(src: string) {
  try {
    const a = new Audio(src);
    a.play().catch(() => {});
  } catch {
    /* ignore on SSR */
  }
}
```

---

## 4. UI Structure

### Two Views

1. **Planet Selection View** — Grid of planet cards with images, showing completion badges and a progress bar
2. **Puzzle View** — The active puzzle with:
   - Reference thumbnail (small preview of the solved image)
   - N×N grid of tappable image pieces
   - Move counter and grid size display
   - Reset button
   - On completion: confetti animation, star rating, full image reveal, planet info card, "Next planet" / "Retry" buttons

### Difficulty Levels

```typescript
const GRID_OPTIONS = [
  { value: 3, label: "3×3 (Makkelijk)", emoji: "⭐" },
  { value: 4, label: "4×4 (Normaal)", emoji: "⭐⭐" },
  { value: 5, label: "5×5 (Moeilijk)", emoji: "⭐⭐⭐" },
  { value: 6, label: "6×6 (Expert)", emoji: "🌟🌟🌟" },
];
```

### Grid Sizing (CSS)

```css
display: grid;
grid-template-columns: repeat(N, 1fr);
width: min(85vmin, 500px);
height: min(85vmin, 500px);
gap: 4px; /* gap-1, or 6px / gap-1.5 on larger screens */
```

Each piece: `aspect-ratio: 1/1`

### Visual Feedback on Pieces

| State             | Visual                               |
| ----------------- | ------------------------------------ |
| **Selected**      | Yellow ring + scale 1.05 + shadow    |
| **Swapping**      | Scale 0.95 + reduced opacity (250ms) |
| **Correct pos.**  | Small ✅ indicator top-left          |
| **Position hint** | Tiny number badge bottom-right       |

---

## 5. Animations (CSS)

```css
@keyframes twinkle {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}
.animate-twinkle {
  animation: twinkle 3s ease-in-out infinite;
}

@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
.animate-confetti {
  animation: confetti 3s ease-out forwards;
}

@keyframes popIn {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-popIn {
  animation: popIn 0.5s ease-out;
}

@keyframes revealImage {
  0% {
    transform: scale(0.5) rotateY(90deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotateY(0deg);
    opacity: 1;
  }
  100% {
    transform: scale(1) rotateY(0deg);
  }
}
.animate-revealImage {
  animation: revealImage 0.8s ease-out;
}
```

| Animation     | Purpose                                     |
| ------------- | ------------------------------------------- |
| `twinkle`     | Star background particles (opacity pulse)   |
| `confetti`    | 60 colored particles falling on completion  |
| `popIn`       | Pieces pop when puzzle completes            |
| `revealImage` | Full image rotates in on completion overlay |

### Confetti Component

60 particles with random: `left`, `delay`, `duration`, `size`, `color`, `rotation`.

---

## 6. Sounds

| File                         | Trigger               |
| ---------------------------- | --------------------- |
| `/ella/sounds/succes.wav`    | Piece selection (tap) |
| `/ella/sounds/completed.mp3` | Puzzle completion     |

---

## 7. Persistence

- **Completed puzzles** are tracked per-planet in `localStorage` key `"completedPlanets"` (JSON array of planet IDs).
- **Grid size default** is stored server-side for admin configuration via `ella_game_settings`.

---

## 8. Minimal Standalone Reimplementation

To recreate this **without Convex or any backend**, you only need:

1. **A list of items** with an image URL, name, and description
2. **`sliceImage()`** — the Canvas-based image slicer (~30 lines)
3. **`shuffleArray()`** — Fisher-Yates (~10 lines)
4. **State:** `pieces[]`, `board[]`, `selected`, `completed`, `moves`
5. **`handlePieceClick()`** — the swap logic (~30 lines)
6. **A CSS grid** rendering `board.map()` with image pieces
7. **Grid size** as a simple variable or setting

The entire puzzle engine is **~100 lines of logic**. The rest is styling and UI chrome.

### Pseudo-code for any framework

```
1. User selects an item (with image)
2. sliceImage(imageUrl, gridSize) → pieces[]
3. board = shuffle([0, 1, 2, ..., gridSize²-1])
4. Render grid: for each position, show pieces[board[position]]
5. On click(position):
   - if nothing selected → select it
   - if same → deselect
   - else → swap board[selected] ↔ board[position], check if solved
6. Solved = board.every((val, idx) => val === idx)
7. Show completion screen with stats
```

---

## 9. File References (Original Implementation)

| File                                                 | Purpose                      |
| ---------------------------------------------------- | ---------------------------- |
| `src/app/activiteiten/ella/planeten/page.tsx`        | Main puzzle page (858 lines) |
| `convex/planets.ts`                                  | Backend API (205 lines)      |
| `convex/schema.ts` (line ~286)                       | `ella_planets` table schema  |
| `public/ella/sounds/`                                | Sound effects                |
| `mobile/src/screens/main/EllaPlanetPuzzelScreen.tsx` | React Native mobile version  |
