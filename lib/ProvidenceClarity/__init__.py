

class ProvidenceClarity(object):
	pass
	
	
class ProvidenceClarityBridge(object):

	pc = ProvidenceClarity()
		
	def __getattr__(self, key):
		if hasattr(pc, key):
			return getattr(pc, key)
		else:
			raise AttributeError("Providence/Clarity has no attribute or passthrough under the name '"+str(key)+"'.")
			
	def __setattr__(self, key, value):
		raise AttributeError("Cannot set arbitrary properties on the Providence/Clarity object.")

		
	def __delattr__(self, key):
		raise AttributeError("Cannot delete arbitrary properties on the Providence/Clarity object.")
	

AppBridge = ProvidenceClarityBridge()