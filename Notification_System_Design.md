# Stage 1

## Priority Inbox System Design

### 1. Priority Algorithm Approach
The priority of incoming campus notifications is calculated deterministically based on a strict two-tier strategy:
* **Category Weight:** `Placement` (Weight = 3) > `Result` (Weight = 2) > `Event` (Weight = 1).
* **Recency:** Newer timestamps are favored if multiple notifications share identical category weights.

In our React system frontend dashboard, this is calculated dynamically using a native JavaScript array sorting callback before pulling the top 10 rows:
```javascript
const sorted = [...list].sort((a, b) => {
  const weightA = TYPE_WEIGHTS[a.Type] || 0;
  const weightB = TYPE_WEIGHTS[b.Type] || 0;
  if (weightB !== weightA) return weightB - weightA;
  return new Date(b.Timestamp) - new Date(a.Timestamp);
});