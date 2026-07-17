from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project, Task, Comment
from .serializers import ProjectSerializer, TaskSerializer, CommentSerializer
from core.permissions import IsOrganizationMember, IsOrganizationMemberOrAdmin

class TenantScopedViewSet(viewsets.ModelViewSet):
    """
    Base viewset that filters all queries by the user's current organization.
    """
    permission_classes = [permissions.IsAuthenticated, IsOrganizationMemberOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    def get_queryset(self):
        org = self.request.user.current_organization
        if not org:
            return self.queryset.none()
        return self.queryset.filter(organization=org)

class ProjectViewSet(TenantScopedViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']

class TaskViewSet(TenantScopedViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filterset_fields = ['status', 'project', 'assignee']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'status', 'order']
    ordering = ['order', '-created_at']

    def get_queryset(self):
        # Apply tenant scoping from base class
        qs = super().get_queryset()
        
        # Performance Optimization: Use select_related to avoid N+1 query problems
        # when serializing assignee_details and reporter_details.
        # This is a critical optimization for listing tasks.
        return qs.select_related('assignee', 'reporter', 'project')

class CommentViewSet(TenantScopedViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    filterset_fields = ['task']
    ordering_fields = ['created_at']
    ordering = ['created_at']

    def get_queryset(self):
        # Apply tenant scoping
        qs = super().get_queryset()
        
        # Optimize author lookups
        return qs.select_related('author')
