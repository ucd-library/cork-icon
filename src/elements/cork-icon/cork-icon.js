import { LitElement } from 'lit';
import {render, styles} from "./cork-icon.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

import intersectionObserver from '../../lib/intersectionObserver.js';

/**
 * @description A custom element for loading and displaying icons using the cork-icon api.
 * @property {String} icon - The name of the icon to display, e.g. 'iconsetNameOrAlias.iconName'.
 * @property {String} size - The keyword size of the icon.
 * Uses predefined UCD theme spacer sizes: tiny, small, medium, large, huge.
 * Size of icon can also be set using --cork-icon-size CSS variable.
 * @property {Number} transformDegrees - Degrees to rotate the icon.
 * Rotation can also be set using --cork-icon-rotate CSS variable.
 * @property {Boolean} invisibleIfEmpty - If true and the icon data has not been loaded, no space will be taken up by the icon.
 * @property {Boolean} autoHeight - If true, the height of the icon will be based on the svg viewBox. Otherwise, the icon will be square.
 * @property {String} fetchStrategy - Strategy for fetching icon data. Cam be 'property-change' (default), 'manual', or 'lazy'.
 * If 'property-change', the icon data will be fetched when the `icon` property changes.
 * If 'manual', the icon data must be fetched manually using the `getIconData()` method.
 * If 'lazy', the icon data will be fetched when the icon is in view using IntersectionObserver.
 * @property {Boolean} disableFadeIn - If true, the icon will not fade in when it is first loaded.
 * @property {Object} data - The icon data object from the API.
 *
 */
export default class CorkIcon extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      icon: { type: String },
      size: {type: String},
      transformDegrees: {type: Number, attribute: 'transform-degrees'},
      invisibleIfEmpty: {type: Boolean, attribute: 'invisible-if-empty'},
      autoHeight: {type: Boolean, attribute: 'auto-height'},
      fetchStrategy: {type: String, attribute: 'fetch-strategy'},
      disableFadeIn: {type: Boolean, attribute: 'disable-fade-in'},
      data: { type: Object }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);

    this.icon = 'foooo';
    this.data = null;
    this.disableFadeIn = false;
    this.invisibleIfEmpty = false;
    this.autoHeight = false;
    this.transformDegrees = 0;
    this.size = '';


    this.defaultFetchStrategy = 'property-change';
    this.fetchStrategy = this.defaultFetchStrategy;
    this.allowedFetchStrategies = ['property-change', 'manual', 'lazy'];

    this._injectModel('IconModel');
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateObservation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    intersectionObserver.unobserve(this);
  }

  willUpdate(props){

    // validate fetch strategy property
    if ( props.has('fetchStrategy') ){
      if ( !this.allowedFetchStrategies.includes(this.fetchStrategy) ) {
        this.logger.warn(`Invalid fetch strategy "${this.fetchStrategy}" for <cork-icon>. Using default "${this.defaultFetchStrategy}".`);
        this.fetchStrategy = this.defaultFetchStrategy;
      }
    }

    // Update the intersection observer if fetch strategy or icon has changed
    if (props.has('fetchStrategy') || props.has('icon')) {
      this._updateObservation();
    }

    // Get icon data if icon name property has changed
    if (props.has('icon') && this.fetchStrategy == 'property-change' ){
      this.data = null;
      if ( this.icon ){
        this.getIconData();
      }
    }

    // Fade in the icon if loading for the first time
    if ( (props.has('data') && !props.get('data') && this.data) && !this.disableFadeIn ) {
      this.animate([
        {opacity: 0},
        {opacity: 1}
      ], {
        duration: 200,
        easing: 'ease-in-out',
        fill: 'forwards'
      });
    }
  }

  /**
   * @description Update the intersection observer based on the fetch strategy.
   */
  _updateObservation(){
    intersectionObserver.unobserve(this);
    if ( this.fetchStrategy === 'lazy' ){
      intersectionObserver.observe(this);
    }
  }

  async getIconData(){
    if ( !this.icon ) {
      this.data = null;
      return this.data;
    }
    const cached = this.IconModel.getFromCache(this.icon);
    if ( cached?.[0] ){
      this.data = cached[0];
      return this.data;
    }

    const r = await this.IconModel.batch(this.icon);
    if ( r?.[0] ){
      this.data = r[0];
      return this.data;
    }
    this.data = null;
    return this.data;

  }


}

customElements.define('cork-icon', CorkIcon);
