from ndb import model
from google.appengine.ext import db


class ProvidenceClarityModel(object):

    """ Root, master, non-polymorphic data model. Everything lives under this class. """
    
    def _getModelPath(self,seperator=None):

        path = [i for i in str(self.__module__+'.'+self.__class__.__name__).split('.')]

        if seperator is not None:
            return seperator.join(path)

        return path

    def _getClassPath(self, seperator=None):

        if hasattr(self, '__class_hierarchy__'):
            path = [cls.__name__ for cls in self.__class_hierarchy__]
        
            if seperator is not None:
                return seperator.join(path)
            return path
        else:
            return []


class Model(db.Model, ProvidenceClarityModel):
	pass
	
	
class NDBModel(model.Model, ProvidenceClarityModel):
	pass