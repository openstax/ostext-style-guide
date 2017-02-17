<style-guide-search>
  <div class="sg-search-box-container">
    <div class="sg-search-box"><input class="sg-search-input" type="text" onkeyup={ search }></input></div>
  </div>
  <div class="sg-search-results">
    <div each={results} class="sg-search-result">
     <a href="#{id}">{name}</a>
    </div>
  </div>

  this.results = [];

  search(e) {
   this.result_refs = opts.index.search(e.target.value);
   this.results = [];

   // If a section number matches a search result reference
   // section number, add it to the list of search results.
   this.result_refs.map(function(result_ref) {
     opts.sections.map(function(section) {
       if (section['name'].split(',')[0] == result_ref.ref) {
         this.results.push({id: section['name'].split(',')[0],
                            name: section['name'].split(',')[1]});
       }
     }.bind(this));
   }.bind(this));

   this.update();
  }
</style-guide-search>