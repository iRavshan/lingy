from django.db import models

class Letter(models.Model):
    letter = models.CharField(max_length=1)
    word = models.CharField(max_length=100)
    
    def __str__(self):
        return self.letter


class Topic(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name


class Word(models.Model):
    word = models.CharField(max_length=100)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    
    def __str__(self):
        return self.word