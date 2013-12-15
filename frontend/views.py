from django.views.generic import TemplateView
from django.shortcuts import render, redirect, get_object_or_404

from frontend.forms import UploadImageForm, AddCommentForm
from server.models import Image, Comment
import urllib

class IndexView(TemplateView):
    template_name = "index.html"

    def get(self, request):
        imgs = Image.objects.all()
        return render(request, self.template_name, {'imgs': imgs})


class UploadView(TemplateView):
    template_name = "upload.html"

    def get(self, request):
        form = UploadImageForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = UploadImageForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
        lastImage = len(Image.objects.all())
        return redirect('/image/' + str(lastImage))

class UploadUrlView(TemplateView):
    template_name = "upload_url.html"

    def get(self, request):
        return render(request, self.template_name)

    def post(self, request):

        url_file = request.POST['url']
        title = request.POST['title'].replace (" ", "_")

        urllib.urlretrieve(url_file, 'uploads/' + title)

        image = Image(title=request.POST['title'], file=title)
        image.save()


        lastImage = len(Image.objects.all())
        return redirect('/image/' + str(lastImage))



class ImageView(TemplateView):
    template_name = "image.html"

    def get(self, request, pk=None):
        img = get_object_or_404(Image, pk=pk)
        comment_form = AddCommentForm()
        comments = Comment.objects.filter(image=img)
        anns = img.annotation_set.all()
        return render(request, self.template_name, {'imgurl': img.fetch_url,
                                                    'imgpk': img.pk,
                                                    'comment_form': comment_form,
                                                    'comments': comments,
                                                    'annotations': anns,})

