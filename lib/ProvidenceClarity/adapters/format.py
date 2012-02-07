from ProvidenceClarity.adapters import ProvidenceClarityAdapter


class ProvidenceClarityFormatAdapter(ProvidenceClarityAdapter):

	encoder = None
	decoder = None

	@classmethod
	def loadEncoder(cls, **kwargs):
		return cls().set_encoder(cls.encoder().bind_config(kwargs))

	@classmethod
	def loadDecoder(cls, **kwargs):
		return cls().set_decoder(cls.decoder().bind_config(kwargs))
		
	def encode(self, **kwargs):
		raise NotImplementedError, 'Encode method must be handled by adapter subclasses and cannot be called directly.'
		
	def decode(self, **kwargs):
		raise NotImplementedError, 'Decode method must be handled by adapter subclasses and cannot be called directly.'
		
	def set_encoder(self, encoder):
		self.encoder = encoder
		return self
	
	def set_decoder(self, decoder):
		self.decoder = decoder
		return self

	@classmethod
	def adapt_and_encode(cls, input_s, adapter_args={}, **kwargs):
		e = cls.loadEncoder(**adapter_args)
		return e.set_input(input_s).adapt_to_output(**kwargs).encode().get_output()
		
	@classmethod
	def decode_and_adapt(cls, input_s, adapter_args={}, **kwargs):
		e = cls.loadDecoder(**adapter_args)
		return e.set_input(input_s).decode().adapt_to_output(**kwargs).get_output()