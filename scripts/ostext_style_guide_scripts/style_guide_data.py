from __future__ import print_function
import ostext_style_guide_scripts
from ostext_kss import Parser
import yaml
import argparse
import sys
import jsonpickle

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
    raise SystemExit, 1

  styleguide = Parser(config["documentation_path"])
  styleguide_sections = []
  for section_name in styleguide.sections:
    section = styleguide.section(section_name)
    styleguide_sections.append({'name': section_name,
                                'description': section.description,
                                'raw_html': section.raw_html,
                                'cooked_html': section.cooked_html,
                                'rule_set': section.rule_set})

  style_guide_file = open("%s/%s" % (config["style_guide_path"], config["style_guide_data"]), 'w')
  style_guide_file.truncate()
  style_guide_file.write(jsonpickle.encode(styleguide_sections))
  style_guide_file.close()
