from .models import UserProfile


class StreakMiddleware:
    """Updates user streak once per day when they visit the site."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.user.is_authenticated:
            try:
                profile = request.user.profile
            except UserProfile.DoesNotExist:
                profile = UserProfile.objects.create(user=request.user)
            profile.check_and_update_streak()

        response = self.get_response(request)
        return response
