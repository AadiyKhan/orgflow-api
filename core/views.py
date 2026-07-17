from rest_framework import viewsets, mixins, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Organization, OrganizationMember, User
from .serializers import OrganizationSerializer, OrganizationMemberSerializer, UserSerializer
from .permissions import IsOrganizationMember, IsOrganizationAdmin

class UserViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
        
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
        
    @action(detail=False, methods=['post'])
    def switch_organization(self, request):
        org_id = request.data.get('organization_id')
        try:
            member = OrganizationMember.objects.get(
                user=request.user, 
                organization_id=org_id
            )
            request.user.current_organization = member.organization
            request.user.save()
            return Response({'status': 'Organization switched successfully', 'organization_id': org_id})
        except OrganizationMember.DoesNotExist:
            return Response({'error': 'You are not a member of this organization'}, status=status.HTTP_403_FORBIDDEN)


class OrganizationViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationSerializer
    
    def get_queryset(self):
        return Organization.objects.filter(members__user=self.request.user)


class OrganizationMemberViewSet(viewsets.ModelViewSet):
    serializer_class = OrganizationMemberSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsOrganizationAdmin()]
        return [permissions.IsAuthenticated(), IsOrganizationMember()]

    def get_queryset(self):
        org = self.request.user.current_organization
        if not org:
            return OrganizationMember.objects.none()
        return OrganizationMember.objects.filter(organization=org).select_related('user')
        
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['organization'] = self.request.user.current_organization
        return context
