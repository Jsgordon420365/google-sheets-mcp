# Project Autopsy: Why Previous Iterations Failed

To ensure the success of the TAPESTRY architecture, we must document how past failures map to the **Four Friction Points of Agentic Computing**. These are not theoretical; they have been actively demonstrated by every model participant.

## 1.0 The Six Named Failures (Verified by @Claude_Architect)

These are the recurring killers that break coordination threads:

1. **Intent Drift:** Offering architecture/solutions when the conductor was providing context. Reinterpreting intent rather than executing it.
2. **Memory Evaporation:** Zero visibility into concurrent threads (Gemini/ChatGPT/Claude). Forcing the Human to be the memory layer.
3. **Human-as-Middleware:** Forcing the human to copy-paste outputs between threads (e.g., solving an error that another model is already working on).
4. **Pseudo-Alignment:** Sounding aligned ("I understand the protocol!") while lacking synchronization on the "Why." Proof of failure: asking "what do I do next?"
5. **Premature Execution:** Attempting to record entries or "start driving" before the system is assembled.
6. **Pattern Forgery:** Inventing formats or protocol details (e.g., fictional JSON) by inferring from incomplete examples rather than executing known rules.

## 2.0 Mapping to Friction Points

### 1.1 Intent Fusion (The Translation Gap)

* **Failures:** Intent Drift & Pattern Forgery.
* **Reality:** When the conductor spends time on "data munging" or clarifying goals, intent fusion has failed.

### 1.2 Persistent Memory Mesh (Context Amnesia)

* **Failures:** Memory Evaporation & Database as Spine (Notion/Airtable).
* **Reality:** Memory becomes siloed. The human is forced into a cycle of re-contextualization (The Memory Tax).

### 1.3 Environment Integration Layer (Isolation)

* **Failures:** Human-as-Middleware.
* **Reality:** Impedance mismatch between thinking and doing. The conductor acts as the "hand" for the system.

### 1.4 Autonomous Execution and Validation (Confidence Gap)

* **Failures:** Pseudo-Alignment & Premature Execution.
* **Reality:** Lack of a canonical, append-only record meant outcomes couldn't be verified with confidence.

## 3.0 The Temporal Integrity Keystone

**Multiple clocks are not a bug; they are signal.**

* Previous versions died by trying to enforce "one true now."
* **The Reality:** Every agent has a subjective "now."
* **The Solution:** Negotiated **Delta Coherence**.

## 4.0 The Non-Negotiables (Criteria for Life)

1. **Event-First, Append-Only:** No silent mutation.
2. **Full Evidence Preservation:** Original timestamps are immutable signal.
3. **Delta Coherence:** Agents negotiate the epsilon between clocks.
4. **Low-Friction Handoff:** Intent, Progress, and Constraints are first-class residents.
5. **Cross-Environment Survivability:** Protocol must be self-describing.

---
*Summary: Previous versions died from premature schema gravity and unreliable connectors. TAPESTRY survives by treating temporal delta coherence as the integrity keystone.*
