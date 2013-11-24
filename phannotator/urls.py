from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.conf import settings

from frontend.views import IndexView, UploadView, ImageView


admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', IndexView.as_view(), name='index'),
    url(r'^upload/$', UploadView.as_view(), name='upload'),
    url(r'^image/(?P<pk>[0-9]+)$', ImageView.as_view(), name='image'),

    url(r'^comment/add/(?P<imgpk>[0-9]+)/(?P<annpk>[0-9]+)$', 'server.views.add_comment', name='add_comment'),

    # API // ajax
    url(r'^api/annotations/add$', 'server.views.add_annotation'),
    url(r'^api/annotations/get/(?P<pk>[0-9]+)$', 'server.views.get_annotations'),

    # MEDIA_URL = /imagedata/
    url(r'^imagedata/(?P<path>.*)$', 'django.views.static.serve',
        {'document_root': settings.MEDIA_ROOT}),

    url(r'^admin/', include(admin.site.urls)),
)

