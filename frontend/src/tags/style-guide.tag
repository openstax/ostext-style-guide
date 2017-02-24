<style-guide>
  <nav class="side-nav menu is-hidden-touch menu">
  <!-- Left-side navigation of Style Guide sections -->
    <ul class="menu-list">
      <style-guide-navigation class="sg-navigation" sections={sections}></style-guide-navigation>
    </ul>
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
  </main>
  <script>
    this.sections = [];

    resetSearchIndex() {
      this.index = lunr(function() {
        this.field('name', {boost:10});
        this.field('description', {boost:6});
        this.ref('id');
      });
    }

    setSections(data) {
      // This sort function is kind of silly, but simple.
      // It only supports numbering in the form of 0.0.0
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

      // Section data has been changed, so update the search index.
      this.resetSearchIndex();

      this.sections.map(function(section) {
        this.index.add({
          id: section['name'].split(',')[0],
          name: section['name'].split(',')[1],
          description: section['description']
        });
      }.bind(this));

      // Section data has been changed, so update the tags.
      this.update();
      this.tags['style-guide-navigation'].trigger('sections-updated');
    }

    // This request is made asynchronously in the <head>
    // of the main html chunk in order to load JSON data quickly.
    json_request.then(
      // success
      function(data, xhr) {
        this.setSections(data);
      }.bind(this),
      // error
      function(data, xhr) {
        console.error(data, xhr.status);
      }
    );
  </script>
</style-guide>
