# 🎮 Life RPG

Life RPG is a full-stack gamified productivity platform that transforms everyday real-world tasks into RPG-style quests.

Instead of treating productivity like a checklist, Life RPG turns completed tasks into character progression through XP, levels, attributes, streaks, rewards, and an in-app economy.

The application combines productivity with RPG mechanics while keeping user data securely isolated to each account.

---

## ✨ Features

### 🔐 Authentication

- Secure user signup and login
- Email verification using OTP
- Resend verification OTP
- JWT-based authentication
- Forgot password flow
- Password reset using OTP
- Protected application routes
- User-specific data access

---

### ⚔️ Quest / Task System

Users can create and manage their own quests/tasks.

- Create tasks
- View tasks
- Update tasks
- Delete tasks
- Complete tasks
- Task categories
- Completion-based progression
- Historical completion records

Each user's tasks are isolated from other users.

---

### ⭐ XP & Level Progression

Completing quests awards XP to the character.

The level system uses a non-linear progression model where higher levels require progressively more XP.

This creates a sense of long-term progression rather than a simple linear level system.

---

### 💪 Character Attributes

Task categories contribute to different character attributes.

Examples include:

- Strength
- Intellect
- Discipline
- Vitality

Different task categories are mapped to appropriate character attributes.

For example:

- Coding → Intellect
- Gym → Strength
- Fitness → Vitality
- Learning → Intellect
- Planning → Discipline
- Discipline → Discipline

---

### 🔥 Streak System

The application tracks user activity streaks.

It supports:

- Current streak
- Longest streak
- Consecutive-day progression
- Streak reset after missed activity

This encourages users to maintain consistent progress.

---

### 🪙 Rewards & Economy

Completing quests also contributes to the in-app economy.

Users can earn currency and spend it on virtual rewards.

The reward system supports:

- Available rewards
- Reward purchasing
- Currency-based purchases
- Inventory ownership
- Duplicate-purchase prevention

Example rewards include:

- Focus Theme
- First Quest
- Streak Keeper
- XP Booster
- Lucky Charm

---

### 📜 Historical Completion Logs

Completed quests are recorded as historical completion entries.

The logs preserve information such as:

- Task
- Task title
- Category
- Completion time
- XP awarded
- Currency awarded
- Related attribute

This allows users to retain a history of their progression.

---

### 🏆 Global Dashboard & Leaderboard

The dashboard includes a global leaderboard.

Users can select different ranking metrics, including:

- XP
- Level
- Current Streak
- Longest Streak
- Strength
- Intellect
- Discipline
- Vitality

Leaderboard views support:

- Top 3
- Top 10
- Top 100

The current user's global rank is also available.

---

## 🛡️ Security

The backend is responsible for enforcing user ownership and progression rules.

Security measures include:

- JWT authentication
- Protected API routes
- User-specific database queries
- Password hashing
- Email verification
- OTP expiration
- Protected task operations
- Protected reward purchases
- Server-side progression handling
- User inventory ownership validation

Users cannot access or modify another user's tasks or character progression through normal API operations.

---

## 🏗️ Architecture

Life RPG follows a MERN-based full-stack architecture.

```text
                    ┌─────────────────────┐
                    │      User           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ React Frontend      │
                    │ Vite + Tailwind     │
                    │ Framer Motion       │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │ Backend API         │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
             ┌──────────────┐      ┌──────────────┐
             │ MongoDB      │      │ Email / OTP  │
             │ Database     │      │ Service      │
             └──────────────┘      └──────────────┘
