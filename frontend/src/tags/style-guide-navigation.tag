<style-guide-navigation>
  <p each={sections}><a href="#{id}">{name}</a></p>
  <script>
    this.sections = [];

    setSections() {
      this.sections = [];

      // Sections are already in order.
      opts.sections.map(function(section) {
        this.sections.push({id: section['name'].split(',')[0],
                            name: section['name'].split(',')[1]});
      }.bind(this));
    }

    this.on('sections-updated', function() {
      this.setSections();
      this.update();
    });
  </script>
</style-guide-navigation>
