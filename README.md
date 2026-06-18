# 2303A510G6-
# Campus Notifications Microservice Hub

An enterprise-grade, responsive frontend application built with **React 19** and **Material UI** that integrates with a live campus notifications microservice data stream. This system implements dynamic server-side pagination, parameter filtering, and a deterministic priority ranking algorithm.

## 🚀 Features

### Stage 1: Priority Inbox Engine & Bounded Heap Design
- **Deterministic Priority Evaluation:** Sorts real-time campus notifications based on a custom weight hierarchy matrix (`Placement > Result > Event`) combined with a time-recency check.
- **System Design Blueprint:** Full architectural analysis saved under `Notification_System_Design.md` detailing top-n memory processing optimizations.

### Stage 2: Production Responsive Interface
- **Dynamic Stream Control:** Full user drop-down filtering using microservice query parameters (`limit`, `page`, `notification_type`).
- **Strict Architecture Compliance:** Implements dedicated logging middleware infrastructure across the active call stack (native console logs completely removed).
- **Fluid Layout Layer:** Built exclusively using Material UI container components to ensure seamless scaling between Desktop and Mobile screen profiles.

## 🛠️ Tech Stack & Setup
- **Framework:** React 19
- **UI Library:** Material UI (MUI)
- **Data Source Endpoint:** `http://4.224.186.213/evaluation-service/notifications`

### Local Execution Instructions
1. Navigate to the frontend workspace directory:
   ```bash
   cd 2303A510G6-/notification-app-fe
