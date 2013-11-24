from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponse
from django.core import serializers
from frontend.forms import AddCommentForm

from server.models import Image, Annotation

def add_annotation(request):
    if request.method != "POST":
        return HttpResponse(status=403)

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

def get_annotations(request, pk):
    if request.method != "GET":
        return HttpResponse(status=403)

    img = get_object_or_404(Image, pk=pk)
    anns = Annotation.objects.filter(image=img).all()
    data = serializers.serialize('json', anns)

    return HttpResponse(data, mimetype='application/json')

def add_comment(request, imgpk, annpk):
    if request.method != 'POST':
        return HttpResponse(status=403)

    img = get_object_or_404(Image, pk=imgpk)
    ann = get_object_or_404(Annotation, pk=annpk)
    form = AddCommentForm(request.POST)
    if form.is_valid():
        c = form.save(False)
        c.image = img
        c.annotation = ann
        c.save()
    return redirect('image', pk=imgpk)
