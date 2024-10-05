export class colorMenuClass extends FormApplication {
    constructor(sentObject) {
      super();
      this.sentObject = sentObject
    }
    
    static get defaultOptions() {
        let theme = game.settings.get('koblike', 'theme')
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['form', 'colorMenu', 'koblike', theme],
        popOut: true,
        template: `systems/koblike/templates/actor/parts/skill-colors.hbs`,
        id: 'colorMenu',
        title: 'Skill Color Menu',
        width:"auto",
        height:"auto",
        resizable: true
      });
      
  
    }
    getData() {
      return {config: game.settings.get('koblike', 'skillsList'), skills:this.sentObject.system.skills}
    }
    activateListeners(html) {
      super.activateListeners(html);

    }
  
    async _updateObject(event, formData) {
      let obj = {}
      Object.entries(formData).forEach( ([key,value]) => {
        obj[key] =  {color: value}
       this.sentObject.update({'system.skills': obj})
      })
    }
  }
  window.colorMenuClass = colorMenuClass