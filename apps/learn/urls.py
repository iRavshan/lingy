from django.urls import path
from .views import alphabet_view, dictionary_view, path_view

urlpatterns = [
    path('', path_view, name='path'),
    path('alphabet/', alphabet_view, name='alphabet'),
    path('dictionary/', dictionary_view, name='dictionary'),
]