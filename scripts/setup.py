#!/usr/bin/env python

from setuptools import setup

setup(name='ostext_style_guide',
      version='1.0',
      description='An OpenStax textbook style guide generator, based on KSS',
      author='Derek Ford',
      author_email='gdf1@rice.edu',
      license='MIT',
      packages=['ostext_style_guide_scripts', 'ostext_kss'],
      install_requires=[
        'Jinja2',
        'pyyaml',
        'Pygments',
        'jsonpickle',
      ],
      entry_points={
          'console_scripts': ['build-style-guide=ostext_style_guide_scripts.build_style_guide:main',
                              'style-guide-data=ostext_style_guide_scripts.style_guide_data:main'],
      },
      zip_safe=False
    )
