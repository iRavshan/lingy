from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout, login, authenticate
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.conf import settings
from .models import UserProfile
from .turnstile import verify_turnstile
import json


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Verify Turnstile
        turnstile_token = request.POST.get('cf-turnstile-response', '')
        if not verify_turnstile(turnstile_token, get_client_ip(request)):
            messages.error(request, "Xavfsizlik tekshiruvi muvaffaqiyatsiz. Qaytadan urinib ko'ring.")
            return render(request, 'users/auth/login.html', {
                'TURNSTILE_SITE_KEY': settings.TURNSTILE_SITE_KEY
            })

        # In our signup, we set username = email
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return redirect('path')
        else:
            messages.error(request, "Elektron pochta yoki parol noto'g'ri kiritildi.")

    return render(request, 'users/auth/login.html', {
        'TURNSTILE_SITE_KEY': settings.TURNSTILE_SITE_KEY
    })


def signup_view(request):
    if request.method == 'POST':
        full_name = request.POST.get('full_name')
        email = request.POST.get('email')
        password = request.POST.get('password')

        # Verify Turnstile
        turnstile_token = request.POST.get('cf-turnstile-response', '')
        if not verify_turnstile(turnstile_token, get_client_ip(request)):
            messages.error(request, "Xavfsizlik tekshiruvi muvaffaqiyatsiz. Qaytadan urinib ko'ring.")
            return render(request, 'users/auth/register.html', {
                'TURNSTILE_SITE_KEY': settings.TURNSTILE_SITE_KEY
            })

        if User.objects.filter(email=email).exists() or User.objects.filter(username=email).exists():
            messages.error(request, "Ushbu elektron pochta ro'yxatdan o'tgan.")
        else:
            # Setting username = email
            user = User.objects.create_user(username=email, email=email, password=password)

            # Optionally split full name
            parts = full_name.split(' ', 1)
            user.first_name = parts[0]
            if len(parts) > 1:
                user.last_name = parts[1]
            user.save()

            # Create user profile
            UserProfile.objects.create(user=user)

            # Log user in directly
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return redirect('welcome')

    return render(request, 'users/auth/register.html', {
        'TURNSTILE_SITE_KEY': settings.TURNSTILE_SITE_KEY
    })


@login_required
def welcome_view(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            if data.get('purpose'):
                profile.purpose = data['purpose']
            if data.get('level'):
                profile.level = data['level']
            if data.get('goal'):
                profile.daily_goal = data['goal']
            profile.onboarding_completed = True
            profile.save()
            return JsonResponse({'status': 'ok'})
        except Exception:
            return JsonResponse({'status': 'error'}, status=400)

    # If onboarding already done, go to path
    if profile.onboarding_completed:
        return redirect('path')

    return render(request, 'users/welcome.html')


@login_required
def logout_view(request):
    logout(request)
    return redirect('login')


@login_required
def auth_success_view(request):
    return render(request, 'users/auth/auth_success.html')


@login_required
def settings_view(request):
    return render(request, 'users/settings.html')


@login_required
def profile_view(request):
    return render(request, 'users/profile.html')