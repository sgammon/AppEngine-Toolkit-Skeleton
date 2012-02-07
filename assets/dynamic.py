# -*- coding: utf-8 -*-
import webapp2
from project.models import ndb
from google.appengine.ext.ndb import blobstore
from google.appengine.api import datastore_errors


class StoredAsset(ndb.Model):

    filename = ndb.StringProperty()          # the stored asset's filename
    blob_ref = ndb.BlobKeyProperty()         # reference to blobstore object
    fast_storage = ndb.BooleanProperty()     # whether to use fast serving (for images) or cdn (for everything else)
    fast_storage_url = ndb.StringProperty()  # the location of the asset on CDN/fast storage


class DynamicAssetHandler(webapp2.RequestHandler):

    ''' Serves a blob by blobkey or reference from a StoredAsset. '''

    def get(self, action='serve', type=None, asset=None, extension=None):

        asset = self.request.get('ak', asset)
        asset = self.request.get('asset', asset)
        try:

            assert asset is not None

            ## Try to make a blobkey out of it
            try:
                blob_key = blobstore.BlobKey(asset)
                asset = blobstore.BlobInfo.get(blob_key)
                assert asset is not None

                dynamic_media = asset

            except (datastore_errors.BadValueError, AssertionError), e:
                ## So it's not a blob key. Try a StoredAsset.
                try:
                    asset_key = ndb.Key(urlsafe=asset)
                    asset = asset_key.get()
                    assert asset is not None

                    if asset.fast_storage:
                        dynamic_media = asset.fast_storage_url
                    else:
                        dynamic_media = blobstore.BlobInfo.get(asset.blob_ref)

                except (datastore_errors.BadValueError, AssertionError), e:
                    raise AssertionError(e)

            ## If we've made it this far, we have a valid asset blob or redirect URL
            if isinstance(dynamic_media, basestring):
                return self.redirect(dynamic_media)

        except AssertionError:
            self.response.write("404 - Asset not found.")
            return self.error(404)

        return self.response.out.write('Dynamic assets are not yet supported.')


DynamicAsset = webapp2.WSGIApplication([
    webapp2.Route('/assets/dynamic/<asset>.<extension>', DynamicAssetHandler, name='retrieve-asset-with-extension'),
    webapp2.Route('/assets/dynamic/<action>/<asset>.extention>', DynamicAssetHandler, name='retrieve-asset-with-action-with-extension'),
    webapp2.Route('/assets/<type>/dynamic/<asset>.<extension>', DynamicAssetHandler, name='retrieve-asset-with-type-with-extension'),
    webapp2.Route('/assets/<type>/dynamic/<action>/<asset>.<extension>', DynamicAssetHandler, name='retrieve-asset-with-type-with-action-with-extension')
])


def main(environ=None, start_response=None):
    if environ is not None and start_response is not None:
        ## Run in WSGI mode
        DynamicAsset(environ, start_response)
    else:
        DynamicAsset.run()

## Run in CGI-mode...
if __name__ == '__main__':
    main()
