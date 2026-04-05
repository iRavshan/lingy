from django.utils import timezone
from datetime import timedelta
from .models import UserProfile, StreakLog


def streak_context(request):
    """Adds streak data to all templates."""
    if not request.user.is_authenticated:
        return {}

    try:
        profile = request.user.profile
    except UserProfile.DoesNotExist:
        return {'streak_count': 0, 'streak_freezes_left': 3, 'weekly_streak': []}

    today = timezone.localdate()
    # Get the last 7 days (Mon-Sun of current week)
    # Start from Monday of this week
    weekday = today.weekday()  # 0=Monday
    monday = today - timedelta(days=weekday)

    weekly_data = []
    day_names = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']

    logs = StreakLog.objects.filter(
        user=request.user,
        date__gte=monday,
        date__lte=monday + timedelta(days=6)
    )
    log_map = {log.date: log.log_type for log in logs}

    for i in range(7):
        day_date = monday + timedelta(days=i)
        log_type = log_map.get(day_date, None)

        if day_date > today:
            status = 'future'
        elif log_type == 'active':
            status = 'active'
        elif log_type == 'freeze':
            status = 'freeze'
        else:
            status = 'missed'

        weekly_data.append({
            'name': day_names[i],
            'date': day_date,
            'status': status,
            'is_today': day_date == today,
        })

    return {
        'streak_count': profile.current_streak,
        'streak_freezes_left': 3 - profile.streak_freezes_used,
        'weekly_streak': weekly_data,
    }
