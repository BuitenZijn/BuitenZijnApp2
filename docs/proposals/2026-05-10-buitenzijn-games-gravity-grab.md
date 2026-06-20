# Proposal: BuitenZijn Games (Gravity Grab) via Raspberry Pi Control

Date: 2026-05-10
Status: Draft (no implementation yet)
Owner: BuitenZijn App

## 1. Goal

Add a new section called BuitenZijn Games at the same activity level as Lijndansen, ELLA, Prono, etc.

Inside this section, each game is a card. First game: Gravity Grab.

For Gravity Grab, the mobile app should:

- See a live view of what the Raspberry Pi game display is showing
- Send button input from the app to the Raspberry Pi game

## 2. Scope

In scope for this proposal:

- Product structure for a new games section
- Technical architecture for live video + remote controls
- Security and access model
- Rollout in phases
- Concrete repository touchpoints (without coding yet)

Out of scope for this proposal:

- Final UI implementation
- Production deployment scripts
- Hardware wiring changes

## 3. Recommended architecture

Recommendation: Hybrid architecture

- Video stream: Raspberry Pi to app with WebRTC (low latency, best for game feedback)
- Control channel: App to backend (Convex) and then to Pi over secure WebSocket or MQTT
- Session and authorization: Convex

Why this approach:

- WebRTC gives much lower latency than periodic snapshots or HLS
- Backend-mediated commands avoid exposing Raspberry Pi directly to the internet
- Convex already exists in your stack for auth and business logic

### 3.1 High-level flow

1. User opens Activities and taps BuitenZijn Games
2. User taps Gravity Grab card
3. App requests a short-lived game session token from Convex
4. App starts WebRTC signaling flow (through backend signaling endpoint)
5. Pi starts sending live video stream
6. App renders stream and shows control buttons
7. Button presses are sent as signed commands to backend
8. Backend forwards validated commands to Pi game process
9. Pi returns state acknowledgements (optional but recommended)

## 4. System components

### 4.1 Mobile app (React Native)

Responsibilities:

- New BuitenZijn Games screen (list of game cards)
- Gravity Grab controller screen
- Render live stream
- Send control events: left, right, jump, grab, pause, restart
- Display connection status and fallback states

Suggested libraries:

- react-native-webrtc (video stream)
- Existing Convex client for auth/session actions

### 4.2 Backend (Convex + small signaling/bridge service)

Responsibilities:

- Authorize who may control a game session
- Create short-lived control session tokens
- Log session start and stop
- Rate-limit and validate control commands
- Forward commands to Pi bridge

Note:

- Convex is great for auth, session metadata, and command policy
- For real-time media signaling transport, add a tiny companion service if needed (Node/Fastify or similar)

### 4.3 Raspberry Pi side

Responsibilities:

- Run Gravity Grab Python game process
- Capture display output and publish as WebRTC video track
- Subscribe to incoming control commands
- Translate commands into game input events
- Report health and current game status

Implementation options on Pi:

- Python service for game I/O bridge
- GStreamer or ffmpeg-based capture pipeline feeding WebRTC stack
- Command ingestion via WebSocket or MQTT client

## 5. Networking and latency targets

Target latency:

- Video end-to-end: 100-300 ms
- Control roundtrip: under 150 ms preferred

Network assumptions:

- Local Wi-Fi in event location is primary path
- Optional remote mode through internet relay later

Connectivity strategy:

- Start with same-network mode for fastest MVP
- Add TURN relay only if NAT traversal is required for external access

## 6. Security model

Minimum controls:

- Authenticated app users only
- Role-based permission for Games access (for example admin or games role)
- One active controller per game session (avoid command conflicts)
- Signed, short-lived session tokens
- Command whitelist only (no arbitrary shell command execution)
- Session timeout and forced disconnect

Audit trail:

- Record who started session, command counts, and end reason

## 7. Product structure in current repo

This is where the proposal maps into your current project structure.

Web app touchpoints:

