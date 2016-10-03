import os
from ostext_kss.comment import Comment
from ostext_kss.section import Section

class DoesNotExist(Exception):
  pass

class Parser(object):
  def __init__(self, *paths, **kwargs):
    self.paths = paths
    extensions = kwargs.pop('extensions', None)
    if extensions is None:
      extensions = ['.less', '.css', '.sass', '.scss']
    self.extensions = extensions

  @property
  def sections(self):
    if not hasattr(self, '_sections'):
      self._sections = self.parse()
    return self._sections

  def section(self, reference):
    try:
      return self.sections[reference]
    except KeyError:
      raise DoesNotExist('Section "%s" does not exist.' % reference)

  def parse(self):
    sections = {}
    for filename in self.find_files():
      parser = Comment(filename)
      for comment in parser.comments:
        section = Section(comment, os.path.basename(filename))
        if section.section:
          sections[section.section] = section
    return sections

  def find_files(self):
    for path in self.paths:
      for subpath, dirs, files in os.walk(path):
        for filename in files:
          (name, ext) = os.path.splitext(filename)
          if ext in self.extensions:
            yield os.path.join(subpath, filename)
