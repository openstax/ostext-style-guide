import codecs
import re

single_line_re = re.compile(r'^\s*\/\/')
single_line_strip_re = re.compile(r'\s*\/\/')

multi_line_start_re = re.compile(r'^\s*\/\*')
multi_line_end_re = re.compile(r'.*\*\/')
multi_line_start_strip_re = re.compile(r'\s*\/\*')
multi_line_end_strip_re = re.compile(r'\*\/')
multi_line_middle_strip_re = re.compile(r'^(\s*\*+)')

preceding_white_space_re = re.compile(r'^\s*')

def is_single_line_comment(line):
  return single_line_re.match(line) is not None


def is_multi_line_comment_start(line):
  return multi_line_start_re.match(line) is not None

def is_multi_line_comment_end(line):
  if is_single_line_comment(line):
    return False
  return multi_line_end_re.match(line) is not None

def parse_single_line(line):
  return single_line_strip_re.sub('', line).rstrip()

def parse_multi_line(line):
  cleaned = multi_line_start_strip_re.sub('', line)
  return multi_line_end_strip_re.sub('', cleaned).rstrip()

def normalize(lines):
  cleaned = []
  indents = []

  for line in lines:
    line = multi_line_middle_strip_re.sub('', line)
    cleaned.append(line)
    match = preceding_white_space_re.match(line)
    if line:
      indents.append(len(match.group()))

  indent = min(indents) if indents else 0

  return '\n'.join([l[indent:] for l in cleaned]).strip()

class Comment(object):
  def __init__(self, filename):
    self.filename = filename

  def parse(self):
    comments = []
    current_comment = []
    inside_single_line_comment = False
    inside_multi_line_comment = False

    with codecs.open(self.filename, 'r', 'utf-8') as fileobj:
      for line in fileobj:
        # Parse single-line style
        if is_single_line_comment(line):
          parsed = parse_single_line(line)

          if inside_single_line_comment:
            current_comment.append(parsed)
          else:
            current_comment = [parsed]
            inside_single_line_comment = True

        # Parse multi-line style
        if is_multi_line_comment_start(line) or inside_multi_line_comment:
          parsed = parse_multi_line(line)

          if inside_multi_line_comment:
            current_comment.append(parsed)
          else:
            current_comment = [parsed]
            inside_multi_line_comment = True

        # End a multi-line comment if detected
        if is_multi_line_comment_end(line):
          inside_multi_line_comment = False

        # Store the current comment if we're done
        if is_single_line_comment(line) is False and inside_multi_line_comment is False:
          if current_comment:
            comments.append(normalize(current_comment))

          inside_single_line_comment = False
          current_comment = []

    return comments

  @property
  def comments(self):
    if not hasattr(self, '_comments'):
      self._comments = self.parse()
    return self._comments
