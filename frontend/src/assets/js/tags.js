'use strict';

import riot from 'riot';
import lunr from 'lunr';

riot.tag2('raw',
  ``,
  '', '',
  function(opts) {
    this.root.innerHTML = opts.content;
  }
);

riot.tag2('style-guide-navigation',

  `<ul class="menu-list">
    <li class="changelog"><a href="#0.0.0">v0.0.1</a></li>
    <li each="{section, i in sections}" class="{section.number}">
      <a href="#{section.number}">{section.name}</a>
    </li>
   </ul>`,

  '', '',
  function(opts) {
    this.sections = [];

    this.setSections = function() {
      this.sections = [];

      opts.sections.map(function(section) {
        this.sections.push({number: section['Number'],
                            name: section['Name'],
                            category: section['Category']});
      }.bind(this));
    }.bind(this)

    this.on('sections-updated', function() {
      this.setSections();
      this.update();
    });
  }
);

riot.tag2('style-guide-search',

  `<div class="control is-grouped">
    <p class="control is-expanded has-icon">
      <input class="input" ref="input" type="text" onkeyup="{search}" placeholder="Search for content, elements, layout, typography...">
      <span class="icon is-medium">
        <i class="fa fa-search"></i>
      </span>
    </p>
  </div>

  <div class="search-results menu">
    <ul class="menu-list sg-search-result">
     <li each={results} onclick="{reset}"><a href="#{number}"><span>in {category}</span>{name}</a></li>
    </ul>
  </div>`,

  '', '',
  function(opts) {
    this.results = [];

    this.search = (e) => {
      this.result_refs = opts.index.search(e.target.value);
      this.results = [];

      this.result_refs.map((result_ref) => {
        opts.sections.map((section) => {
          if (section['Number'] == result_ref.ref) {
            this.results.push({number: section['Number'],
                               name: section['Name'],
                               category: section['Category'],
                              // urlId: opts.sections.findIndex(x => x.Number==section['Number']),
                               urlId: section['id']});
          }
        })
      })
      this.update();
    }

    this.reset = (e) => {
      let category = e.currentTarget.childNodes[0].firstChild.textContent;
      let section = e.currentTarget.childNodes[0].lastChild.textContent;

      this.result = section + ' ' + category;
      this.results = [];
      this.refs.input.value = this.result;
      this.update();
    }
  }
);

riot.tag2('style-guide',

  `<nav class="side-nav menu">
    <!-- Left-side navigation of Style Guide sections -->
    <style-guide-navigation class="sg-navigation" sections={sections}></style-guide-navigation>
  </nav>
  <main class="main section">
    <div class="container">
      <!-- Search elements -->
      <style-guide-search class="search" index={index} sections={sections}></style-guide-search>
      <style-guide-sections></style-guide-sections>
    </div>
  </main>`,

  '', '',
  function(opts) {
    this.sections = [];

    this.resetSearchIndex = function() {
      this.index = lunr(function() {
        this.field('name', {boost:10});
        this.field('description', {boost:6});
        this.field('category');
        this.ref('number');
      });
    }.bind(this)

    this.setSections = function(data) {

      this.sections = data;

      this.resetSearchIndex();

      this.sections.map(function(section) {
        this.index.add({
          description: section['description'],
          name: section['Name'],
          id: section['Id'],
          markup: section['Markup'],
          number: section['Number'],
          category: section['Category']
        });
      }.bind(this));
      this.update();
      this.tags['style-guide-navigation'].trigger('sections-updated');
    }.bind(this)

    opts.model.on('updated', function(data) {
      this.setSections(data);
    }.bind(this));
  }
);

riot.tag2('style-guide-sections',
  `
  <!-- Style Guide section data -->
  <section id="{opts.Number}" class="section">
    <div class="columns">
      <div class="column {is-three-quarters-desktop: hasSubSection} is-12-tablet">
        <div class="content">
          <h1 class="title is-2">{ opts.Name }</h1>
          <raw content="{ opts.description }"/>
          <div class="sg-html-example"><p>Raw HMTL</p>{raw_html}</div>
          <div class="sg-html-example"><p>Cooked HTML</p>{cooked_html}</div>
          <div class="sg-css-example"><p>Rule Set CSS</p>{rule_set}</div>
        </div>
      </div>
      <div class="column is-hidden-touch {is-hidden-desktop: !hasSubSection}">
        <h3>In this section</h3>
        <ul>
        <li each={subSection}><a href="#{parent.opts.Number}/{headingID}">{title}</a></li>
        </ul>
      </div>
    </div>
  </section>`,
  '', '',
  function(opts) {
  this.subSection = [];
  this.hasSubSection = true;

  this.setID = function() {
    for (var i=0; i < this.root.getElementsByTagName('h2').length; i++ ) {
      this.root.getElementsByTagName('h2')[i].id = 'heading' + i;
    }
  }

  this.setSubSection = function() {
    this.subSection = [];

    for (let i in opts.subSection) {
      this.subSection.push({ title: opts.subSection[i],
                                id: opts.id,
                                headingID: `heading${i}`});
    }

    if (this.subSection.length == 0) {
      this.hasSubSection = false;
    }
  }.bind(this)

  this.on('mount', function() {
    this.setSubSection();
    this.setID();
    this.update();
  });
}
);
