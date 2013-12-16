from django.core import serializers
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect
from django.views.decorators.http import require_http_methods

from frontend.forms import AddCommentForm, SearchImageForm
from server.models import *

@require_http_methods(["POST"])
def add_annotation(request):
    x = int(float(request.POST['x']))
    y = int(float(request.POST['y']))
    width = int(float(request.POST['width']))
    height = int(float(request.POST['height']))
    name = request.POST['name']
    imgpk = int(request.POST['imgpk'])

    img = get_object_or_404(Image, pk=imgpk)
    ann = Annotation(x=x, y=y, width=width, height=height, name=name, image=img)
    ann.save()

    return HttpResponse(status=200)

@require_http_methods(["POST"])
def delete_annotation(request):
    name = request.POST['name']
    imgpk = int(request.POST['imgpk'])
    img = get_object_or_404(Image, pk=imgpk)
    ann = Annotation.objects.get(image=img, name=name)
    ann.delete()
    return HttpResponse(status=200)

@require_http_methods(["POST"])
def add_comment(request, imgpk, annpk):
    img = get_object_or_404(Image, pk=imgpk)
    ann = get_object_or_404(Annotation, pk=annpk)
    form = AddCommentForm(request.POST)
    if form.is_valid():
        c = form.save(False)
        c.image = img
        c.annotation = ann
        c.save()
    return redirect('image', pk=imgpk)

@require_http_methods(["GET"])
def get_comments(request, annpk):
    ann = get_object_or_404(Annotation, pk=annpk)
    comments = Comment.objects.filter(annotation=ann)
    data = serializers.serialize('json', comments)
    return HttpResponse(data, content_type='application/json')
