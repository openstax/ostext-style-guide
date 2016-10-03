import re, os, codecs

from ostext_kss.modifier import Modifier

CLASS_MODIFIER = '.'
PSEUDO_CLASS_MODIFIER = ':'
MODIFIER_DESCRIPTION_SEPARATOR = ' - '
EXAMPLE_START = 'Example:'
RAW_HTML_START = 'Raw HTML:'
COOKED_HTML_START = 'Cooked HTML:'
RULE_SET_START = 'Ruleset:'
REFERENCE_START = 'Section'

reference_re = re.compile(r'%s ([\d\w\.]+)' % REFERENCE_START)
optional_re = re.compile(r'\[(.*)\]\?')
multiline_modifier_re = re.compile(r'^\s+(\w.*)')

class Section(object):
  def __init__(self, comment=None, filename=None):
    self.comment = comment or ''
    self.filename = filename

  def parse(self):
    self._description_lines = []
    self._modifiers = []
    self._example_lines = []
    self._raw_html_lines = []
    self._cooked_html_lines = []
    self._rule_set_lines = []
    self._reference = None

    flags = dict.fromkeys(['in_example', 'in_modifiers', 'in_raw_html',
                           'in_cooked_html', 'in_rule_set'], False)

    for line in self.comment.splitlines():
      if line.startswith(CLASS_MODIFIER) or line.startswith(PSEUDO_CLASS_MODIFIER):
        flags['in_modifiers'] = True
        try:
          modifier, description = line.split(MODIFIER_DESCRIPTION_SEPARATOR)
        except ValueError:
          pass
        else:
          self._modifiers.append(Modifier(modifier.strip(), description.strip()))

      elif flags['in_modifiers'] and multiline_modifier_re.match(line):
        match = multiline_modifier_re.match(line)
        if match:
          description = match.groups()[0]
          last_modifier = self._modifiers[-1]
          last_modifier.description += ' {0}'.format(description)

      elif line.startswith(EXAMPLE_START):
        flags['in_example'] = True
        flags.update(dict.fromkeys(['in_modifiers', 'in_raw_html', 'in_cooked_html',
                                    'in_rule_set'], False))

      elif line.startswith(REFERENCE_START):
        flags.update(dict.fromkeys(['in_example', 'in_modifiers', 'in_raw_html',
                                    'in_cooked_html', 'in_rule_set'], False))
        match = reference_re.match(line)
        if match:
          self._reference = match.groups()[0].rstrip('.')
      elif line.startswith(RAW_HTML_START):
        flags['in_raw_html'] = True
        flags.update(dict.fromkeys(['in_example', 'in_modifiers', 'in_cooked_html',
                                    'in_rule_set'], False))
      elif line.startswith(COOKED_HTML_START):
        flags['in_cooked_html'] = True
        flags.update(dict.fromkeys(['in_example', 'in_modifiers', 'in_raw_html',
                                    'in_rule_set'], False))
      elif line.startswith(RULE_SET_START):
        flags['in_rule_set'] = True
        flags.update(dict.fromkeys(['in_raw_html', 'in_cooked_html', 'in_modifiers',
                                    'in_example'], False))

      elif flags['in_example'] is True:
        self._example_lines.append(line)
      elif flags['in_raw_html'] is True:
        self._raw_html_lines.append(line)
      elif flags['in_cooked_html'] is True:
        self._cooked_html_lines.append(line)
      elif flags['in_rule_set'] is True:
        self._rule_set_lines.append(line)
      else:
        flags.update(dict.fromkeys(['in_modifiers', 'in_raw_html', 'in_cooked_html',
                                    'in_rule_set', 'in_example'], False))
        self._description_lines.append(line)

      # Parse files for raw_html, cooked_html, and rule_set
      line = line.replace(RAW_HTML_START, '')\
                 .replace(COOKED_HTML_START, '')\
                 .replace(RULE_SET_START, '').strip()
      if os.path.isfile(line):
        file_lines = []
        with codecs.open(line, 'r', 'utf-8') as fileobj:
          for file_line in fileobj:
            file_lines.append(file_line)
        if flags['in_raw_html']:
          self._raw_html_lines += file_lines
        if flags['in_cooked_html']:
          self._cooke_html_lines += file_lines
        if flags['in_rule_set']:
          self._rule_set_lines += file_lines

    self._description = '\n'.join(self._description_lines).strip()
    self.add_example('\n'.join(self._example_lines).strip())

    #
    # If we have raw html and a rule set but no cooked html
    #   import cnx-easybake and use Oven('\n'.join(self._rule_set_lines))
    #

  @property
  def description(self):
    if not hasattr(self, '_description'):
      self.parse()
    return self._description

  @property
  def modifiers(self):
    if not hasattr(self, '_modifiers'):
      self.parse()
    return self._modifiers

  @property
  def example(self):
    if not hasattr(self, '_modifiers'):
      self.parse()
    return self._example

  @property
  def raw_html(self):
    if not hasattr(self, '_raw_html_lines'):
      self.parse()
    return '\n'.join(self._raw_html_lines).strip()

  @property
  def cooked_html(self):
    if not hasattr(self, '_cooked_html_lines'):
      self.parse()
    return '\n'.join(self._cooked_html_lines).strip()

  @property
  def rule_set(self):
    if not hasattr(self, '_rule_set_lines'):
      self.parse()
    return '\n'.join(self._rule_set_lines).strip()

  @property
  def section(self):
    if not hasattr(self, '_reference'):
      self.parse()
    return self._reference

  def add_example(self, example):
    self._example = optional_re.sub('', example).replace('$modifier_class', '')
    for modifier in self._modifiers:
      modifier.add_example(optional_re.sub(r'\1', example))
