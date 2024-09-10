import MappingField from "../data/fields/mappingfield.js";
export default class koblikeActorBase extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = {};
    
    schema.skills = new MappingField(new fields.SchemaField({
      /*value: new fields.StringField({
        required: true,  initial: "1d4x"
      })*/
        value: new fields.NumberField({ ...requiredInteger, initial: 1, min: 1, max: 6 })
    }), {
      initialKeys: game.settings.get('koblike', 'skillsList'),
      initialKeysOnly: true
    })
  
    schema.biography = new fields.StringField({ required: true, blank: true }); // equivalent to passing ({initial: ""}) for StringFields

    return schema;
  }
}
