import pytest
from rest_framework.test import APIClient
from rest_framework import status
from core.models import User, Organization, OrganizationMember
from projects.models import Project, Task

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def setup_tenants(db):
    # Setup Org A and User A
    org_a = Organization.objects.create(name="Org A")
    user_a = User.objects.create_user(email="usera@orga.com", password="password123")
    user_a.current_organization = org_a
    user_a.save()
    OrganizationMember.objects.create(user=user_a, organization=org_a, role='ADMIN')

    # Setup Org B and User B
    org_b = Organization.objects.create(name="Org B")
    user_b = User.objects.create_user(email="userb@orgb.com", password="password123")
    user_b.current_organization = org_b
    user_b.save()
    OrganizationMember.objects.create(user=user_b, organization=org_b, role='ADMIN')

    # Create Projects for both orgs
    project_a = Project.objects.create(organization=org_a, name="Project A")
    project_b = Project.objects.create(organization=org_b, name="Project B")

    # Create Tasks for both orgs
    Task.objects.create(organization=org_a, project=project_a, title="Task A", reporter=user_a)
    Task.objects.create(organization=org_b, project=project_b, title="Task B", reporter=user_b)

    return {
        'org_a': org_a, 'user_a': user_a, 'project_a': project_a,
        'org_b': org_b, 'user_b': user_b, 'project_b': project_b
    }

@pytest.mark.django_db
def test_tenant_isolation_projects(api_client, setup_tenants):
    user_a = setup_tenants['user_a']
    
    # Authenticate as User A
    api_client.force_authenticate(user=user_a)

    # Get projects
    response = api_client.get('/api/projects/')
    assert response.status_code == status.HTTP_200_OK
    
    # User A should only see Project A
    results = response.data['results']
    assert len(results) == 1
    assert results[0]['name'] == 'Project A'

@pytest.mark.django_db
def test_tenant_isolation_tasks(api_client, setup_tenants):
    user_a = setup_tenants['user_a']
    
    # Authenticate as User A
    api_client.force_authenticate(user=user_a)

    # Get tasks
    response = api_client.get('/api/tasks/')
    assert response.status_code == status.HTTP_200_OK
    
    # User A should only see Task A
    results = response.data['results']
    assert len(results) == 1
    assert results[0]['title'] == 'Task A'

@pytest.mark.django_db
def test_rbac_viewer_cannot_create_project(api_client, setup_tenants):
    org_a = setup_tenants['org_a']
    # Create Viewer user in Org A
    viewer = User.objects.create_user(email="viewer@orga.com", password="password123")
    viewer.current_organization = org_a
    viewer.save()
    OrganizationMember.objects.create(user=viewer, organization=org_a, role='VIEWER')

    api_client.force_authenticate(user=viewer)
    
    # Viewer tries to create a project
    response = api_client.post('/api/projects/', {
        'name': 'Hacked Project',
        'description': 'Should not be allowed'
    })
    
    # Should be forbidden because IsOrganizationMemberOrAdmin restricts non-safe methods for VIEWERS
    assert response.status_code == status.HTTP_403_FORBIDDEN
