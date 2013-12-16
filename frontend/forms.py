from django import forms
from django.forms.widgets import Textarea

from server.models import Image, Comment


class UploadImageForm(forms.ModelForm):
    class Meta:
        model = Image

class AddCommentForm(forms.ModelForm):
    class Meta:
        model = Comment
        fields = ('author', 'text')
        widgets = {'text': Textarea()}

class SearchImageForm(forms.Form):
    search = forms.CharField(max_length=100, required=False)

    def clean_search(self):
        return self.cleaned_data['search']
