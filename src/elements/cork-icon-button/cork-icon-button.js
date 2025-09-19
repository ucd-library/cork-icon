import { LitElement } from 'lit';
import {render, styles} from "./cork-icon-button.tpl.js";

/**
 * @description An icon button component. Use --cork-icon-button-size variable to set the size of the element.
 * @property {String} color - The color theme of the button. Can be 'dark', 'medium', 'light', or 'white'.
 * @property {Boolean} basic - If true, the button will have no background or border. Overrides color property.
 * @property {String} icon - The icon to display in the button. Must be a valid icon slug.
 * @property {String} iconFetchStrategy - The fetch strategy to use for the icon. Passed to the cork-icon element.
 * @property {String} href - Optional. If set, the button will be a link to the provided href. Otherwise, a button element will be rendered.
 * @property {Boolean} disabled - Optional. If true, the button will be disabled.
 */
export default class CorkIconButton extends LitElement {

  static get properties() {
    return {
      color: { type: String },
      basic: { type: Boolean },
      icon: { type: String },
      iconFetchStrategy: { type: String, attribute: 'icon-fetch-strategy' },
      href: { type: String },
      disabled: { type: Boolean }
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
    this.color = '';
    this.basic = false;
    this.icon = '';
    this.href = '';
    this.iconFetchStrategy = '';
    this.disabled = false;
  }

  willUpdate(props){
    const colors = ['dark', 'medium', 'light', 'white'];
    if ( props.has('color') && !colors.includes(this.color)){
      this.color = 'light';
    }
  }

}

customElements.define('cork-icon-button', CorkIconButton);
