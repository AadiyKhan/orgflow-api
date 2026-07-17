import pytest
from rest_framework.test import APIClient
from django.urls import reverse
from core.models import User, Organization, OrganizationMember

@pytest.mark.django_db
def test_invite_user_creates_account_and_adds_to_org():
    client = APIClient()
    
    # 1. Setup existing admin user and organization
    admin = User.objects.create_user(email='admin@example.com', password='password123')
    org = Organization.objects.create(name='Test Org')
    OrganizationMember.objects.create(user=admin, organization=org, role='ADMIN')
    admin.current_organization = org
    admin.save()
    
    client.force_authenticate(user=admin)
    
    # 2. Invite a completely new user
    new_email = 'newbie@example.com'
    response = client.post('/api/auth/invite/', {
        'email': new_email,
        'role': 'MEMBER'
    })
    
    assert response.status_code == 201
    
    # 3. Verify user was created in database
    new_user = User.objects.get(email=new_email)
    assert new_user is not None
    assert new_user.current_organization == org
    
    # 4. Verify OrganizationMember was created
    member_exists = OrganizationMember.objects.filter(
        user=new_user, 
        organization=org, 
        role='MEMBER'
    ).exists()
    assert member_exists is True
