from __future__ import print_function
import ostext_style_guide_scripts
from ostext_kss import Parser
import yaml
import argparse
import sys, os, io
import jsonpickle
import json
import markdown
import re

if os.name == 'posix' and sys.version_info[0] < 3:
  import subprocess32 as subprocess
else:
  import subprocess

extensions =  ['.less', '.css', '.sass', '.scss']

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

  cod_output = subprocess.check_output("cod {}".format(' '.join(file_paths)), shell=True)
  style_guide_json = json.loads(cod_output.decode('utf-8'), object_hook=process_json_markup)

  # SHIM FOR JSON FORMAT
  style_guide_data = []
  for _section in style_guide_json["Section"]:
    section = {}

    section_number = _section['Number']
    if ((section_number.startswith('"') and section_number.endswith('"')) or
        (section_number.startswith("'") and section_number.endswith("'"))):
      section_number = section_number[1:-1]

    section_title = re.search('<h1>(?P<title>[^<>]*)</h1>', _section['!text'])
    section_title = section_title.group('title') if (section_title) else ' '

    # Remove <h1>Title</h1> from section text.
    _section['!text'] = re.sub('<h1>[^<>]*</h1>', '', _section['!text'], 1)

    section['name'] = "{},{}".format(section_number, section_title)
    section['description'] = _section['!text']
    section['raw_html']    = ' '
    section['cooked_html'] = ' '
    section['rule_set']    = ' '

    style_guide_data.append(section)
  # /SHIM FOR JSON FORMAT

  style_guide_filename = "{}/{}".format(config["style_guide_path"], config["style_guide_data"])
  print("Writing style guide data to {}".format(style_guide_filename))
  try:
    style_guide_file = open(style_guide_filename, 'w')
    style_guide_file.truncate()
    style_guide_file.write(json.dumps(style_guide_data))
    style_guide_file.close()
  except IOError:
    print("Could not write JSON data.")
