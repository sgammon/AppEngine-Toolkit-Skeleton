# -*- coding: utf-8 -*-

''' main.py - everything starts here. '''

import os

try:
    import bootstrap
    bootstrap.AppBootstrapper.prepareImports()  # fix imports
except ImportError:
    pass

from apptools import dispatch


def main(environ=None, start_response=None):

    ''' INCEPTION! :) '''

    return dispatch.gateway(environ, start_response)

if __name__ == '__main__':
    main()
