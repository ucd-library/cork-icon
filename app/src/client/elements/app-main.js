import { LitElement } from 'lit';
import {render, styles} from "./app-main.tpl.js";

import {Mixin, MainDomElement} from '@ucd-lib/theme-elements/utils/mixins/index.js';
import { LitCorkUtils } from '@ucd-lib/cork-app-utils';

import {categoryBrands } from "@ucd-lib/theme-sass/colors.js";

export default class AppMain extends Mixin(LitElement)
  .with(MainDomElement, LitCorkUtils) {

  static get properties() {
    return {
      page: {type: String},
      animals: {type: Array},
      shuffledAnimals: {type: Array},
      searchOptions: {type: Object},
      selectedIcon: {type: Object},
      preloadedIcons: {type: Array}
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.page = 'cork-icon';
    this.preloadedIcons = [];
    this.searchOptions = {};
    this.selectedIcon = null;

    this.animals = [
      'fas.dog',
      'fas.cat',
      'fas.hippo',
      'fas.cow',
      'fas.fish',
      'fas.kiwi-bird',
      'fas.worm',
      'fas.spider',
      'fas.horse',
      'fas.frog'
    ];
    this.shuffleAnimals();

    this._injectModel('AppStateModel', 'IconModel');
  }

  connectedCallback() {
    super.connectedCallback();

    // preload icons from the document head if available
    const preloadIcons = window?.document?.head?.querySelector?.('#cork-icon-preload');
    if ( !preloadIcons ) return;
    const data = JSON.parse(preloadIcons.innerText || '{}');
    this.preloadedIcons = (data.icons || []).map(icon => `${icon.iconset}.${icon.name}`);
  }

  _onSearchOptionsUpdate(prop, value){
    this.searchOptions[prop] = value;
    this.requestUpdate();
  }

  _onAppStateUpdate(e) {
    this.page = e.page;
  }

  shuffleAnimals() {
    let shuffled = this.animals.sort(() => Math.random() - 0.5);
    this.shuffledAnimals = shuffled.slice(0, 3);
  }

  _onManualLoadClick(e) {
    const parent = e.target.parentNode.parentNode;
    const icons = parent.querySelectorAll('cork-icon');
    icons.forEach(icon => {
      icon.getIconData();
    });
  }

  getRandomBrandColor(){
    const colors = Object.values(categoryBrands);
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex].id;
  }

}

customElements.define('app-main', AppMain);
