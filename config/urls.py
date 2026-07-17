from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_nested import routers
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from core.views import UserViewSet, OrganizationViewSet, OrganizationMemberViewSet, RegisterView, InviteMemberView, RequestPasswordResetView, ConfirmPasswordResetView
from projects.views import ProjectViewSet, TaskViewSet, CommentViewSet

# Main router
router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'organizations', OrganizationViewSet, basename='organization')
router.register(r'members', OrganizationMemberViewSet, basename='member')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')

# Nested router for projects -> tasks
projects_router = routers.NestedSimpleRouter(router, r'projects', lookup='project')
projects_router.register(r'tasks', TaskViewSet, basename='project-tasks')

# Nested router for tasks -> comments
tasks_router = routers.NestedSimpleRouter(router, r'tasks', lookup='task')
tasks_router.register(r'comments', CommentViewSet, basename='task-comments')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/invite/', InviteMemberView.as_view(), name='invite'),
    path('api/auth/password-reset/', RequestPasswordResetView.as_view(), name='password_reset'),
    path('api/auth/password-reset/confirm/', ConfirmPasswordResetView.as_view(), name='password_reset_confirm'),
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api/', include(projects_router.urls)),
    path('api/', include(tasks_router.urls)),
    
    # Schema and Swagger docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
