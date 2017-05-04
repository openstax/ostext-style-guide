from __future__ import print_function
import sys, os, io
if os.name == 'posix' and sys.version_info[0] < 3:
  import subprocess32 as subprocess
else:
  import subprocess
import ostext_style_guide_scripts
import yaml
import argparse
import jsonpickle
import json
import markdown
import re

from pygments import highlight
from pygments.lexers import guess_lexer
from pygments.formatters import HtmlFormatter

from pyparsing import makeHTMLTags, replaceWith, withAttribute

spanOpen,spanClose = makeHTMLTags("span")
emptySpans = spanOpen.copy().setParseAction(withAttribute(empty=True))
removeSpans = emptySpans | spanOpen+spanClose
removeSpans.setParseAction(replaceWith(" "))

extensions =  ['.less', '.css', '.sass', '.scss']
markup_blocks = {}
formatter = HtmlFormatter(cssclass='source-highlight')

def highlight_source(source):
  if not source: return ''
  lexer = guess_lexer(source)
  return highlight(source, lexer, formatter)

def add_markup_block(block):
  markup_blocks[block["Id"]] = block

def find_files(paths):
  if isinstance(paths, str): paths = [paths]
  for path in paths:
    for subpath, dirs, files in os.walk(path):
      for filename in files:
        (name, ext) = os.path.splitext(filename)
        if ext in extensions:
          yield os.path.join(subpath, filename)

# Convert markdown inside "!text"
# Highlight markup inside @Markup @Source if @Type is highlighted.
# Convert raw markup to cooked markup if @Markup has @Type raw and @Cook is true.
def process_json_markup(obj):
  for key in obj.keys():
    if key == '!text':
      _markdown = obj[key]
      _html = markdown.markdown(_markdown)
      obj[key] = _html
  return obj

def main():
  config_file = "./config.yml"
  parser = argparse.ArgumentParser(description='Create a Style Guide JSON file from documentation comments.', formatter_class=argparse.RawTextHelpFormatter)
  parser.add_argument("--config", help="""
A configuration file which consists of the following settings -

"documentation_path" - Path containing documentation comments in LESS/SASS/SCSS/CSS files.
"style_guide_data" - The JSON filename to write Style Guide data to.
"style_guide_path" - The Path where the Style Guide will be stored.
""")
  args = parser.parse_args()
  if args.config:
    config_file = args.config
  try:
    config = yaml.safe_load(open(config_file))
  except IOError:
    print("The file %s does not exist." % config_file)
    raise SystemExit(1)


  file_paths = []
  print("Searching for documentation in ./{}".format(config["documentation_path"]))
  for file_path in find_files('./{}'.format(config["documentation_path"])):
    file_paths.append(file_path)
  print("Found: {}".format(' '.join(file_paths)))

  cod_output = subprocess.check_output("../frontend/node_modules/.bin/cod {}".format(' '.join(file_paths)), shell=True)
  style_guide_json = json.loads(cod_output.decode('utf-8'), object_hook=process_json_markup)


  # Parse chunks of markup to be included by reference.
  for _section in style_guide_json["Section"]:
    if 'Markup' in _section:
      _markup_blocks = _section['Markup']
      if not hasattr(_markup_blocks, '__iter__'):
        _markup_blocks = [_section['Markup'],]

      for _block in _markup_blocks:
        if all (_key in _block for _key in ('Id', 'Source', 'Type')):
          if os.path.exists("{}/{}".format(config["documentation_path"], _block['Source'])):
            add_markup_block(_block)
  for _section in style_guide_json["Section"]:
    if '!text' in _section:
      reg = re.compile(r'\[(?P<id>\#[^\[]+)\]')
      for match in reg.finditer(_section['!text']):
        reference_id = match.groupdict()['id']
        with open("{}/{}".format(config["documentation_path"],
                                 markup_blocks[reference_id]["Source"])) as src:
          _code_highlighted = "Type" in markup_blocks[reference_id] and markup_blocks[reference_id]["Type"] == "highlighted"
          _src = u"{}".format(removeSpans.transformString(highlight_source(src.read().decode('utf-8')))) if _code_highlighted else src.read().decode('utf-8')
          _section['!text'] = re.sub('<p>\[\#[^\[]+\]<\/p>', _src, _section['!text'], 1)
  print("Markup blocks found: {}".format(markup_blocks))

  style_guide_filename = "{}/{}".format(config["style_guide_path"], config["style_guide_data"])
  print("Writing style guide data to {}".format(style_guide_filename))
  try:
    style_guide_file = open(style_guide_filename, 'w')
    style_guide_file.truncate()
    style_guide_file.write(json.dumps(style_guide_json))
    style_guide_file.close()
  except IOError:
    print("Could not write JSON data.")
