import logging


## == For the 'Simple' struct type
class SimpleStructFactory(type):
	
	'''
	
		========================================================
		| Providence/Clarity Structures: Simple Struct Factory |
		========================================================
		This class creates a named tuple at runtime out of an easily-definable OOP-based 'Struct' schema. The
		SimpleStruct class uses this as a factory for producing the named, tailored structures at runtime.
	
		Advantages of the Simple Named Tuple:
		--1: Serializable without any special code
		--2: Can be unpacked, and is hashable (extends tuple)
		--3: Easier on memory than a full class inheritance path
	
	'''
	
	def __new__(cls, name, bases, _dict, _struct={}):

		if object in bases and name == 'SimpleStruct':
			return type.__new__(cls, name, bases, _dict)
		
		else:
			## Compute fields
			_fields = [(k, v) for k, v in filter(lambda x: x[0][0] != '_' and True or False, _dict.items())]

			## Create slots and schema properties
			_struct['__slots__'] = [str(k) for k, v in _fields]
			_struct['_schema'] = dict(_fields)
			
			## Generate rewritten Struct
			return type.__new__(cls, name, bases, _struct)
			

## == For the 'Immutable' struct type
class ImmutableStructFactory(type):

	'''

		===========================================================
		| Providence/Clarity Structures: Immutable Struct Factory |
		===========================================================
		This class creates a named tuple at runtime out of an easily-definable OOP-based 'Struct' schema. The
		SimpleStruct class uses this as a factory for producing the named (immutable) tuples at runtime.

		Advantages of the Simple Named Tuple:
		--1: Serializable without any special code
		--2: Can be unpacked, and is hashable (extends tuple)
		--3: Easier on memory than a full class inheritance path

	'''

	def __new__(cls, name, bases, _dict):

		if object in bases and name == 'SimpleStruct':
			return type.__new__(cls, name, bases, _dict)

		else:
			## Compute fields
			_fields = [(k, v) for k, v in filter(lambda x: x[0][0] != '_' and True or False, _dict.items())]
			
			## Create slots and schema properties
			_struct = {
				'_schema': _fields,
				'__slots__': [str(k) for k, v in _fields]
			}
			
			## Generate rewritten Struct
			return type.__new__(cls, name, bases, _struct)


## == For the 'Complex' struct type
class ComplexStructFactory(type):

	'''
	
		=====================================================
		| Providence/Clarity Structures: Complex Struct Factory |
		=====================================================
		This class creates a modified dictionary at runtime out of an easily-definable OOP-based 'Struct'
		schema. The ComplexStruct class uses this as a factory for producing the dictionary at runtime.
	
		Advantages of the Complex Dictionary:
		--1: Properties can be accessed with dot or subscript syntax
		--2: Properties can be defined at runtime in the constructor
		--4: Resulting objects can have methods and properties (like an object)
	
	'''
	
	pass