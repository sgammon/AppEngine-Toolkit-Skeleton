# Natural Language Toolkit: Tokenizers
#
# Copyright (C) 2001-2010 NLTK Project
# Author: Edward Loper <edloper@gradient.cis.upenn.edu>
#		  Steven Bird <sb@csse.unimelb.edu.au> (minor additions)
# URL: <http://www.nltk.org/>
# For license information, see LICENSE.TXT

"""
Functions for X{tokenizing}, i.e., dividing text strings into
substrings.

DISABLED FOR COMPATIBILITY WITH GOOGLE APP ENGINE


from simple import *
from regexp import *
from punkt import *
from sexpr import *
from treebank import *
import nltk

__all__ = ['WhitespaceTokenizer', 'SpaceTokenizer', 'TabTokenizer',
		   'LineTokenizer', 'RegexpTokenizer', 'BlanklineTokenizer',
		   'WordPunctTokenizer', 'WordTokenizer', 'blankline_tokenize',
		   'wordpunct_tokenize', 'regexp_tokenize', 'word_tokenize',
		   'SExprTokenizer', 'sexpr_tokenize', 'line_tokenize',
		   'PunktWordTokenizer', 'PunktSentenceTokenizer',
		   'TreebankWordTokenizer', 'sent_tokenize', 'word_tokenize',
		   ]

try: import numpy
except ImportError: pass
else:
	from texttiling import *
	__all__ += ['TextTilingTokenizer']

"""