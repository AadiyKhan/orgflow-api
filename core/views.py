from rest_framework import viewsets, mixins, status, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Organization, OrganizationMember, User
from .serializers import OrganizationSerializer, OrganizationMemberSerializer, UserSerializer
from .permissions import IsOrganizationMember, IsOrganizationAdmin

class UserViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin, mixins.UpdateModelMixin):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
        
    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
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

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Create default organization
        org_name = f"{first_name or email.split('@')[0]}'s Organization"
        org = Organization.objects.create(name=org_name)
        OrganizationMember.objects.create(organization=org, user=user, role='ADMIN')
        user.current_organization = org
        user.save()

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class InviteMemberView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsOrganizationAdmin]

    def post(self, request):
        email = request.data.get('email')
        role = request.data.get('role', 'MEMBER')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        org = request.user.current_organization
        if not org:
            return Response({'error': 'No active organization'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            target_user = User.objects.get(email=email)
        except User.DoesNotExist:
            target_user = User.objects.create_user(email=email, password='password123')
            
        # Check if already a member
        if OrganizationMember.objects.filter(organization=org, user=target_user).exists():
            return Response({'error': 'User is already a member of this organization.'}, status=status.HTTP_400_BAD_REQUEST)
            
        member = OrganizationMember.objects.create(
            organization=org,
            user=target_user,
            role=role
        )
        
        # If user has no current organization, set it
        if not target_user.current_organization:
            target_user.current_organization = org
            target_user.save()
            
        return Response({
            'message': f'Successfully added {email} to {org.name}',
            'member': OrganizationMemberSerializer(member).data
        }, status=status.HTTP_201_CREATED)
