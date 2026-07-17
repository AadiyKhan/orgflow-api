# OrgFlow API

OrgFlow is a multi-tenant backend API (akin to a mini Jira or Linear clone) built with Django and Django REST Framework (DRF). The core value proposition of this project is **hard data isolation**—multiple "organizations" (tenants) can use the same application and database without ever being able to access each other's data.

## Features

- **Robust Multi-Tenancy**: Data isolation is enforced strictly at the queryset level (via custom `TenantScopedViewSet`) rather than just relying on view logic.
- **Custom Authentication**: Uses a custom User model where the `email` serves as the primary identifier, secured with JWT (via `djangorestframework-simplejwt`).
- **Role-Based Access Control (RBAC)**: Includes custom permissions such that Organizations can have `ADMIN`, `MEMBER`, or `VIEWER` roles. Viewers are restricted to read-only operations.
- **Core Entities**: Organizations, Projects, Tasks (Tickets), and Comments. Nested routes support intuitive API access (e.g. `/api/projects/{id}/tasks/`).
- **Production-Grade Infrastructure**: Containerized via Docker + PostgreSQL, configured with basic rate limiting, structural error responses, and `django-environ` for scalable secrets management.
- **Query Optimization**: Implemented critical database optimizations using `select_related` on ViewSets to avoid N+1 queries.
- **CI/CD**: Includes automated tests running via GitHub Actions.

## Getting Started

### Prerequisites
- Docker and Docker Compose
- (Optional) Python 3.11+ if running locally without Docker.

### Running with Docker (Recommended)
1. Clone the repository.
2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
3. Start the services:
   ```bash
   docker-compose up --build
   ```
4. Access the API at `http://localhost:8000/api/` and the Swagger UI at `http://localhost:8000/api/schema/swagger-ui/`.

## Architecture & Optimizations

### Data Isolation
Every model scoped to an organization inherits from an abstract `TenantModel`. The `TenantScopedViewSet` overrides `get_queryset()` to automatically filter all endpoints based on `request.user.current_organization`. This creates a robust layer of defense ensuring cross-tenant leakage cannot happen at the API layer.

### Database Query Optimization
A frequent issue in Django/DRF apps is the N+1 query problem, especially when nesting user details (like task assignees or reporters). 
In `TaskViewSet` and `CommentViewSet`, `select_related()` is used explicitly to pre-fetch related user and project information in a single database query.

```python
# projects/views.py - TaskViewSet
def get_queryset(self):
    qs = super().get_queryset()
    # Performance Optimization: Use select_related to avoid N+1 query problems
    return qs.select_related('assignee', 'reporter', 'project')
```

## AI Assisted Workflow (Claude Code)

This project was built with the assistance of agentic coding tools to dramatically accelerate development. 
1. **Planning**: An initial architecture document was drafted, outlining the DB schema and tenant-isolation strategy.
2. **Scaffolding**: Used AI to quickly scaffold the base models, serializers, and DRF ViewSets while enforcing the pre-defined tenant rules.
3. **Refining**: Manually reviewed and refined the generated RBAC permissions and customized the exception handler for structured error responses.
4. **Testing**: AI was leveraged to rapidly generate edge-case testing, such as proving `Org A` data is inaccessible to `Org B`. 

This hybrid workflow allowed me to focus on high-level architectural decisions (like enforcing multi-tenancy and query optimizations) while delegating boilerplate generation to the AI.
