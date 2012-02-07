import logging

from ProvidenceClarity.struct import ProvidenceClarityStructure

from ProvidenceClarity.struct.factory import SimpleStructFactory
from ProvidenceClarity.struct.factory import ComplexStructFactory
from ProvidenceClarity.struct.factory import ImmutableStructFactory


class SimpleStruct(object):
	
	''' Abstract base class for a simple structure used somewhere in Providence/Clarity. Mutable, serializable, and low-footprint. '''
	
	__slots__ = ['_schema']
	__metaclass__ = SimpleStructFactory

	def __init__(self, *args, **kwargs):

		''' Called to initiate a SimpleStruct. Should call super's init so that the NamedTuple can take args/kwargs and map them. '''
		
		# Clear slots (everything defaults to None)
		for p_name, p_type in self._schema.items():
			setattr(self, p_name, None)
		
		if len(args) > 0 or len(kwargs) > 0:
			for field, arg in zip(self.__slots__[0:len(args)], args):
				if isinstance(arg, self._schema[field]):
					setattr(self, field, arg)
				else:
					raise AttributeError, 'Type error encountered assigning value "'+str(arg)+'" to param name "'+str(field)+'" on struct "'+self.__class__.__name__+'". Expected: "'+str(self._schema[field])+'".'
					
			for k, v in kwargs.items():
				setattr(self, k, v)

	def __setattr__(self, name, value):
		
		''' Validates data type when setting an attribute, then passes it off to the descriptor created by __slots__. '''
		
		if name in self._schema.keys():
			
			if isinstance(self._schema[name], tuple):
				if isinstance(value, list) or value is None:
					if value is not None:
						for i in value:
							if not isinstance(i, self._schema[name][1]):
								raise AttributeError, "The specified list cannot be set because not all of the list members (index: "+str(value.index(i))+", value: '"+str(i)+"', type: '"+str(type(i).__name__)+"') are of the schema-defined type ('"+str(self._schema[name][1])+"')."
					super(SimpleStruct, self).__setattr__(name, value)
				else:
					raise AttributeError, "The specified property ('"+str(name)+"') cannot be set to the value ('"+str(value)+"') because a list of type ('"+str(self._schema[name][1])+"') is expected."
			
			else:
				if isinstance(value, self._schema[name]) or value is None:
					super(SimpleStruct, self).__setattr__(name, value)
				else:
					raise AttributeError, "The specified property ('"+str(name)+"') cannot be set because the value ('"+str(value)+"') does not match the type ('"+str(self._schema[name].__name__)+"') specified in the target SimpleStruct schema."					
		else:
			raise AttributeError, "The specified property ('"+str(name)+"') cannot be set because it is not specified in the target SimpleStruct schema."
		
	def __getitem__(self, name):
		
		''' Passthrough to attribute lookup to enable 'var = struct[key]' notation. '''
		
		return getattr(self, name)

	def __setitem__(self, name, value):
		
		''' Passthrough to attribute set to enable 'struct[key] = var' notation. '''
		
		setattr(self, name, value)
		
		
class ImmutableStruct(tuple, ProvidenceClarityStructure):
	pass
	

class ComplexStruct(dict, ProvidenceClarityStructure):
	pass