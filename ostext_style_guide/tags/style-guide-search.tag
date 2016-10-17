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
  }
</style-guide-search>