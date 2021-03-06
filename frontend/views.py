from django.views.generic import TemplateView
from django.shortcuts import render, redirect, get_object_or_404

from frontend.forms import UploadImageForm, AddCommentForm, SearchImageForm
from server.models import Image, Comment
import urllib

class IndexView(TemplateView):
    template_name = "index.html"

    def get(self, request):
        imgs = Image.objects.all()
        form = SearchImageForm()
        params = {
            'imgs': imgs,
            'form': form,
        }
        return render(request, self.template_name, params)

    def post(self, request):
        form = SearchImageForm(request.POST)
        if form.is_valid():
            search = request.POST.get('search')
            imgs = Image.objects.filter(title__contains=search)
            params = {
                'form': form,
                'imgs': imgs,
            }
            return render(request, self.template_name, params)
        return redirect('index')

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

        return redirect('/image/' + str(image.pk))



class ImageView(TemplateView):
    template_name = "image.html"

    def get(self, request, pk=None):
        img = get_object_or_404(Image, pk=pk)
        comment_form = AddCommentForm()
        comments = Comment.objects.filter(image=img)
        anns = img.annotation_set.all()

        if request.GET.get('selected'):
            selected = int(request.GET.get('selected'))
        else:
            selected = None

        return render(request, self.template_name, {'imgurl': img.fetch_url,
                                                    'imgpk': img.pk,
                                                    'comment_form': comment_form,
                                                    'comments': comments,
                                                    'annotations': anns,
                                                    'selected': selected})

