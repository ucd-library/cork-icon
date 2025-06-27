import { LitElement } from 'lit';
import {render, styles} from "./cork-icon.tpl.js";
import { LitCorkUtils, Mixin } from '@ucd-lib/cork-app-utils';

export default class CorkIcon extends Mixin(LitElement)
  .with(LitCorkUtils) {

  static get properties() {
    return {
      icon: { type: String },
      data: { type: Object },
      fetchStrategy: {type: String, attribute: 'fetch-strategy'}
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
    this.defaultFetchStrategy = 'property-change';
    this.fetchStrategy = this.defaultFetchStrategy;

    this._injectModel('IconModel');

  }

  willUpdate(props){

    // validate fetch strategy property
    if ( props.has('fetchStrategy') ){
      const allowedStrategies = ['property-change', 'manual'];
      if ( !allowedStrategies.includes(this.fetchStrategy) ) {
        this.logger.warn(`Invalid fetch strategy "${this.fetchStrategy}" for <cork-icon>. Using default "${this.defaultFetchStrategy}".`);
        this.fetchStrategy = this.defaultFetchStrategy;
      }
    }

    if (props.has('icon') && this.fetchStrategy == 'property-change' ){
      this.data = null;
      if ( this.icon ){
        this.getIconData();
      }
    }
  }

  async getIconData(){
    if ( this.data || !this.icon ) {
      return this.data;
    }
    const cached = this.IconModel.getFromCache(this.icon);
    if ( cached?.[0] ){
      this.data = cached[0];
      return this.data;
    }

    const r = await this.IconModel.batch(this.icon);
    console.log('Icon data fetched:', r);

  }


}

customElements.define('cork-icon', CorkIcon);
