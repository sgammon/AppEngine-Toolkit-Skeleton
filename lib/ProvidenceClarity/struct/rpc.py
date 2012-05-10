from ProvidenceClarity.struct import attributes as a
from ProvidenceClarity.struct.core import ProvidenceClarityStructure


class RPCRequestStructure(ProvidenceClarityStructure):
	request = None
	client = None
	
	
class RPCResponseStructure(ProvidenceClarityStructure):
	response = None
	platform = None