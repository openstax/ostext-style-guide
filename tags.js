riot.tag2('style-guide-navigation', '<p each="{sections}"><a href="#{id}">{name}</a></p>', '', '', function(opts) {
    this.sections = [];

    this.setSections = function() {
      this.sections = [];

      console.log(opts.sections);
      console.log(opts.sections.length);

      var len = opts.sections.length;
      for(var i = 0; i < len; i++) {
        var section = opts.sections[i];
        this.sections.push({id: section['name'].split(',')[0],
                            name: section['name'].split(',')[1]});
      }
    }.bind(this)
    this.on('sections-updated', function() {
      this.setSections();
      this.update();
    });
});
riot.tag2('style-guide-search', '<div class="sg-search-box-container"> <div class="sg-search-box"><input class="sg-search-input" type="text" onkeyup="{search}"></input></div> </div> <div class="sg-search-results"> <div each="{results}" class="sg-search-result"> <a href="#{id}">{name}</a> </div> </div>', '', '', function(opts) {

  this.results = [];

  this.search = function(e) {
   this.result_refs = opts.index.search(e.target.value);
   this.results = [];
   for (result in this.result_refs) {
     var len = opts.sections.length;
     for(var i = 0; i < len; i++) {
       var section = opts.sections[i];
       if (section['name'].split(',')[0] == this.result_refs[result].ref) {
         this.results.push({id: section['name'].split(',')[0],
                            name: section['name'].split(',')[1]});
       }
     }
   }
   this.update();
  }.bind(this)
});
riot.tag2('style-guide', '<style-guide-navigation class="sg-navigation" sections="{sections}"></style-guide-navigation> <style-guide-sections class="sg-sections"> <style-guide-search class="sg-search" index="{index}" sections="{sections}"></style-guide-search> <section each="{sections}" id="{name.split(\',\')[0]}" class="sg-section"> <h2>{name.split(\',\')[1]}</h2> <p>{description}</p> <div class="sg-html-example"><p>Raw HMTL</p>{raw_html}</div> <div class="sg-html-example"><p>Cooked HTML</p>{cooked_html}</div> <div class="sg-css-example"><p>Rule Set CSS</p>{rule_set}</div> </section> </style-guide-sections>', '', '', function(opts) {
    this.sections = [];

    this.resetSearchIndex = function() {
      this.index = lunr(function() {
        this.field('name', {boost:10});
        this.field('description', {boost:6});
        this.ref('id');
      });
    }.bind(this)

    this.setSections = function(data) {

      this.sections = data.sort(function(a,b) {
        var va = a['name'].split(',')[0].split('.');
        var vb = b['name'].split(',')[0].split('.');
        for (var i = 0; i < va.length; ++i) {
          va[i] = Number(va[i]);
        }
        for (var i = 0; i < vb.length; ++i) {
          vb[i] = Number(vb[i]);
        }
        if (va[0] > vb[0]) return 1;
        if (va[0] < vb[0]) return -1;
        if (va[1] > vb[1]) return 1;
        if (va[1] < vb[1]) return -1;
        if (va[2] > vb[2]) return 1;
        if (va[2] < vb[2]) return -1;

        return 0;
      });

      this.resetSearchIndex();

      var len = this.sections.length;
      for(var i = 0; i < len; i++) {
        var section = this.sections[i];
        this.index.add({
          id: section['name'].split(',')[0],
          name: section['name'].split(',')[1],
          description: section['description']
        });
      }

      this.update();
      this.tags['style-guide-navigation'].trigger('sections-updated');
    }.bind(this)

    json_request.then(

      function(data, xhr) {
        this.setSections(data);
      }.bind(this),

      function(data, xhr) {
        console.error(data, xhr.status);
      }
    );
});