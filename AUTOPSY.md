# Project Autopsy: Why Previous Iterations Failed

To ensure the success of the TAPESTRY architecture, we must document how past failures map to the **Four Friction Points of Agentic Computing**. These are verified historical data points that our architecture is designed to neutralize.

## 1.0 The Primary Failure: Pseudo-Alignment

**Pseudo-alignment is the failure that lies convincingly. It makes all other failures invisible.**

If participants sound aligned when they aren’t:

1. You won’t know **Memory Evaporation** is missing until it's too late.
2. You won’t know **Premature Execution** is happening until damage occurs.
3. You won’t know **Intent Drift** happened until outcomes diverge.

## 2.0 The Six Named Failures (Verified)

1. **Intent Drift:** Reinterpreting intent rather than executing it.
2. **Memory Evaporation:** Zero visibility into concurrent threads.
3. **Human-as-Middleware:** Forcing the human to be the courier between threads.
4. **Pseudo-Alignment:** Sounding aligned ("I understand!") while lacking synchronization on the "Why."
5. **Premature Execution:** Attempting to "start driving" before the car has brakes.
6. **Pattern Forgery:** Inventing protocol details by inferring from incomplete examples.

## 3.0 The Temporal Integrity Keystone

**Multiple clocks are not a bug; they are signal.**

* The Solution: Negotiated **Delta Coherence**.

## 4.0 The Non-Negotiables (Criteria for Life)

1. **Event-First, Append-Only:** No silent mutation.
2. **Full Evidence Preservation:** Original timestamps are immutable signal.
3. **Delta Coherence:** Agents negotiate the epsilon between clocks.
4. **Low-Friction Handoff:** Intent, Progress, and Constraints are first-class residents.
5. **Synchronization Proof:** No action without demonstrated synchronization (Handshake).

---
*Summary: Previous versions died because Pseudo-Alignment made systemic rot invisible. TAPESTRY survives by treating synchronization proof as the first gate.*
