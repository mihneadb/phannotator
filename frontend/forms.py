from django import forms

from server.models import Image, Comment


class UploadImageForm(forms.ModelForm):
    class Meta:
        model = Image

class AddCommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ('author', 'text')
