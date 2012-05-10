from ProvidenceClarity.struct.config import Config
from ProvidenceClarity.struct.core import UtilStruct as Struct


class DictProxy(Struct):
	
	''' Handy little object that takes a dict and makes it accessible via var[item] and var.item formats. Also handy for caching. '''
	
	## Init
	def fillStructure(self, struct=None, **kwargs):
		if struct is not None:
			if isinstance(struct, dict):
				for k, v in struct.items():
					setattr(self, k, v)
					
			elif isinstance(struct, list):
				for k, v in struct:
					setattr(self, k, v)
		if len(kwargs) > 0:
			for k, v in kwargs.items():
				setattr(self, k, v)
			
	def __getitem__(self, name):
		if name in self.__dict__:
			return getattr(self, name)
		else:
			raise AttributeError
		
	def __setitem__(self, name, value):
		setattr(self, name, value)
			
	def __delitem__(self, name):
		if name in self.__dict__:
			del self.__dict__[name]
		else:
			raise AttributeError
			
	def __contains__(self, name):
		return name in self.__dict__
			
	## Utiliy Methods
	def items(self):
		return [(k, v) for k, v in self.__dict__.items()]


class ObjectProxy(Struct):
	
	''' Same handy object as above, but stores the entries in an _entries attribute rather than the class dict.  '''
	
	_entries = {}
	
	## Init
	def fillStructure(self, struct=None, **kwargs):
		if struct is not None:
			if isinstance(struct, dict):
				for k, v in struct.items():
					self._entries[k] = v
			elif isinstance(struct, list):
				for k, v in struct:
					self._entries[k] = v
		if len(kwargs) > 0:
			for k, v in kwargs.items():
				self._entries[k] = v
			
	def __getitem__(self, name):
		if name in self._entries:
			return self._entries[name]
		else:
			raise KeyError
		
	def __delitem__(self, name):
		if name in self._entries:
			del self._entries[name]

	def __getattr__(self, name):
		return self._entries.get(name)
		
	def __contains__(self, name):
		return name in self._entries
		
	def __delattr__(self, name):
		if name in self._entries:
			del self._entries[name]
			
	## Utiliy Methods
	def items(self):
		return [(k, v) for k, v in self._entries.items()]
		

class CallbackProxy(ObjectProxy):

	''' Handy little object that takes a dict and makes it accessible via var[item], but returns the result of an invoked callback(item). '''
	
	callback = None

	def __init__(self, callback, struct=None, **kwargs):
		
		self.callback = callback

		if struct is not None:
			self.fillStructure(struct)
		else:
			if len(kwargs) > 0:
				self.fillStructure(**kwargs)

	def __getitem__(self, name):
		if name in self._entries:
			return self.callback(self._entries.get(name))
		else:
			raise KeyError
		
	def __getattr__(self, name):
		return self.callback(self._entries.get(name))

		
class ConfigurableStruct(object):
	
	''' Implements a pattern for a configurable object (manages config parameters, can load and rebind at runtime). '''

	config = {}
	
	def __init__(self):
		self.config = Config()
	
	def bind_config(self, config={}, **kwargs):
		if isinstance(config, dict) and len(config) > 0:
			self.config = config
		if len(kwargs) > 0:
			for k, v in kwargs.items():
				self.config[k] = v
		return self
				
	def set_config(self, name=None, value=None, **kwargs):
		if name is not None:
			self.config[name] = value
		if len(kwargs) > 0:
			for key, value in kwargs.items():
				self.config[key] = value
				
	def get_config(self, key=None, default=KeyError):
		if key is None:
			return _config
		else:
			if key in self.config:
				return key
			if isinstance(default, Exception):
				raise default
			else:
				return default
				
				
class SerializableStruct(object):
	
	''' Implements an object that can be normalized into a basic type for later serialization. '''
	
	def normalize(self):
		raise NotImplementedError, "SerializableStruct subclasses must implement the normalize function."