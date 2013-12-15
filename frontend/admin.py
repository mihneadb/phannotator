from django.contrib import admin

from server.models import *

# Register your models here.
admin.site.register(Image)
admin.site.register(Annotation)
admin.site.register(Comment)
