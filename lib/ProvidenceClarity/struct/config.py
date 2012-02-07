

class Config(object):
	
	_entries = {}

	def __getitem__(self, key):
		if key in self._entries:
			return self._entries[key]
		
	def __getattr__(self, key):
		if key in self._entries:
			return self._entries[key]
			
	def __setitem__(self, key, value):
		self._entries[key] = value
		
	def __setattr__(self, key, value):
		self._entries[key] = value