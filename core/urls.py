from django.contrib import admin
from django.urls import path, include
from .views import home_view, about_view, service_worker_view, terms_view, privacy_view, contact_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home_view, name='home'),
    path('about/', about_view, name='about'),
    path('contact/', contact_view, name='contact'),
    path('terms/', terms_view, name='terms'),
    path('privacy/', privacy_view, name='privacy'),
    path('learn/', include('apps.learn.urls')),
    path('user/', include('apps.users.urls')),
    path('sw.js', service_worker_view, name='service-worker'),
]
