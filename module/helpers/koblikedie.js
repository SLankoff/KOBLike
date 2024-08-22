export default class koblikeDie extends Die {
    //Listen, I probably didn't have to lift 80% of this straight from Foundry...
    async explode(modifier, {recursive=true}={}) {
      if (!game.settings.get('koblike', 'explodeUpgrades')) {
          super.explode(modifier, {recursive=true}={})
      }
      else {

        // Match the "explode" or "explode once" modifier
        const rgx = /xo?([0-9]+)?([<>=]+)?([0-9]+)?/i;
        const match = modifier.match(rgx);
        if ( !match ) return false;
        let [max, comparison, target] = match.slice(1);
    
        // If no comparison or target are provided, treat the max as the target value
        if ( max && !(target || comparison) ) {
          target = max;
          max = null;
        }
    
        // Determine target values
        target = Number.isNumeric(target) ? parseInt(target) : this.faces;
        comparison = comparison || "=";
    
        // Determine the number of allowed explosions
        max = Number.isNumeric(max) ? parseInt(max) : null;
    
        // Recursively explode until there are no remaining results to explode
        let checked = 0;
        const initial = this.results.length;
        while ( checked < this.results.length ) {
          const r = this.results[checked];
          checked++;
          if ( !r.active ) continue;
    
          // Maybe we have run out of explosions
          if ( (max !== null) && (max <= 0) ) break;
    
          // Determine whether to explode the result and roll again!
          if ( foundry.dice.terms.DiceTerm.compareResult(r.result, comparison, target) ) {
            r.exploded = true;
            this.options.rollOrder = this._root.dice.length
              //Upgrade the dice type! Current iteration only looks once, consider adding to the iteration the amount of times?
              let map = {4: 6, 6: 8, 8: 10, 10: 12, 12: 20, 20: 20}
              target = map[this.faces]
              let newmatch = foundry.dice.terms.DiceTerm.matchTerm(`1d${map[this.faces]}x`)
              let plus = new foundry.dice.terms.OperatorTerm({operator: "+"})
              newmatch = foundry.dice.terms.DiceTerm.fromMatch(newmatch)
              newmatch.options.rollOrder = this._root.dice.length + 1
              this._root.terms.push(plus)
              this._root.terms.push(newmatch)
              this._root._evaluated = false
              await this._root.roll()
              //This is brute force. Note that any numeric operators don't get factored in here.
              this._root.options.explodedTotal =  newmatch.total + (!this._root.options.explodedTotal ? 0 : this._root.options.explodedTotal)

              Hooks.call("koblikeExplodeUpgrade", this, this._root, {previous:this.faces, upgrade:target})
            if ( max !== null ) max -= 1;
          }
    
          // Limit recursion
          if ( !recursive && (checked === initial) ) break;
          if ( checked > 1000 ) throw new Error("Maximum recursion depth for exploding dice roll exceeded");
        }
      }
    }
}

export class koblikeRoll extends Roll {
  async _evaluate(options={}) {
    // If the user has configured alternative dice fulfillment methods, prompt for the first pass of fulfillment here.
    let resolver;
    const { allowInteractive, minimize, maximize } = options;
    if ( !this._root && (allowInteractive !== false) && (maximize !== true) && (minimize !== true) ) {
      resolver = new this.constructor.resolverImplementation(this);
      this._resolver = resolver;
      await resolver.awaitFulfillment();
    }

    const ast = CONFIG.Dice.parser.toAST(this.terms);
    this._total = await this._evaluateASTAsync(ast, options);

   if (this.options.explodedTotal) {
    this._total = this.options.explodedTotal + this._total
   }
    resolver?.close();
    return this;
  }
 
    

}