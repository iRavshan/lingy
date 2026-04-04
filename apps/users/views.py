from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout, login, authenticate
from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.models import User

def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        
        # In our signup, we set username = email
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            return redirect('path')
        else:
            messages.error(request, "Elektron pochta yoki parol noto'g'ri kiritildi.")
            
    return render(request, 'users/auth/login.html')

def signup_view(request):
    if request.method == 'POST':
        full_name = request.POST.get('full_name')
        email = request.POST.get('email')
        password = request.POST.get('password')
        
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
            
            # Log user in directly
            login(request, user)
            return redirect('path')
            
    return render(request, 'users/auth/register.html')

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