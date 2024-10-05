import koblikeItemBase from "./item-base.mjs";

export default class koblikeFeature extends koblikeItemBase {

      static defineSchema() {
        const fields = foundry.data.fields;
        const schema = super.defineSchema();
    
        //schema.subType = new fields.StringField({ required: true, blank: false, initial:game.settings.get('koblike', 'itemTypes').features[0], choices: game.settings.get('koblike', 'itemTypes').features})
    
        return schema;
      }
    


}