
class ProvidenceClarityStructure(object):
	
	platform = 'Providence/Clarity-v2.2-EMBEDDED-ALPHA'


class UtilStruct(ProvidenceClarityStructure):
	
	_type = None
	
	## Init -- Accept structure fill
	def __init__(self, struct=None, **kwargs):
		if struct is not None:
			self.fillStructure(struct)
		else:
			if len(kwargs) > 0:
				self.fillStructure(**kwargs)

	@classmethod
	def _type(cls):
		return cls._type
		
	@classmethod
	def serialize(cls):
		return self.__dict__
		
	@classmethod
	def deserialize(cls, structure):
		return cls(structure)
		
	def fillStruct(self, fill, **kwargs):
		if fill is not None:
			if isinstance(fill, dict):
				for k, v in fill.items():
					self._entries[k] = v
			elif isinstance(fill, list):
				for k, v in fill:
					self._entries[k] = v
		if len(kwargs) > 0:
			for k, v in kwargs.items():
				self._entries[k] = v