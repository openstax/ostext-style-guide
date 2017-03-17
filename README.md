# ostext-style-guide
Design Guide is an application used by OpenStax as a living style guide document for our book templates and will eventually house style elements for all products

## Prerequisites

* Git
* Node.js (with NPM)
* Bower
* Python 2.7 or above

## Backend Installation (Content Entry)

1. `git clone <repository-url>` this repository
2. change into the new directory
3. Create python virtual environment `python -m virtualenv venv`
4. `cd scripts`
5. Source your venv `. venv/bin/activate`
6. Run `python setup.py develop`
7. Run `style-guide-codmark --help` to see help options
8. `style-guide-codmark` will generate json files based on `config.yml` in `scripts/`

## Content Entry with Cod
1. Open `scripts/test/cod_documentation/style-guide.scss`
2. You will see comments with the Cod
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
2. change into the new directory
3. Change to the `frontend` directory
4. `npm install`
5. Run `gulp`
6. Run `npm run build` or `gulp build --production` for minified dist files
