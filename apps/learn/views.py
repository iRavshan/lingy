from django.shortcuts import render

def path_view(request):
    return render(request, 'learn/path.html')

def alphabet_view(request):
    return render(request, 'learn/alphabet.html')

def dictionary_view(request):
    return render(request, 'learn/dictionary.html')

def translator_view(request):
    return render(request, 'learn/translator.html')

def flashcard_practice_view(request):
    return render(request, 'learn/flashcard_practice.html')

def flashcard_quiz_view(request):
    return render(request, 'learn/flashcard_quiz.html')

def dict_practice_view(request):
    return render(request, 'learn/dict_practice.html')

def dict_quiz_view(request):
    return render(request, 'learn/dict_quiz.html')

def alphabet_lesson_view(request):
    return render(request, 'learn/lesson_alphabet.html')