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

from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings

class RequestPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Return a generic success to prevent email enumeration
            return Response({'message': 'If an account with this email exists, a password reset link has been sent.'}, status=status.HTTP_200_OK)
            
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Link typically points to frontend
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"
        
        send_mail(
            subject='Reset your OrgFlow Password',
            message=f'Click the link below to reset your password:\n\n{reset_link}\n\nIf you did not request this, please ignore this email.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        return Response({'message': 'If an account with this email exists, a password reset link has been sent.'}, status=status.HTTP_200_OK)

class ConfirmPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        password = request.data.get('password')
        
        if not all([uidb64, token, password]):
            return Response({'error': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None
            
        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({'message': 'Password has been reset successfully'}, status=status.HTTP_200_OK)
            
        return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

from django.core.signing import TimestampSigner, BadSignature, SignatureExpired

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
            
        # Check if already a member
        try:
            target_user = User.objects.get(email=email)
            if OrganizationMember.objects.filter(organization=org, user=target_user).exists():
                return Response({'error': 'User is already a member of this organization.'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            pass # It's fine if they don't exist yet, we'll create them when they accept
            
        # Generate signed token
        signer = TimestampSigner()
        token = signer.sign_object({'email': email, 'org_id': str(org.id), 'role': role})
        
        # Send invite email
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        invite_url = f"{frontend_url}/invite?token={token}"
        msg = f"You have been invited to join the organization '{org.name}' on OrgFlow.\n\n"
        msg += f"Click the link below to accept or decline the invitation:\n{invite_url}\n\n"
        msg += "If you do not have an account, one will be created for you automatically."
            
        send_mail(
            subject=f"You're invited to {org.name} on OrgFlow",
            message=msg,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
            
        return Response({
            'message': f'Invite sent successfully to {email}',
        }, status=status.HTTP_200_OK)

class AcceptInviteView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        signer = TimestampSigner()
        try:
            # Token valid for 7 days
            data = signer.unsign_object(token, max_age=60 * 60 * 24 * 7)
        except SignatureExpired:
            return Response({'error': 'Invite link has expired.'}, status=status.HTTP_400_BAD_REQUEST)
        except BadSignature:
            return Response({'error': 'Invalid invite link.'}, status=status.HTTP_400_BAD_REQUEST)
            
        email = data.get('email')
        org_id = data.get('org_id')
        role = data.get('role')
        
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            return Response({'error': 'Organization no longer exists.'}, status=status.HTTP_404_NOT_FOUND)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Auto create user with a temporary password they can reset later
            user = User.objects.create_user(email=email, password='password123')
            
        # Add to organization if not already a member
        member, created = OrganizationMember.objects.get_or_create(
            organization=org,
            user=user,
            defaults={'role': role}
        )
        
        # If user has no current organization, set it
        if not user.current_organization:
            user.current_organization = org
            user.save()
            
        return Response({'message': f'Successfully joined {org.name}'}, status=status.HTTP_200_OK)
