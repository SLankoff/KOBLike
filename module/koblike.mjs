// Import document classes.
import { koblikeActor } from './documents/actor.mjs';
import { koblikeItem } from './documents/item.mjs';
// Import sheet classes.
import { koblikeActorSheet } from './sheets/actor-sheet.mjs';
import { koblikeItemSheet } from './sheets/item-sheet.mjs';
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from './helpers/templates.mjs';
import { KOBLIKE } from './helpers/config.mjs';
import { skillsMenuClass } from './helpers/config.mjs';
import { itemMenuClass } from './helpers/config.mjs';
// Import DataModel classes
import * as models from './data/_module.mjs';
//Custom system logic classes
import koblikeDie from './helpers/koblikedie.js';
import { koblikeRoll } from './helpers/koblikedie.js';

CONFIG.debug.hooks = true
/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function () {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.koblike = {
    koblikeActor,
    koblikeItem,
    rollItemMacro,
  };

  // Add custom constants for configuration.
  CONFIG.KOBLIKE = KOBLIKE;

  //Load world settings for skills
  game.settings.registerMenu("koblike", "skillsMenu", {
    name: "Skills Submenu",
    hint: "Define the listed skills for use on the character sheet!",
    icon: "fas fa-bars",
    type: skillsMenuClass,
    restricted: true
    
  })
  await game.settings.register('koblike', 'skillsList', {
    scope: "world",
    config: false,
    type: Object,
    default: { 
      bra: "Brains",
      brw: "Brawn",
      fit: "Fight",
      fli: "Flight",
      cha: "Charm",
      gri: "Grit"
    
    }
  })
    //Register item class settings
  await game.settings.register('koblike', 'itemTypes', {
    scope: "world",
    config: false,
    type: Object,
    //Objects are generally stronger in Foundry... But I'm using an array here because I generally think we'll always need these user input names when actually using categories.
    default: { features: ['Strengths', 'Weaknesses'],
    items: ["Equipment"],
    adversity: "Adversity"
    }
  })
  game.settings.registerMenu("koblike", "itemMenu", {
    name: "Items Submenu",
    hint: "Define the types of items and equipment your system uses!",
    icon: "fas fa-bars",
    type: itemMenuClass,
    restricted: true
    
  })
  //Register setting for NSBU mode
  game.settings.register('koblike', 'explodeUpgrades', {
    name: "Explosive Upgrades",
    hint: "Upgrade your skill die type when rolling a maximum of that die! (Inspired by Never Stop Blowing Up)",
    scope: "world",
    config: true,
    type: Boolean,
    default: false

  })
    //Register setting for Adversity Token name
    game.settings.register('koblike', 'adversity', {
      name: "Adversity Token Name",
      hint: "What are failure tokens called in your system?",
      scope: "world",
      config: true,
      type: String,
      default: "Adversity"
  
    })
//Register fancy new dice class for exploding upgrades
CONFIG.Dice.terms.d = koblikeDie
CONFIG.Dice.rolls = [koblikeRoll]


  /**
   * Set an initiative formula for the system
   * Liz Note: I wanna make a selector of some kind to bind a skill to inititive.
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d20 + @abilities.dex.mod',
    decimals: 2,
  };

  // Define custom Document and DataModel classes
  CONFIG.Actor.documentClass = koblikeActor;

  // Note that you don't need to declare a DataModel
  // for the base actor/item classes - they are included
  // with the Character/NPC as part of super.defineSchema()
  CONFIG.Actor.dataModels = {
    character: models.koblikeCharacter,
    npc: models.koblikeNPC
  }
  CONFIG.Item.documentClass = koblikeItem;
  CONFIG.Item.dataModels = {
    item: models.koblikeItem,
    feature: models.koblikeFeature
    //spell: models.koblikeSpell
  }

  // Active Effects are never copied to the Actor,
  // but will still apply to the Actor from within the Item
  // if the transfer property on the Active Effect is true.
  CONFIG.ActiveEffect.legacyTransferral = false;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('koblike', koblikeActorSheet, {
    makeDefault: true,
    label: 'KOBLIKE.SheetLabels.Actor',
  });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('koblike', koblikeItemSheet, {
    makeDefault: true,
    label: 'KOBLIKE.SheetLabels.Item',
  });

  //Feels weird hooking here, but gonna try and add to the chat message context for success/failures.
  Hooks.on('getChatLogEntryContext', (app, entries) => {
    entries.push({
      callback: (message)=> {let doc = game.messages.get(message.data().messageId)
        doc.rolls.forEach(roll => {
          roll.options.marked = 'success'
        });
        doc.update({rolls: doc.rolls, flags: {koblike: {marked: 'success'}}})
      },
      condition: game.user.isGM,
      icon: '<i class="fa-solid fa-check"></i>',
      name: 'Mark Success'
    })
    entries.push({
      callback: (message)=> {let doc = game.messages.get(message.data().messageId)
        doc.rolls.forEach(roll => {
          roll.options.marked = 'failure'
        });
        doc.update({rolls: doc.rolls, flags: {koblike: {marked: 'failure'}}})
      },
      condition: game.user.isGM,
      icon: '<i class="fa-solid fa-x"></i>',
      name: 'Mark Failure'
    })
    entries.push({
      callback: (message)=> {let doc = game.messages.get(message.data().messageId)
        doc.rolls.forEach(roll => {
          roll.options.marked = 'false'
        });
        doc.update({rolls: doc.rolls, flags: {koblike: {marked: 'false'}}})
      },
      condition: game.user.isGM,
      icon: '<i class="fa-solid fa-question"></i>',
      name: 'Mark Neutral'
    })
  })

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here is a useful example:
Handlebars.registerHelper('toLowerCase', function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper('diePicker',  function (options) {
  let {name, value, min, max, step} = options.hash;
  name = name || "range";
  value = value ?? "";
  if ( Number.isNaN(value) ) value = "";
  const html =
  `<input type="range" name="${name}" value="${value}" min="${min}" max="${max}" step="${step}"/>`;
  return new Handlebars.SafeString(html);
})

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once('ready', function () {
//Register Sucess/Fail button visibility and listeners...
Hooks.on('renderChatMessage', (doc,element,options) => {
  if (doc.author.id !== game.user.id && game.user.isGM && doc.isRoll && !doc.flags?.koblike?.marked) {
    let content = `<div class="choice-buttons"><button data-type="success">Mark Success</button>
    <button data-type="failure">Mark Failure</button></div>`
    element.append(content)
  }
  element.find('[data-type="success"]').on('click', async ev => {
    doc.rolls.forEach(roll => {
      roll.options.marked = 'success'
    });
    doc.update({rolls: doc.rolls, flags: {koblike: {marked: 'success'}}})
  })
  element.find('[data-type="failure"]').on('click', async ev => {
    doc.rolls.forEach(roll => {
      roll.options.marked = 'failure'
    });
    doc.update({rolls: doc.rolls, flags: {koblike: {marked: 'failure'}}})
  })
})
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on('hotbarDrop', (bar, data, slot) => createItemMacro(data, slot));

});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(data, slot) {
  // First, determine if this is a valid owned item.
  if (data.type !== 'Item') return;
  if (!data.uuid.includes('Actor.') && !data.uuid.includes('Token.')) {
    return ui.notifications.warn(
      'You can only create macro buttons for owned Items'
    );
  }
  // If it is, retrieve it based on the uuid.
  const item = await Item.fromDropData(data);

  // Create the macro command using the uuid.
  const command = `game.koblike.rollItemMacro("${data.uuid}");`;
  let macro = game.macros.find(
    (m) => m.name === item.name && m.command === command
  );
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'koblike.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
  // Reconstruct the drop data so that we can load the item.
  const dropData = {
    type: 'Item',
    uuid: itemUuid,
  };
  // Load the item from the uuid.
  Item.fromDropData(dropData).then((item) => {
    // Determine if the item loaded and if it's an owned item.
    if (!item || !item.parent) {
      const itemName = item?.name ?? itemUuid;
      return ui.notifications.warn(
        `Could not find item ${itemName}. You may need to delete and recreate this macro.`
      );
    }

    // Trigger the item roll
    item.roll();
  });
}
