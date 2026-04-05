from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class UserProfile(models.Model):
    PURPOSE_CHOICES = [
        ('deaf_family', "Oilamda eshitish qobiliyati cheklangan shaxs bor"),
        ('professional', "Kasbiy maqsadda (tarjimon, o'qituvchi va h.k.)"),
        ('curiosity', "Qiziqish va shaxsiy rivojlanish uchun"),
        ('student', "O'quv jarayonida talab qilinadi"),
        ('community', "Jamiyatda yordam berish uchun"),
    ]

    LEVEL_CHOICES = [
        ('beginner', "Hech narsa bilmayman — noldan boshlayman"),
        ('basic', "Bir nechta so'z va harflarni bilaman"),
        ('intermediate', "Oddiy gaplarni tushunaman va ishlataman"),
    ]

    GOAL_CHOICES = [
        ('casual', "Kuniga 5 daqiqa — bo'sh vaqtimda"),
        ('regular', "Kuniga 15 daqiqa — muntazam"),
        ('serious', "Kuniga 30+ daqiqa — jiddiy o'rganaman"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    purpose = models.CharField(max_length=30, choices=PURPOSE_CHOICES, blank=True, default='')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, blank=True, default='')
    daily_goal = models.CharField(max_length=20, choices=GOAL_CHOICES, blank=True, default='')
    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # Streak fields
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_login_date = models.DateField(null=True, blank=True)
    streak_freezes_used = models.IntegerField(default=0)  # 0 to 3 per 30-day period
    freeze_period_start = models.DateField(null=True, blank=True)  # Tracks the 30-day period

    def __str__(self):
        return f"{self.user.username} Profile"

    def check_and_update_streak(self):
        """Called once per day (on login). Updates streak logic."""
        today = timezone.localdate()

        # Reset freeze counter every 30 days
        if self.freeze_period_start is None:
            self.freeze_period_start = today
        elif (today - self.freeze_period_start).days >= 30:
            self.freeze_period_start = today
            self.streak_freezes_used = 0

        if self.last_login_date is None:
            # First ever login
            self.current_streak = 1
            self.last_login_date = today
            self.longest_streak = max(self.longest_streak, self.current_streak)
            self.save()
            StreakLog.objects.get_or_create(user=self.user, date=today, defaults={'log_type': 'active'})
            return

        if self.last_login_date == today:
            # Already logged in today
            return

        days_missed = (today - self.last_login_date).days - 1  # days between last login and today

        if days_missed == 0:
            # Consecutive day login
            self.current_streak += 1
            self.last_login_date = today
            self.longest_streak = max(self.longest_streak, self.current_streak)
            StreakLog.objects.get_or_create(user=self.user, date=today, defaults={'log_type': 'active'})
        elif days_missed > 0:
            # Missed some days, try to use freezes
            freezes_available = 3 - self.streak_freezes_used
            if days_missed <= freezes_available:
                # Cover all missed days with freezes
                for i in range(1, days_missed + 1):
                    freeze_date = self.last_login_date + timedelta(days=i)
                    StreakLog.objects.get_or_create(
                        user=self.user, date=freeze_date,
                        defaults={'log_type': 'freeze'}
                    )
                self.streak_freezes_used += days_missed
                self.current_streak += days_missed + 1  # missed days + today
                self.last_login_date = today
                self.longest_streak = max(self.longest_streak, self.current_streak)
                StreakLog.objects.get_or_create(user=self.user, date=today, defaults={'log_type': 'active'})
            else:
                # Streak broken
                self.current_streak = 1
                self.last_login_date = today
                StreakLog.objects.get_or_create(user=self.user, date=today, defaults={'log_type': 'active'})

        self.save()


class StreakLog(models.Model):
    """Tracks each day's streak status for a user."""
    LOG_TYPES = [
        ('active', 'Active Login'),
        ('freeze', 'Streak Freeze'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='streak_logs')
    date = models.DateField()
    log_type = models.CharField(max_length=10, choices=LOG_TYPES)

    class Meta:
        unique_together = ('user', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.date} ({self.log_type})"