- Add card in Activities overview: src/app/activiteiten/page.tsx
- Add route group for games: src/app/activiteiten/games
- Add Gravity Grab page: src/app/activiteiten/games/gravity-grab/page.tsx
- Optional navbar dropdown entry: src/components/layout/Navbar.tsx

Mobile app touchpoints:

- Add card in mobile activities list: mobile/src/screens/main/ActivitiesScreen.tsx
- Add stack routes in navigator: mobile/src/navigation/MainNavigator.tsx
- Add screens:
  - mobile/src/screens/main/GamesScreen.tsx
  - mobile/src/screens/main/GravityGrabScreen.tsx

Backend touchpoints:

- Extend Convex schema with game session and command logs: convex/schema.ts
- New Convex functions for session lifecycle and command validation:
  - convex/games.ts
  - convex/gravityGrab.ts
- Optional HTTP signaling endpoints if needed: convex/http.ts

## 8. Data model proposal

Add new tables/entities:

1. game_devices

- name
- gameKey (example: gravity-grab)
- location
- status (online, offline, busy)
- lastHeartbeatAt

2. game_sessions

- gameKey
- deviceId
- startedByUserId
- startedAt
- endedAt
- status (active, ended, timeout)
- sessionTokenHash

3. game_commands

- sessionId
- userId
- command
- sentAt
- ackAt
- success

4. game_access_policies

- gameKey
- allowedRoles
- allowRemote

## 9. Command contract for Gravity Grab

Canonical commands:

- move_left_down
- move_left_up
- move_right_down
- move_right_up
- jump
- grab
- pause
- restart

Rules:

- Reject unknown commands
- Per-user rate limit (example: 30 messages/second burst-controlled)
- Deduplicate repeated instant taps where useful

## 10. UX proposal for Gravity Grab screen

Main sections:

- Live stream panel (top)
- Connection and ping badge
- Control pad (left/right)
- Action buttons (jump/grab/pause/restart)
- Session owner indicator

Failure states:

- Pi offline
- Session already controlled by someone else
- Stream unavailable while controls remain available
- Reconnect flow with one tap

## 11. Phased implementation plan

Phase 1: Foundations

- Add BuitenZijn Games in Activities (web + mobile navigation)
- Add Gravity Grab card and placeholder screen
- Add role-based access gates

Phase 2: Control-only MVP

- Build Pi command bridge
- Add secure command API in backend
- Validate button control from app to game

Phase 3: Live video MVP

- Add WebRTC signaling and stream rendering
- Optimize latency and reconnection behavior

Phase 4: Hardening

- Add metrics, logs, and session moderation
- Add lock takeover rules and admin override
- Add network resilience tests

## 12. Risks and mitigations

Risk: WebRTC complexity on mobile
Mitigation: Keep signaling minimal and test on target devices early

Risk: Input lag over weak Wi-Fi
Mitigation: Co-locate Pi and players on dedicated SSID; throttle video bitrate

Risk: Unauthorized control attempts
Mitigation: Short-lived tokens, strict role checks, one-controller lock

Risk: Pi process crashes
Mitigation: watchdog service and auto-restart for game bridge

## 13. Minimal acceptance criteria

1. BuitenZijn Games appears in Activities (web and mobile)
   --> only in admin section of the web app
2. Gravity Grab card opens dedicated controller screen
3. Authenticated authorized user can start a session
4. Live stream is visible with acceptable latency
5. On-screen controls affect game in near real-time
6. Session ends cleanly and logs are stored

## 14. Open decisions

1. Should Gravity Grab be controllable only on local network, or also remotely?
   local network for now
2. Which roles may control games initially (admin only, or broader)?
   add a roll - buitenzijn games --> admin + buitenzijn_games have access
3. Do you want one active controller only, or spectator mode + host control?
4. Do you want audio from the Pi stream in phase 1 or later?
   later

## 15. Next step after approval

If this proposal is approved, next step is to create a technical implementation checklist with exact API contracts and screen-level task breakdown for:

- Pi bridge service
- Convex session and command layer
- Mobile Gravity Grab controller and stream screen
