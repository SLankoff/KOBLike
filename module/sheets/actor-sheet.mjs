import {
  onManageActiveEffect,
  prepareActiveEffectCategories,
} from '../helpers/effects.mjs';
import { colorMenuClass } from '../helpers/colorsapp.mjs';
import { KOBLIKE } from '../helpers/config.mjs';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class koblikeActorSheet extends ActorSheet {
  /** @override */
  _expanded = new Set();
  static get defaultOptions() {
    let theme = game.settings.get('koblike', 'theme')
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['koblike', 'sheet', 'actor', theme],
      width: 600,
      height: 600,
      tabs: [
        {
          navSelector: '.sheet-tabs',
          contentSelector: '.sheet-body',
          initial: 'features',
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/koblike/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = context.data;
    // Push system setting data to context
    context.config = {
      skills: game.settings.get('koblike', 'skillsList'),
      initiative: game.settings.get('koblike', 'initiative'),
      items: game.settings.get('koblike', 'itemTypes'),
      adversity: game.settings.get('koblike', 'adversity'),
      levels: KOBLIKE.skillLevels
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(
      // A generator that returns all effects stored on the actor
      // as well as any items
      this.actor.allApplicableEffects()
    );

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    // for (let [k, v] of Object.entries(context.system.abilities)) {
    //   v.label = game.i18n.localize(CONFIG.KOBLIKE.abilities[k]) ?? k;
    // }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = {}
    game.settings.get('koblike','itemTypes').items.forEach(type => {
      gear[type] = []
      
    });
    /*const features = {};
    game.settings.get('koblike','itemTypes').features.forEach(type => {
      features[type] = []
      
    });*/

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || Item.DEFAULT_ICON;
      // Append to gear.
      if (i.type === 'item') {
        gear[i.system.subType].push(i)
      }
      // Append to features.
      /*else if (i.type === 'feature') {
        features[i.system.subType].push(i)
      }*/
    }

    // Assign and return
    context.gear = gear;
    //context.features = features;
    //context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    //Check for math operations
    const inputs = html.find("input");
    inputs.focus(ev => ev.currentTarget.select());
    inputs.addBack().find('[type="text"][data-dtype="Number"]').change(this._checkMath.bind(this));

    // Render the item sheet for viewing/editing prior to the editable check.
    html.on('click', '.item-edit', (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

     // Player-side Skill Color menu
     html.on('click', '.config-skills', async (ev) => {
      let theme = game.settings.get('koblike', 'theme')
   new colorMenuClass(this.actor).render(true)
     })

    // Add Inventory Item
    html.on('click', '.item-create', this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.on('click', '.item-delete', async (ev) => {
      const li = $(ev.currentTarget).parents('.item');
      const item = this.actor.items.get(li.data('itemId'));
      let d1 = await Dialog.confirm({
        title: "Confirm Deletion",
        content: `Are you sure you'd like to delete ${item.name}?`
      })
      if (d1) {
      item.delete();
      li.slideUp(200, () => this.render(false));
      }
    });

    // Active Effect management
    html.on('click', '.effect-control', (ev) => {
      const row = ev.currentTarget.closest('li');
      const document =
        row.dataset.parentId === this.actor.id
          ? this.actor
          : this.actor.items.get(row.dataset.parentId);
      onManageActiveEffect(ev, document);
    });
   //Item Cards
    html.find('.item-image').click(this._showCard.bind(this));
   //Expandable descriptions
    html.find('.name-block').click(this._toggleExpand.bind(this));
    // Rollable abilities. NEEDS OVERHAUL -- pretty sure i did tho...
    html.on('click', '.rollable', this._onRoll.bind(this));


    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains('inventory-header')) return;
        li.setAttribute('draggable', true);
        li.addEventListener('dragstart', handler, false);
      });
    }
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const subType = header.dataset.type;
    const type = header.dataset.base;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${subType}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: {subType: subType},
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    //delete itemData.system['type'];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }
//Expand event for descriptions of items and features
async _toggleExpand(event) {
  event.preventDefault();
  let li = $(event.currentTarget).parents('.item')
  let item = this.actor.items.get(li.data('itemId'))
  if (li.hasClass('expanded') ) {
    let descblock = li.siblings('.descblock');
    descblock.slideUp(200, () => descblock.remove())
    this._expanded.delete(item.id);
  } else {
    let descblock = $(await renderTemplate('systems/koblike/templates/actor/parts/item-description.hbs', item.toObject()))
    li.parent().append(descblock.hide());
    descblock.slideDown(200);
    this._expanded.add(item.id)
  }
  li.toggleClass('expanded')
  }

  //Item chat cards!
  async _showCard(event) {
    event.preventDefault();
    let li = $(event.currentTarget).parents('.item')
    let item = this.actor.items.get(li.data('itemId'))
    return item.showCard()
  }

//Do math
_checkMath(event) {
  const input = event.target;
  const value = input.value;
  if ( ["+", "-"].includes(value[0]) ) {
    const delta = parseFloat(value);
    const item = this.actor.items.get(input.closest("[data-item-id]")?.dataset.itemId);
    if ( item ) input.value = Number(foundry.utils.getProperty(item, input.dataset.name)) + delta;
    else input.value = Number(foundry.utils.getProperty(this.actor, input.name)) + delta;
  } else if ( value[0] === "=" ) input.value = value.slice(1);
}
  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    /*if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    } */

   //Actually do real skill rolls
   if (dataset.roll && this.actor.system?.skills[dataset.roll]) {
    this.actor.rollSkill(dataset.roll)
   }
  }
}
