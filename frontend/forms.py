from django import forms

from server.models import Image


class UploadImageForm(forms.ModelForm):
    class Meta:
        model = Image

