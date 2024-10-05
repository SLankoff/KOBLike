/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
  return loadTemplates([
    // Actor partials.
    'systems/koblike/templates/actor/parts/actor-features.hbs',
    'systems/koblike/templates/actor/parts/actor-skills.hbs',
    'systems/koblike/templates/actor/parts/actor-items.hbs',
    //'systems/koblike/templates/actor/parts/actor-spells.hbs',
    'systems/koblike/templates/actor/parts/actor-effects.hbs',
    // Item partials
    'systems/koblike/templates/item/parts/item-effects.hbs',
    //Skill Menu stuff

    'systems/koblike/templates/skillsMenu.hbs',
    'systems/koblike/templates/skillsMenuPart.hbs'
  ]);
};
