#!/usr/bin/env python

from setuptools import setup

setup(name='ostext_style_guide',
      version='1.0',
      description='An OpenStax textbook style guide generator',
      author='Derek Ford',
      author_email='gdf1@rice.edu',
      license='MIT',
      packages=['ostext_style_guide_scripts'],
      install_requires=[
        'Jinja2',
        'pyyaml',
        'Pygments',
        'jsonpickle',
        'markdown',
        'subprocess32',
      ],
      entry_points={
          'console_scripts': ['style-guide-codmark=ostext_style_guide_scripts.style_guide_codmark:main'],
      },
      zip_safe=False
    )
