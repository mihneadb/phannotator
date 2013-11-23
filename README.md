phannotator
===========

Web-based image annotator. School project.


`server` contains the base models and logic.
`frontend` contains the web bits that the client side consists of.

We may add an `api` app to make the client ajaxy ;).


install
=======

> virtualenv pybox
> source pybox/bin/activate
> pip install -r requirements.pip


run-server
==========

python manage.py syncdb
python manage.py runserver
