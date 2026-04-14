from django.urls import path
from .views import alphabet_view, dictionary_view, path_view, translator_view, flashcard_practice_view, flashcard_quiz_view, dict_practice_view, dict_quiz_view, alphabet_lesson_view, alphabet_exam_view

urlpatterns = [
    path('', path_view, name='path'),
    path('translator/', translator_view, name='translator'),
    path('alphabet/', alphabet_view, name='alphabet'),
    path('dictionary/', dictionary_view, name='dictionary'),
    path('alphabet/flashcard/', flashcard_practice_view, name='flashcard_practice'),
    path('alphabet/quiz/', flashcard_quiz_view, name='flashcard_quiz'),
    path('dictionary/flashcard/', dict_practice_view, name='dict_practice'),
    path('dictionary/quiz/', dict_quiz_view, name='dict_quiz'),
    path('lesson/alphabet/', alphabet_lesson_view, name='alphabet_lesson'),
    path('lesson/exam/', alphabet_exam_view, name='alphabet_exam'),
]