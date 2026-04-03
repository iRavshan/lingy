from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
import os

def home_view(request):
    return render(request, 'main/index.html')

def about_view(request):
    return render(request, 'main/about.html')

def service_worker_view(request):
    """Serve service worker from root scope for PWA."""
    sw_path = os.path.join(settings.BASE_DIR, 'static', 'sw.js')
    with open(sw_path, 'r') as f:
        return HttpResponse(f.read(), content_type='application/javascript')