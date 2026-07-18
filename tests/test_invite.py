import pytest
from unittest.mock import patch
from rest_framework.test import APIClient
from django.urls import reverse
from core.models import User, Organization, OrganizationMember

@pytest.mark.django_db
@patch('core.views.send_mail')
def test_invite_sends_email_and_returns_201(mock_send_mail):
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
    assert 'Invite sent successfully' in response.data['message']
    
    # 3. Verify email was sent
    mock_send_mail.assert_called_once()
    call_kwargs = mock_send_mail.call_args
    assert new_email in call_kwargs.kwargs.get('recipient_list', call_kwargs[1].get('recipient_list', []))


@pytest.mark.django_db
@patch('core.views.send_mail')
def test_invite_existing_member_returns_400(mock_send_mail):
    client = APIClient()
    
    admin = User.objects.create_user(email='admin@example.com', password='password123')
    member_user = User.objects.create_user(email='member@example.com', password='password123')
    org = Organization.objects.create(name='Test Org')
    OrganizationMember.objects.create(user=admin, organization=org, role='ADMIN')
    OrganizationMember.objects.create(user=member_user, organization=org, role='MEMBER')
    admin.current_organization = org
    admin.save()
    
    client.force_authenticate(user=admin)
    
    response = client.post('/api/auth/invite/', {
        'email': 'member@example.com',
        'role': 'MEMBER'
    })
    
    assert response.status_code == 400
    assert 'already a member' in response.data['error']
    mock_send_mail.assert_not_called()


@pytest.mark.django_db
@patch('core.views.send_mail', side_effect=Exception('SMTP connection failed'))
def test_invite_smtp_failure_returns_502(mock_send_mail):
    client = APIClient()
    
    admin = User.objects.create_user(email='admin@example.com', password='password123')
    org = Organization.objects.create(name='Test Org')
    OrganizationMember.objects.create(user=admin, organization=org, role='ADMIN')
    admin.current_organization = org
    admin.save()
    
    client.force_authenticate(user=admin)
    
    response = client.post('/api/auth/invite/', {
        'email': 'newbie@example.com',
        'role': 'MEMBER'
    })
    
    assert response.status_code == 502
    assert 'Failed to send invite email' in response.data['error']


@pytest.mark.django_db
@patch('core.views.send_mail')
def test_password_reset_sends_email(mock_send_mail):
    client = APIClient()
    
    User.objects.create_user(email='user@example.com', password='password123')
    
    response = client.post('/api/auth/password-reset/', {
        'email': 'user@example.com'
    })
    
    assert response.status_code == 200
    mock_send_mail.assert_called_once()
    call_kwargs = mock_send_mail.call_args
    assert 'user@example.com' in call_kwargs.kwargs.get('recipient_list', call_kwargs[1].get('recipient_list', []))


@pytest.mark.django_db
@patch('core.views.send_mail', side_effect=Exception('SMTP auth failed'))
def test_password_reset_smtp_failure_returns_502(mock_send_mail):
    client = APIClient()
    
    User.objects.create_user(email='user@example.com', password='password123')
    
    response = client.post('/api/auth/password-reset/', {
        'email': 'user@example.com'
    })
    
    assert response.status_code == 502
    assert 'Failed to send password reset email' in response.data['error']
