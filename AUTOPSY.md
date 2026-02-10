# Project Autopsy: Why Previous Iterations Failed

To ensure the success of the TAPESTRY architecture, we must document and internalize the "recurring killers" that destroyed previous attempts.

## 1.0 Previous Approaches & Reality Gaps

### A. The "Database as Spine" (Notion/Airtable)

* **Attempt:** Using Notion or Airtable as a structured DB for the memory mesh.
* **Failure:** Connectors lacked write-capabilities or schema-creation permissions in-session. The system's backbone could not be materialized or maintained where needed.
* **Lesson:** Connectors are adapters, not the spine. Don't build on shifting sand.

### B. Premature Schema Gravity (Tables First)

* **Attempt:** Modeling cross-thread continuity as normalized columns from day one.
* **Failure:** Tables force early binding on ontology (identity, role, causality). The "furniture starts dictating the cognition."
* **Lesson:** Memory wants an event log/graph posture first. Tables are projections, not the canonical substrate.

### C. Human-as-Middleware

* **Failure:** Any design requiring the human to remember handoff rules or map time collapses under repetition. Protocol decay ensues when rules aren't self-describing in the shared state.

## 2.0 The Temporal Integrity Keystone

**Multiple clocks are not a bug; they are signal.**

* Previous versions died by trying to enforce "one true now" or suppressing timestamps.
* **The Reality:** Every agent has a subjective "now." Suppressing this is epistemic data loss.
* **The Solution:** Negotiated **Delta Coherence**. Like radio tuning—if you aren't on the number, it's noise. Integrity comes from the delta, not the absolute timestamp.

## 3.0 The Non-Negotiables (Criteria for Life)

If the system fails any of these, it is dead:

1. **Event-First, Append-Only:** No silent mutation. No retroactive "cleanup" of provenance.
2. **Full Evidence Preservation:** Never omit agent-declared timestamps or primary observations. Filtering is allowed; deletion/omission is not.
3. **Delta Coherence as First-Class Safety:** Agents must negotiate/declare deltas between clocks. The system must support negotiated arbitration for epsilon thresholds.
4. **Low-Friction Handoff:** Minimal "core" state (Intent, Progress, Constraints) sufficient for zero-loss transfer.
5. **Cross-Environment Survivability:** Must work across providers with no special runtime privileges.

---
*Summary: Previous versions died from premature schema gravity and unreliable connectors. TAPESTRY survives by proving portability first and treating temporal delta coherence as the integrity keystone.*
