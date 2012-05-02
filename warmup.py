# -*- coding: utf-8 -*-

'''

Warmup request handler - imports and caches a bunch of data to prepare for requests. Always responds with a 200 OK.

'''

## Get ready
import os
import sys
import bootstrap

bootstrap.AppBootstrapper.prepareImports()

## Libraries
try:
    import webob
    import jinja2
    import config
    import logging
    import webapp2
    import slimmer
    import protorpc
    import pipeline
    import mapreduce
    import webapp2_extras
    import wsgiref.handlers
except:
    pass

## GAE APIs
try:
    import google
    from google import appengine
    from google.appengine import api
    from google.appengine import ext
    from google.appengine.api import mail
    from google.appengine.api import users
    from google.appengine.api import images
    from google.appengine.api import runtime
    from google.appengine.api import urlfetch
    from google.appengine.api import memcache
    from google.appengine.api import datastore
    from google.appengine.api import taskqueue
except:
    pass

## GAE Ext
try:
    from google.appengine.ext import db
    from google.appengine.ext import gql
    from google.appengine.ext import search
except:
    pass

## Compiled templates
try:
    import templates
    import templates.compiled
    from templates.compiled import *
    from templates.compiled.core import *
    from templates.compiled.macros import *
    from templates.compiled.main import *
    from templates.compiled.snippets import *
except ImportError, e:
    logging.warning('Failed to import compiled templates path... skipping.')


def respond200():

    logging.debug('Warming up interpreter caches [CGI]...')

    print "HTTP/1.1 200 OK"
    print "Content-Type: text/plain"
    print ""
    print "WARMUP_SUCCESS"


class WarmupHandler(webapp2.RequestHandler):

    def get(self):

        logging.debug('Warming up interpreter caches [WSGI]...')
        self.response.out.write("Warmup succeeded.")


class StartHandler(webapp2.RequestHandler):

    def get(self):
        logging.debug('Warming up interpreter caches for backend [WSGI]...')
        self.response.out.write("Backend startup succeeded.")


Warmup = webapp2.WSGIApplication([webapp2.Route('/_ah/warmup', WarmupHandler, name='warmup'), webapp2.Route('/_ah/start', StartHandler, name='start')])

if __name__ == '__main__':
    respond200()
