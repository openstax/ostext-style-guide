<style-guide-search>
  <div class="control is-grouped">
    <p class="control is-expanded has-icon">
      <input class="input" type="text" onkeyup={ search } placeholder="Search for content, elements, layout, typography...">
      <span class="icon is-medium">
        <i class="fa fa-search"></i>
      </span>
    </p>
  </div>

  <div class="search-results menu">
    <ul each={results} class="menu-list sg-search-result">
     <li><a href="#{id}">{name}</a></li>
    </ul>
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
