from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
import os

def home_view(request):
    return render(request, 'main/index.html')

def about_view(request):
    return render(request, 'main/about.html')

def terms_view(request):
    return render(request, 'main/terms.html')

def privacy_view(request):
    return render(request, 'main/privacy.html')

def contact_view(request):
    return render(request, 'main/contact.html')

def service_worker_view(request):
    sw_path = os.path.join(settings.BASE_DIR, 'static', 'sw.js')
    with open(sw_path, 'r', encoding='utf-8') as f:
        return HttpResponse(f.read(), content_type='application/javascript')

def manifest_view(request):
    manifest_path = os.path.join(settings.BASE_DIR, 'static', 'img', 'favicon', 'site.webmanifest')
    with open(manifest_path, 'r', encoding='utf-8') as f:
        return HttpResponse(f.read(), content_type='application/manifest+json')
