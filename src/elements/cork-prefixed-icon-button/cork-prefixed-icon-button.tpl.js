import { html, css } from 'lit';
import '../cork-icon/cork-icon.js';

export function styles() {
  const elementStyles = css`
    :host {
      display: inline-block;
      font-size: 1rem;
    }
    cork-icon {
      --cork-icon-size: 1em;
    }
    .container {
      display: flex;
      align-items: center;
      cursor: pointer;
      text-decoration: none;
      gap: .5em;
      font-size: 1em;
      font-weight: 700;
      border-radius: 2.5em;
      padding: .5em 1em;
      border: none;
      box-shadow: none;
      transition: background-color .2s, color .2s;
      box-sizing: border-box;
      line-height: 1.6em;
    }
    .container.color--light {
      background: var(--ucd-blue-40, #DBEAF7);
      color: var(--ucd-blue, #022851);
    }
    .container.color--light cork-icon {
      color: var(--ucd-blue-80, #13639E);
    }
    .container.color--light:hover {
      background: var(--ucd-blue-60, #B0D0ED);
    }
    .container.color--dark {
      background: var(--ucd-blue, #022851);
      color: var(--white, #FFF);
    }
    .container.color--dark cork-icon {
      color: var(--ucd-gold, #FFBF00);
    }
    .container.color--dark:hover {
      background: var(--ucd-gold, #FFBF00);
      color: var(--ucd-blue, #022851);
    }
    .container.color--dark:hover cork-icon {
      color: var(--ucd-blue, #022851);
    }
    .container.color--medium {
      background-color: var(--ucd-blue-80, #13639E);
      color: var(--white, #FFF);
    }
    .container.color--medium cork-icon {
      color: var(--ucd-gold, #FFBF00);
    }
    .container.color--medium:hover {
      background-color: var(--ucd-blue, #022851);
    }
    .container[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    ::slotted(*) {
      display: none !important;
    }
    slot {
      display: none;
    }
  `;

  return [elementStyles];
}

export function render() {
  const containerClass = `container color--${this.color}`;
  return html`
    <slot @slotchange=${this._onSlotChange}></slot>
    ${this.href && !this.disabled ? html`
      <a href='${this.href}' class=${containerClass}>
        <cork-icon icon=${this.icon} fetch-strategy=${this.iconFetchStrategy}></cork-icon>
        <span>${this.text}</span>
      </a>
      ` : html`
      <button class=${containerClass} ?disabled=${this.disabled} type=${this.buttonType}>
        <cork-icon icon=${this.icon} fetch-strategy=${this.iconFetchStrategy}></cork-icon>
        <span>${this.text}</span>
      </button>
      `}
  `;
}
