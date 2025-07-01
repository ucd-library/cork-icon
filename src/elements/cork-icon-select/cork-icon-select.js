import { LitElement } from 'lit';
import {render, styles} from "./cork-icon-select.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

const stringToArray = ( value ) => {
  if ( !value ) return [];
  return value.split(',').map(v => v.trim()).filter(v => v);
}

export default class CorkIconSelect extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      value: { type: String },
      selected: { type: Object },
      placeholder: { type: String },
      label: { type: String },
      hideLabel: { type: Boolean, attribute: 'hide-label' },
      limit: { type: Number },
      iconsets: { type: Array, attribute: 'iconsets', converter: {fromAttribute: stringToArray} },
      excludeIconsets: { type: Array, attribute: 'exclude-iconsets', converter: {fromAttribute: stringToArray} },
      debounce: { type: Number },
      response: { state: true },
      responsePayload: { state: true },
      showResults: { state: true }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.value = '';
    this.selected = null;
    this.placeholder = '';
    this.label = '';
    this.hideLabel = false;
    this.limit = 10;
    this.iconsets = [];
    this.excludeIconsets = [];
    this.debounce = 500;
    this.response = null;
    this.responsePayload = null;
    this.showResults = false;


    this._injectModel('IconModel');
  }

  _onInput(value){
    this.showResults = false;
    this.value = value;
    if ( this.timeout ) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(async () => {
      await this.search(true);
      this.timeout = null;
      if ( this.value ){
        this.showResults = true;
      }
    }, this.debounce);
  }

  async search(emitEvents){
    if ( !this.value ){
      this.response = null;
      this._setResponsePayload(null, emitEvents);
      return;
    }
    this.response = await this.IconModel.search(this.value, this.searchOptions);
    if ( emitEvents ){
      this.dispatchEvent(new CustomEvent('icon-search-response', {
        detail: this.response,
        bubbles: true,
        composed: true
      }));
    }

    if ( this.response && this.response?.state === 'loaded' ){
      this._setResponsePayload(this.response.payload, emitEvents);
    } else {
      this._setResponsePayload(null, emitEvents);
    }

  }

  async _onInputFocus(){
    await this.search();
    if ( this.value ){
      this.showResults = true;
    }
  }

  _onInputBlur() {
    setTimeout(() => {
      const results = this.renderRoot.querySelector('#results');
      if ( results && (this.renderRoot.activeElement === results || results.contains(this.renderRoot.activeElement)) ){
        return;
      }
      this.showResults = false;
    }, 100);
  }

  _onIconSelect(icon){
    const selected = {
      icon,
      iconset: this.responsePayload?.iconsets?.find?.(i => i.name === icon.iconset)
    }
    this.selected = selected;
    this.value = '';
    this.showResults = false;
    this.dispatchEvent(new CustomEvent('icon-select', {
      detail: selected,
      bubbles: true,
      composed: true
    }));
  }

  _onResultsFocusOut(){
    setTimeout(() => {
      const results = this.renderRoot.querySelector('#results');
      if ( results && (this.renderRoot.activeElement === results || results.contains(this.renderRoot.activeElement)) ){
        return;
      }
      const input = this.renderRoot.querySelector('#search-input');
      if ( input && this.renderRoot.activeElement === input ){
        return;
      }
      this.showResults = false;
    }, 100);
  }

  _setResponsePayload(payload, emitEvent){
    if ( payload ){
      this.responsePayload = payload;
    } else {
      this.responsePayload = {
        icons: [],
        iconsets: [],
        query: {
          q: this.value,
          ...this.searchOptions
        }
      };
    }
    if ( emitEvent ){
      this.dispatchEvent(new CustomEvent('icon-search-results', {
        detail: this.responsePayload,
        bubbles: true,
        composed: true
      }));
    }

  }

  get searchOptions(){
    return {
      limit: this.limit,
      iconsets: this.iconsets,
      excludeIconsets: this.excludeIconsets
    };
  }


}

customElements.define('cork-icon-select', CorkIconSelect);
