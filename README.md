# ostext-style-guide

Design Guide is an application used by OpenStax as a living style guide document for our book templates.

## Requirements
You will need the following properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) (with NPM)
* [Python 2.7](https://www.python.org/downloads/) or above

## Backend Installation (Content Entry)

1. `git clone <repository-url>` this repository
1. change into the new directory
1. run `./script/setup` to install all the dependencies
1. run `source ./scripts/venv/bin/activate && style-guide-codmark --help` to see help options

### Building JSON output file

1. Running `style-guide-codmark` will generate json files based on `config.yml` in `scripts/`

## Content Entry with Cod
1. Open `scripts/test/cod_documentation/style-guide.scss`
2. You will see Cod style comments and `@Markup` tags
```
/**
@Section
  Getting Started
  =========

  Lorem ipsum dolor sit amet, est ex dolore assueverit, nisl esse eum ad, nec sint assum ea.
  Vidit soleat no mea. Iusto tation mediocrem mea id, te forensibus appellantur eos, liber
  essent vituperatoribus ei pri. Nam offendit inciderint delicatissimi at, eum ne graeci
  inimicus. Eu nec error numquam probatus, nisl aeterno persecuti cu eum, magna nonumes
  dignissim est te.

  That's all, folks.

  @Markup
    @Type highlighted
    @Source blockquote-raw.html
  @Markup
    @Type highlighted
    @Source blockquote-cooked.html
  @Markup
    @Type styled
    @Source blockquote-cooked.html

  @Number '1.0.0'
  @Id #section-100
*/
```

3. Copy/paste this code block or edit it as needed. All Cod documentation goes inside of comments structured like above.

## Frontend Installation (application GUI)

1. `git clone <repository-url>` this repository (**if not done in Backend Installation above**)
1. run `./script/setup` (**if not done in Backend Installation above**)
2. run `./script/start`
  * This opens [http://localhost:8000](http://localhost:8000) in your browser.

To build the production files run `./script/build` or `./script/build --production` (production)
