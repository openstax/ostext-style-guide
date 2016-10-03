#!/usr/bin/env python

from setuptools import setup

setup(name='ostext_style_guide',
      version='1.0',
      description='An OpenStax textbook style guide generator, based on KSS',
      author='Derek Ford',
      author_email='gdf1@rice.edu',
      license='MIT',
      packages=['ostext_style_guide', 'ostext_kss'],
      install_requires=[
        'Jinja2',
        'pyyaml',
        'Pygments',
      ],
      entry_points={
          'console_scripts': ['build-style-guide=ostext_style_guide.build_style_guide:main'],
      },
      zip_safe=False
    )
