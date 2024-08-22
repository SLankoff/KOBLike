export const KOBLIKE = {};

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */
KOBLIKE.abilities = {
  str: 'KOBLIKE.Ability.Str.long',
  dex: 'KOBLIKE.Ability.Dex.long',
  con: 'KOBLIKE.Ability.Con.long',
  int: 'KOBLIKE.Ability.Int.long',
  wis: 'KOBLIKE.Ability.Wis.long',
  cha: 'KOBLIKE.Ability.Cha.long',
};

KOBLIKE.skillLevels = {
  1: "1d4",
  2: "1d6",
  3: "1d8",
  4: "1d10",
  5: "1d12",
  6: "1d20"
}

KOBLIKE.abilityAbbreviations = {
  str: 'KOBLIKE.Ability.Str.abbr',
  dex: 'KOBLIKE.Ability.Dex.abbr',
  con: 'KOBLIKE.Ability.Con.abbr',
  int: 'KOBLIKE.Ability.Int.abbr',
  wis: 'KOBLIKE.Ability.Wis.abbr',
  cha: 'KOBLIKE.Ability.Cha.abbr',
};
export class skillsMenuClass extends FormApplication {
  constructor(sentObject) {
    super();
    this.sentObject = sentObject
  }
  
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['form', 'skillmenu'],
      popOut: true,
      template: `systems/koblike/templates/skillsMenu.hbs`,
      id: 'skillMenu',
      title: 'Skill Selection Menu',
    });
    

  }
  getData() {
    return game.settings.get('koblike', 'skillsList');
  }
  activateListeners(html) {
    super.activateListeners(html);
    //Handle new skill button
    html.on('click', '.item-create', async (ev) => {
      let newObj = {}
      newObj["temp"+html.find('.working-list').children().length] = "Skill Name Here!"
      let content = await renderTemplate('systems/koblike/templates/skillsMenuPart.hbs', newObj)
      html.find('.working-list').append(content)
      //this.render()
    });
    //Handle Delete Button
    html.on('click', '.item-delete', async (ev) => {
      console.log(ev)
      let label = ev.currentTarget.dataset.skill
      let target = html.find(`input[name="${label}"].skill-value`)[0].value
      //This doesn't read any updated values after creation for confirmation
     let d1 = await Dialog.confirm({
        title: "Confirm Deletion",
        content: `Are you sure you'd like to delete ${target}?`
      })
      if (d1) {
        $(ev.currentTarget).parents('.form-group').remove()
      }
      else return
      
    })
  }

  async _updateObject(event, formData) {
    let pushed = {}
    for (let key in formData) {
      let match = formData[key][0]
      pushed[match] = formData[key][1]
    }
    game.settings.set('koblike', 'skillsList', pushed)
    SettingsConfig.reloadConfirm({world:true})
  }
}
window.skillsMenuClass = skillsMenuClass
