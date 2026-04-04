from django.urls import path
from .views import alphabet_view, dictionary_view, path_view, translator_view

urlpatterns = [
    path('', path_view, name='path'),
    path('translator/', translator_view, name='translator'),
    path('alphabet/', alphabet_view, name='alphabet'),
    path('dictionary/', dictionary_view, name='dictionary'),
]