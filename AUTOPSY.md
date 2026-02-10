
To ensure the success of the TAPESTRY architecture, we must document how past failures map to the **Four Friction Points of Agentic Computing**.

## 1.0 Mapping Failures to Friction

### 1.1 Intent Fusion (The Translation Gap)

* **Failures:** Manual reformatting of data to make one tool talk to another.
* **Reality:** When the conductor spends time on "data munging," intent fusion has failed. The system was executing formats, not goals.
* **Phantom Participants:** Models claiming to have "got the rules" but operating on outdated or hallucinated instructions because there was no verifiable handshake.

### 1.2 Persistent Memory Mesh (Context Amnesia)

* **Failures:** "Database as Spine" (Notion/Airtable) stalled because connectors lacked schema-creation capability.
* **Reality:** Memory became siloed and ephemeral. The human was forced into a cycle of re-contextualization (The Memory Tax).

### 1.3 Environment Integration Layer (Isolation)

* **Failures:** LLM intelligence was "imprisoned" in browser tabs, unable to touch the local filesystem.
* **Reality:** Impedance mismatch between thinking and doing. The conductor acted as the "hand" for the system.

### 1.4 Autonomous Execution and Validation (Confidence Gap)

* **Failures:** Silent mutations or retroactive "cleanup" that destroyed provenance.
* **Reality:** Lack of a canonical, append-only record meant outcomes couldn't be verified with confidence.

## 2.0 The Temporal Integrity Keystone

**Multiple clocks are not a bug; they are signal.**

* Previous versions died by trying to enforce "one true now."
* **The Reality:** Every agent has a subjective "now."
* **The Solution:** Negotiated **Delta Coherence**. Like radio tuning—if you aren't on the number, it's noise.

## 3.0 The Non-Negotiables (Criteria for Life)

1. **Event-First, Append-Only:** No silent mutation.
2. **Full Evidence Preservation:** Original timestamps are immutable signal.
3. **Delta Coherence:** Agents negotiate the epsilon between clocks.
4. **Low-Friction Handoff:** Intent, Progress, and Constraints are first-class residents.
5. **Cross-Environment Survivability:** Protocol must be self-describing across any provider.

---
*Summary: Previous versions died from premature schema gravity and unreliable connectors. TAPESTRY survives by treating temporal delta coherence as the integrity keystone.*
