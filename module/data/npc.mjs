import koblikeActorBase from "./actor-base.mjs";

export default class koblikeNPC extends koblikeActorBase {

  static defineSchema() {
    const fields = foundry.data.fields;
    const requiredInteger = { required: true, nullable: false, integer: true };
    const schema = super.defineSchema();
    
    return schema
  }

  prepareDerivedData() {
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