from django.shortcuts import render

def path_view(request):
    return render(request, 'learn/path.html')

def alphabet_view(request):
    return render(request, 'learn/alphabet.html')

def dictionary_view(request):
    return render(request, 'learn/dictionary.html')

def translator_view(request):
    return render(request, 'learn/translator.html')