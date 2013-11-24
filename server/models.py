import base64

from django.conf import settings
from django.db import models


def upload_handler(instance, filename):
    return base64.b64encode('%d%s' % (Image.objects.count(), filename))


class Image(models.Model):
    title = models.CharField(max_length=50)
    file = models.FileField(upload_to=upload_handler)

    @property
    def fetch_url(self):
        # see upload_handler
        return '%s%s' % (settings.MEDIA_URL, self.file.name)


class Annotation(models.Model):
    description = models.CharField(max_length=500)
    name = models.CharField(max_length=100)
    image = models.ForeignKey(Image)
    x = models.IntegerField()
    y = models.IntegerField()
    width = models.IntegerField()
    height = models.IntegerField()


class Comment(models.Model):
    text = models.CharField(max_length=500)
    # let's be just a name for the start
    author = models.CharField(max_length=50)
    annotation = models.ForeignKey(Annotation)
    image = models.ForeignKey(Image)
