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

