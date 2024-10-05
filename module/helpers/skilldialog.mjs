export class skillDialogClass extends FormApplication {
    constructor(sentObject) {
      super();
      this.sentObject = sentObject
    }
    
    static get defaultOptions() {
        let theme = game.settings.get('koblike', 'theme')
      return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ['form', 'skillDialog', 'koblike', theme],
        popOut: true,
        template: `systems/koblike/templates/actor/parts/skill-dialog.hbs`,
        id: 'skillDialog',
        title: `Skill Check`,
        width:400,
        height:"auto",
        resizable: true
      });
      
  
    }
    getData() {
      if (this.sentObject.skill.value == game.settings.get('koblike', 'initiative')) {
        this.sentObject.initiative = true
      }
      return this.sentObject
    }
    activateListeners(html) {
      super.activateListeners(html);

    }
  
    async _updateObject(event, formData) {
        console.log(formData)
        switch(event.submitter.name) {
          case 'adv':
            console.log('advantage')
            if (formData.isInitiative) {
              let contained = game.combat&&game.combat.combatants.filter(c=>{return c.actorId == this.sentObject.actor.id}).length > 0? true:false
              let modformula = 2+this.sentObject.formula.slice(1)
              let formula = `${modformula}khx${this.sentObject.bonus > 0? '+ '+this.sentObject.bonus : ""}${this.sentObject.bonusvalue? '+'+this.sentObject.bonusvalue: ""}`
              await this.sentObject.actor.rollInitiative({rerollInitiative:contained, createCombatants:contained?false:true, initiativeOptions:{formula: formula}})
              return
            }
            else {
            let label = game.settings.get('koblike', 'skillsList')[this.sentObject.skill.value] ? `Skill Check (Advantage) - ${game.settings.get('koblike', 'skillsList')[this.sentObject.skill.value]}` : 'Skill Check (Advantage)'
            let modformula = 2+this.sentObject.formula.slice(1)
                    let roll = Roll.create(`${modformula}khx${this.sentObject.bonus > 0? '+ '+this.sentObject.bonus : ""}${this.sentObject.bonusvalue? '+'+this.sentObject.bonusvalue: ""}`, this.sentObject.actor.getRollData())
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.sentObject.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
    }
            //stuff
            break;
          case 'dis':
            console.log('disadvantage')
            if (formData.isInitiative) {
              let contained = game.combat&&game.combat.combatants.filter(c=>{return c.actorId == this.sentObject.actor.id}).length > 0? true:false
              let modformula = 2+this.sentObject.formula.slice(1)
              let formula = `${modformula}klx${this.sentObject.bonus > 0? '+ '+this.sentObject.bonus : ""}${this.sentObject.bonusvalue? '+'+this.sentObject.bonusvalue: ""}`
              await this.sentObject.actor.rollInitiative({rerollInitiative:contained, createCombatants:contained?false:true, initiativeOptions:{formula: formula}})
              return
            }
            else {
            let label = game.settings.get('koblike', 'skillsList')[this.sentObject.skill.value] ? `Skill Check (Disadvantage) - ${game.settings.get('koblike', 'skillsList')[this.sentObject.skill.value]}` : 'Skill Check (Disadvantage)'
            let modformula = 2+this.sentObject.formula.slice(1)        
            let roll = Roll.create(`${modformula}klx${this.sentObject.bonus > 0? '+ '+this.sentObject.bonus : ""}${this.sentObject.bonusvalue? '+'+this.sentObject.bonusvalue: ""}`, this.sentObject.actor.getRollData())
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.sentObject.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
    }
            
            break;
            default:
              console.log('normal')
              if (formData.isInitiative) {
                let contained = game.combat&&game.combat.combatants.filter(c=>{return c.actorId == this.sentObject.actor.id}).length > 0? true:false
                let formula = `${this.sentObject.formula}x${this.sentObject.bonus > 0? '+ '+this.sentObject.bonus : ""}${this.sentObject.bonusvalue? '+'+this.sentObject.bonusvalue: ""}`
                await this.sentObject.actor.rollInitiative({rerollInitiative:contained, createCombatants:contained?false:true, initiativeOptions:{formula: formula}})
                return
              }
              else {
              let label = game.settings.get('koblike', 'skillsList')[this.sentObject.skill.value] ? `Skill Check - ${game.settings.get('koblike', 'skillsList')[this.sentObject.skill.value]}` : 'Skill Check'
                      let roll = Roll.create(`${this.sentObject.formula}x${this.sentObject.bonus > 0? '+ '+this.sentObject.bonus : ""}${this.sentObject.bonusvalue? '+'+this.sentObject.bonusvalue: ""}`, this.sentObject.actor.getRollData())
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.sentObject.actor }),
          flavor: label,
          rollMode: game.settings.get('core', 'rollMode'),
        });
      }
              //more stuff
              break;
        }
    }
  }
  window.skillDialogClass = skillDialogClass