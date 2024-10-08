import koblikeActorBase from "./actor-base.mjs";

export default class koblikeCharacter extends koblikeActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    schema.injury = new fields.NumberField({...requiredInteger, initial: 0, min: 0, max: 3})
    schema.adversity = new fields.SchemaField({
      value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
      total: new fields.NumberField({ ...requiredInteger, initial: 0 })
    });
    schema.attributes = new fields.SchemaField({
      level: new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 1 })
      }),
    });

    // Iterate over ability names and create a new SchemaField for each.
   /*  schema.abilities = new fields.SchemaField(Object.keys(CONFIG.KOBLIKE.abilities).reduce((obj, ability) => {
      obj[ability] = new fields.SchemaField({
        value: new fields.NumberField({ ...requiredInteger, initial: 10, min: 0 }),
        mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
        label: new fields.StringField({ required: true, blank: true })
      });
      return obj;
    }, {})); */

    return schema;
  }

  prepareDerivedData() {
    // Loop through ability scores, and add their modifiers to our sheet output.
    /*for (const key in this.abilities) {
      // Calculate the modifier using d20 rules.
      this.abilities[key].mod = Math.floor((this.abilities[key].value - 10) / 2);
      // Handle ability label localization.
      this.abilities[key].label = game.i18n.localize(CONFIG.KOBLIKE.abilities[key]) ?? key;
    }*/
  }
  getRollData() {
    const data = {};
//Push skills to the top, specifically for initiative
    if (this.skills) {
      for (let [k,v] of Object.entries(this.skills)) {
        data[k] =  {
          value:`${CONFIG.KOBLIKE.skillLevels[v.value]}x`,
          bonus: v.bonus
      }
      }
    }
    return data
  }
}