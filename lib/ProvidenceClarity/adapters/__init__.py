from ProvidenceClarity.struct.util import ConfigurableStruct


class ProvidenceClarityAdapter(ConfigurableStruct):
	
	''' Generalized, abstract interface for an adapter pattern. '''

	_input = None
	_output = None

	@classmethod
	def run(cls, input_s, adapter_config={}, **kwargs):
		a = cls.createAdapter(adapter_config)
		return a.set_input(input_s).adapt_to_output(**kwargs)

	@classmethod
	def createAdapter(cls, config={}):
		return cls().bind_config(config)
		
	def set_input(self, input_s):
		self._input = input_s
		return self
		
	def set_output(self, output_s):
		self._output = output_s
		return self
		
	def get_input(self):
		return self._input
		
	def get_output(self):
		return self._output
		
	def adapt_to_output(self, config={}):
		return self