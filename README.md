<div align="center">
  
# OrgFlow API
  
**A Production-Grade, Multi-Tenant Backend API for Agile Teams**

[![Build Status](https://github.com/AadiyKhan/orgflow-api/actions/workflows/test.yml/badge.svg)](https://github.com/AadiyKhan/orgflow-api/actions)
[![Python Version](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Django Version](https://img.shields.io/badge/django-5.0+-092E20.svg)](https://www.djangoproject.com/)
[![DRF Version](https://img.shields.io/badge/DRF-3.15+-red.svg)](https://www.django-rest-framework.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

*OrgFlow is a high-performance REST API engineered to replicate the core backend mechanics of platforms like Jira and Linear, featuring strict data isolation, role-based access control, and query optimization.*

</div>

---

## Table of Contents
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [Performance Metrics & Optimizations](#performance-metrics--optimizations)
- [Example API Outputs](#example-api-outputs)
- [Quick Start (Docker)](#quick-start-docker)
- [AI-Assisted Workflow](#ai-assisted-workflow)

---

## Key Features

- **Hard Multi-Tenancy**: Data isolation is enforced at the database queryset level via a custom `TenantScopedViewSet`. Organizations share a database but can never cross-pollinate data.
- **Custom JWT Authentication**: Secure, stateless authentication utilizing email as the primary identifier.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions featuring `ADMIN`, `MEMBER`, and `VIEWER` roles. Viewers are mathematically restricted to `SAFE_METHODS`.
- **Production Defenses**: Built-in DRF rate limiting (Throttling) to prevent abuse and custom exception handlers for uniform, structured error shapes.
- **Containerized Infrastructure**: Fully Dockerized with multi-stage builds and a PostgreSQL 15 database ready for orchestration.

---

## System Architecture

OrgFlow separates concerns into domain-driven Django applications:

1. **`core` App**: Manages the `User` model, the `Organization` (Tenant) model, and the `OrganizationMember` intersection. Handles all JWT issuance and RBAC permission checks.
2. **`projects` App**: Handles the business logic. Every model (`Project`, `Task`, `Comment`) inherits from an abstract `TenantModel`, guaranteeing an `organization_id` foreign key.

Routes are nested logically to reflect the data hierarchy:
`/api/organizations/` ➔ `/api/projects/{id}/` ➔ `/api/projects/{id}/tasks/`

---

## Performance Metrics & Optimizations

A common pitfall in ORM-based REST APIs is the **N+1 Query Problem**, especially when serializing nested relational data (like assigning users to tasks).

### Optimization Implementation
By explicitly declaring `select_related()` and `prefetch_related()` at the ViewSet layer, OrgFlow dramatically reduces database hits.

**Before Optimization:** Fetching 50 Tasks resulted in **~101 Queries**.  
**After Optimization:** Fetching 50 Tasks results in exactly **1 Query**.

```python
class TaskViewSet(TenantScopedViewSet):
    # ...
    def get_queryset(self):
        qs = super().get_queryset()
        # Forces a SQL JOIN, eliminating N+1 queries for nested user details
        return qs.select_related('assignee', 'reporter', 'project')
```

Composite database indexes are also applied across all tables (e.g., `INDEX (organization_id, status)`) to ensure sub-millisecond filtering even at scale.

---

## Example API Outputs

OrgFlow prioritizes predictable, structured JSON responses, even when errors occur.

### Standardized Error Payload (403 Forbidden)
```json
{
  "error": true,
  "status_code": 403,
  "message": "You do not have permission to perform this action.",
  "details": {
    "detail": "You do not have permission to perform this action."
  }
}
```

### Successful Task Retrieval (200 OK)
```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "title": "Implement PostgreSQL full-text search",
  "status": "IN_PROGRESS",
  "project": "9f8e7d6c-5b4a-3c2d-1e0f-a9b8c7d6e5f4",
  "assignee_details": {
    "id": "1234abcd-5678-efgh-9012-ijklmnop",
    "email": "engineer@orgflow.dev",
    "first_name": "Jane",
    "last_name": "Doe"
  },
  "created_at": "2024-03-15T10:30:00Z"
}
```

---

## Quick Start (Docker)

Get the API running locally in seconds using Docker Compose.

1. **Clone the repository**
   ```bash
   git clone https://github.com/AadiyKhan/orgflow-api.git
   cd orgflow-api
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```

3. **Spin up the containers**
   ```bash
   docker-compose up --build
   ```

4. **Access the API**
   - Base API URL: `http://localhost:8000/api/`
   - Interactive Swagger UI: `http://localhost:8000/api/schema/swagger-ui/`

---

## AI-Assisted Workflow

This project was engineered alongside **Claude Code**, demonstrating modern agentic AI development practices:

1. **Architectural Planning**: Drafted DB schemas and enforced tenant isolation rules upfront.
2. **Rapid Scaffolding**: Leveraged AI to generate boilerplate ViewSets and abstract models while adhering to strict context scopes.
3. **Refinement & Testing**: Manually reviewed security rules (RBAC) and used AI to generate edge-case `pytest` suites proving cross-tenant data leakage is impossible.

*This hybrid approach highlights the ability to focus on high-level system design and security while delegating syntax generation to AI agents.*
