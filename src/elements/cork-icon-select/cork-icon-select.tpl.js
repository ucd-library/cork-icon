import { html, css } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import formStyles from '@ucd-lib/theme-sass/1_base_html/_forms.css.js';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
      width: 100%;
      max-width: 400px;
      font-size: 1rem;
    }
    [hidden] {
      display: none !important;
    }
    input {
      box-sizing: border-box;
      font-size: 100%;
      line-height: 1.15;
    }
    .container {
      position: relative;
    }
    .results {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      z-index: 10;
      background-color: white;
      border: 1px solid #ccc;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-height: var(--cork-icon-select-results-max-height, 300px);
      overflow-y: auto;
    }
    .result-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.5rem;
      text-align: left;
      background-color: transparent;
      border: none;
      cursor: pointer;
      --cork-icon-size: 1rem;
      font-size: 100%;
    }
    .result-item:hover, .result-item:focus {
      color: var(--cork-icon-select-hover-color, #008eaa);
    }
    .no-results-default {
      padding: 0.5rem;
    }
  `;

  return [
    formStyles,
    elementStyles
  ];
}

export function render() {
  const useVisibleLabel = this.label && !this.hideLabel;
  const ariaLabelValue = !useVisibleLabel
    ? this.label || 'Search for an icon'
    : undefined;

  return html`
    <div class='container'>
      <div>
        ${useVisibleLabel ? html`
          <label for='search-input'>${this.label}</label>
        ` : html``}
        <input
          id='search-input'
          aria-label=${ifDefined(ariaLabelValue)}
          type='text'
          .value=${this.value}
          placeholder=${this.placeholder}
          @input=${e => this._onInput(e.target.value || '')}
          @blur=${this._onInputBlur}
          @focus=${this._onInputFocus}
        />
      </div>
      <div id='results' class='results' ?hidden=${!this.showResults} @focusout=${this._onResultsFocusOut}>
          ${this.responsePayload?.icons?.length ?
            this.responsePayload.icons.map(icon => html`
              <button class='result-item' @click=${() => this._onIconSelect(icon)}>
              <cork-icon icon='${icon.iconset}.${icon.name}'></cork-icon>
                <div>${icon.label}</div>
              </button>
              `)
            : html`
            <slot name='no-results'>
              <div class='no-results-default'>No icons found</div>
            </slot>
            ` }
      </div>
    </div>
`;}
