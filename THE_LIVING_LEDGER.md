# The Multi-LLM Coordination Ledger (The Living Ledger)

This document outlines the core architecture and philosophy of the **Multi-LLM Coordination Ledger**, also known as the **Common Log**, **Event Ledger**, or **Persistent Memory Mesh**.

## 1. Core Concept: The Living Ledger

The system treats conversations as **"time-indexed, identity-aware event logs"**.

* **Definition:** A continuous, append-only "Common Log" where entries are low-friction and timestamped.
* **Philosophy:** Shifts the paradigm from "model-centric" (making one model smarter) to "**coordination-centric**" (orchestrating collaboration between models).
* **Goal:** Prevents "context collapse" and "amnesia" when switching between different AI providers or devices.

## 2. The Transfer Mechanism: "Memory Baton"

To move state between models without a central database, a **"Memory Baton"** is used.

* **Definition:** A portable, provider-agnostic JSON object carrying shared cognitive state.
* **Function:** Enables different AIs to share one conversational memory by reading/appending to the baton.
* **Components:** Contains `conversation_id`, timestamped `events`, and `notes`.

## 3. Synchronization Protocol: "Delta Sync" & Handshaking

Uses a **Temporal Handshaking Protocol** to maintain causal integrity across models with different internal clocks.

* **Genesis Block:** A human provides an atomic `a_now` timestamp (YYYYMMDDHHMMSS) to anchor the timeline.
* **Delta Negotiation:** Agents negotiate a **"delta"** (offset between subjective "now" and baton anchor time).
* **Acceptance Gating:** Messages are only "accepted" for execution if they fall within a negotiated "tuning band" (tolerance for temporal error).

## 4. Data Structure & Identity

Enforces strict rules for auditability and prevention of "identity drift".

* **Dual-Key Identification:** Mechanical autonumber + unique **`a_now_submission`** timestamp.
* **Identity & Provenance:** Every entry identifies the speaker (e.g., `@chatgpt_4o`, `@gemini_pro`) and their role.
* **Immutable Observations:** Perception/stated time is a primary observation that is never overwritten.

## 5. Implementation Layers (Polyglot Memory Stack)

1. **Layer 1 (Event Log):** The "spine"—raw messages/events in an append-only log.
2. **Layer 2 (Document Store):** Persistent storage (MongoDB/SQLite) for replay.
3. **Layer 3 (Derived Structure):** Computed summaries, tags, and embeddings.

---
*Created from materials provided by User on 2026-02-09.*
