<style-guide-navigation>
  <p each={sections}><a href="#{id}">{name}</a></p>
  <script>
    this.sections = [];

    setSections() {
      this.sections = [];

      console.log(opts.sections);
      console.log(opts.sections.length);

      // Sections are already in order.
      var len = opts.sections.length;
      for(var i = 0; i < len; i++) {
        var section = opts.sections[i];
        this.sections.push({id: section['name'].split(',')[0],
                            name: section['name'].split(',')[1]});
      }
    }
    this.on('sections-updated', function() {
      this.setSections();
      this.update();
    });
  </script>
</style-guide-navigation>