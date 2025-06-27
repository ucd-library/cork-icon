import { html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

export function styles() {
  const elementStyles = css`
    :host {
      display: inline-block;
    }
  `;

  return [elementStyles];
}

export function render() {
  return html`
  <p>im an icon!</p>
`;}
