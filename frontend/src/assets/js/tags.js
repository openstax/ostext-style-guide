'use strict';

import riot from 'riot';
import lunr from 'lunr';

riot.tag2('style-guide-navigation',

  `<ul class="menu-list">
    <li class="changelog"><a href="#0.0.0">v0.0.1</a></li>
    <li each="{sections}" class="{id}">
      <a href="#{id}">{name}</a>
    </li>
   </ul>`,

  '', '',
  function(opts) {
    this.sections = [];

    this.setSections = function() {
      this.sections = [];

      opts.sections.map(function(section) {
        this.sections.push({id: section['name'].split(',')[0],
                            name: section['name'].split(',')[1]});
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
     <li each={results} onclick="{reset}"><a href="#{id}">{name}</a></li>
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
          if (section['name'].split(',')[0] == result_ref.ref) {
            this.results.push({id: section['name'].split(',')[0],
                               name: section['name'].split(',')[1]});
          }
        })
      })
      this.update();
    }

    this.reset = (e) => {
      this.result = '';
      this.result = e.target.text;
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
      <!-- Style Guide section data -->
      <style-guide-sections class="sg-sections">
        <!-- Search elements -->
        <style-guide-search class="search" index={index} sections={sections}></style-guide-search>

        <section each={sections} id="{name.split(',')[0]}" class="section">
          <div class="columns">
            <div class="column is-three-quarters-desktop is-12-tablet">
              <div class="content">
                <h2 class="title is-2">{name.split(',')[1]}</h2>
                <p>{description}</p>
                <div class="sg-html-example"><p>Raw HMTL</p>{raw_html}</div>
                <div class="sg-html-example"><p>Cooked HTML</p>{cooked_html}</div>
                <div class="sg-css-example"><p>Rule Set CSS</p>{rule_set}</div>
              </div>
            </div>
            <div class="column is-hidden-touch">
            <h3>In this section</h3>
            </div>
          </div>
        </section>
      </style-guide-sections>
    </div>
  </main>`,

  '', '',
  function(opts) {
    this.sections = [];

    this.resetSearchIndex = function() {
      this.index = lunr(function() {
        this.field('name', {boost:10});
        this.field('description', {boost:6});
        this.ref('id');
      });
    }.bind(this)

    this.setSections = function(data) {

      this.sections = data;

      this.resetSearchIndex();

      this.sections.map(function(section) {
        this.index.add({
          id: section['name'].split(',')[0],
          name: section['name'].split(',')[1],
          description: section['description']
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
