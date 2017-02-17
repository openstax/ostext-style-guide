from __future__ import print_function
import ostext_style_guide_scripts
from ostext_kss import Parser
import yaml
import argparse
import sys
from jinja2 import Environment, FileSystemLoader
from pygments import highlight
from pygments.lexers import guess_lexer
from pygments.formatters import HtmlFormatter

formatter = HtmlFormatter(cssclass='source-highlight')

def highlight_source(source):
  if not source: return ''
  lexer = guess_lexer(source)
  return highlight(source, lexer, formatter)

def main():
  config_file = "./config.yml"
  parser = argparse.ArgumentParser(description='Create a Style Guide from documentation comments.', formatter_class=argparse.RawTextHelpFormatter)
  parser.add_argument("--config", help="""
A configuration file which consists of the following settings -

"template_path" - Path containing Jinja2 template files.
"documentation_path" - Path containing documentation comments in LESS/SASS/SCSS/CSS files.
"style_guide_template" - The template file used to render a Style Guide.
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

  env = Environment(loader=FileSystemLoader(config["template_path"]))
  env.filters['highlight'] = highlight_source
  template = env.get_template(config["style_guide_template"])
  styleguide = Parser(config["documentation_path"])
  styleguide_sections = []
  for section in styleguide.sections:
    styleguide_sections.append(styleguide.section(section))
  rendered_styleguide = template.render(sections=styleguide_sections)

  style_guide_file = open("%s/%s" % (config["style_guide_path"], config["style_guide_template"]), 'w')
  style_guide_file.truncate()
  style_guide_file.write(rendered_styleguide)
  style_guide_file.close()

  highlight_style_file = open("%s/highlight.css" % config["style_guide_path"], 'w')
  highlight_style_file.truncate()
  highlight_style_file.write(formatter.get_style_defs('.source-highlight'))
  highlight_style_file.close()
