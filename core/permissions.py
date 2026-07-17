from rest_framework import permissions
from .models import OrganizationMember

class IsOrganizationMember(permissions.BasePermission):
    """
    Allows access only to users who are members of their current organization.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        current_org = request.user.current_organization
        if not current_org:
            return False

        # Check if the user is actually a member of this organization
        return OrganizationMember.objects.filter(
            user=request.user, 
            organization=current_org
        ).exists()


class IsOrganizationAdmin(permissions.BasePermission):
    """
    Allows access only to organization admins.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        current_org = request.user.current_organization
        if not current_org:
            return False

        return OrganizationMember.objects.filter(
            user=request.user, 
            organization=current_org,
            role='ADMIN'
        ).exists()


class IsOrganizationMemberOrAdmin(permissions.BasePermission):
    """
    Allows full access to admins/members, but read-only to viewers.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        current_org = request.user.current_organization
        if not current_org:
            return False

        try:
            member = OrganizationMember.objects.get(
                user=request.user, 
                organization=current_org
            )
            
            if member.role in ['ADMIN', 'MEMBER']:
                return True
                
            # VIEWER can only read
            if request.method in permissions.SAFE_METHODS:
                return True
                
            return False
            
        except OrganizationMember.DoesNotExist:
            return False
