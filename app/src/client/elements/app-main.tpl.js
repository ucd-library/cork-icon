import '@ucd-lib/theme-elements/brand/ucd-theme-primary-nav/ucd-theme-primary-nav.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-header/ucd-theme-header.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-branding-bar/ucdlib-branding-bar.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js';

import { html, css } from 'lit';

export function styles() {
  const elementStyles = css`
    :host {
      display: block;
    }
    section {
      margin-bottom: 1rem;
    }
    .search-container {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
  `;

  return [elementStyles];
}

export function render() {
return html`
  <ucd-theme-header>
    <ucdlib-branding-bar
      site-name="Cork Icon"
      slogan="Demo Application">
    </ucdlib-branding-bar>
    <ucd-theme-primary-nav>
      <a href="/">Icon Element</a>
      <a href="/select">Icon Select Element</a>
    </ucd-theme-primary-nav>
  </ucd-theme-header>

  <div class='l-container u-space-mt--large'>
    <ucdlib-pages
      id='app-pages'
      selected=${this.page}
      attr-for-selected='page-id'>
      ${renderIconExamples.call(this)}
      ${renderIconSelectExamples.call(this)}
    </ucdlib-pages>

  </div>

`;}

function renderIconSelectExamples() {
  return html`
    <div page-id='select'>
      <div class='search-container'>
        <div class='field-container'>
          <label for='search-limit'>Limit</label>
          <input
            id='search-limit'
            style='width: 100%;max-width: 100px;'
            .value=${this.searchOptions.limit || ''}
            @input=${e => this._onSearchOptionsUpdate('limit', e.target.value)}
            type='number' />
        </div>
        <div class='field-container'>
          <label for='search-iconsets'>Icon Sets</label>
          <input
            id='search-iconsets'
            style='width: 100%;max-width: 200px;'
            .value=${this.searchOptions.iconsets || ''}
            @input=${e => this._onSearchOptionsUpdate('iconsets', e.target.value)}
            type='text' />
        </div>
        <div class='field-container'>
          <label for='search-exclude-iconsets'>Exclude Icon Sets</label>
          <input
            id='search-exclude-iconsets'
            style='width: 100%;max-width: 200px;'
            .value=${this.searchOptions.excludeIconsets || ''}
            @input=${e => this._onSearchOptionsUpdate('excludeIconsets', e.target.value)}
            type='text' />
        </div>
        <div class='field-container'>
          <cork-icon-select
            label='cork-icon-select'
            limit=${this.searchOptions.limit || ''}
            iconsets=${this.searchOptions.iconsets || ''}
            exclude-iconsets=${this.searchOptions.excludeIconsets || ''}
            @icon-search-response=${e => console.log('icon-search-response', e.detail)}
            @icon-search-results=${e => console.log('icon-search-results', e.detail)}
            @icon-select=${e => console.log('icon-select', e.detail)}
          ></cork-icon-select>
        </div>
      </div>
    </div>
  `;
}

function renderIconExamples(){
  return html`
    <div page-id='cork-icon'>
      <section>
        <h2>Styles</h2>
        <section>
          <h3>Sizes</h3>
          ${['tiny', 'small', 'medium', 'large', 'huge'].map(size => html`
            <cork-icon icon='fas.rocket' size='${size}' class='${this.getRandomBrandColor()}'></cork-icon>
          `)}
          <div>
            <cork-icon icon='fas.rocket' style='--cork-icon-size: 5rem;' class='${this.getRandomBrandColor()}'></cork-icon>
            <cork-icon icon='fas.rocket' style='--cork-icon-size: 9rem;' class='${this.getRandomBrandColor()}'></cork-icon>
          </div>
        </section>
        <section>
          <h3>Rotation</h3>
          ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg => html`
            <cork-icon icon='fas.arrow-up' size='large' transform-degrees='${deg}' class='${this.getRandomBrandColor()}'></cork-icon>
            <cork-icon icon='fas.arrow-up' style='--cork-icon-rotate: ${deg}deg;' size='large' class='${this.getRandomBrandColor()}'></cork-icon>
          `)}
        </section>
        <section>
          <h3>Autoheight</h3>
          <div>
            <cork-icon style='background-color:#c6c3c3;' icon='fas.calculator' size='large' auto-height class='${this.getRandomBrandColor()}'></cork-icon>
            <cork-icon style='background-color:#c6c3c3;' icon='fas.calculator' size='large'></cork-icon>
          </div>
        </section>
        <section>
          <h3>Invisible if empty</h3>
          <cork-icon icon='fas.ghost' size='large' invisible-if-empty fetch-strategy='manual'></cork-icon>
        </section>
      </section>
      <section>
        <h2>Loading Icons</h2>
        <section>
          <h3>Property Change</h3>
          <div>
            ${this.shuffledAnimals.map(icon => html`
              <cork-icon icon="${icon}" size="large" class='${this.getRandomBrandColor()}'></cork-icon>
            `)}
          </div>
          <div class='u-space-mt--medium'>
            <button @click=${this.shuffleAnimals} class='btn'>Update Icons</button>
          </div>
        </section>
        <section>
          <h3>Manual Fetch</h3>
            <cork-icon icon='fas.face-smile' size='large' fetch-strategy='manual' class='${this.getRandomBrandColor()}'></cork-icon>
            <cork-icon icon='fas.face-frown' size='large' fetch-strategy='manual' disable-fade-in class='${this.getRandomBrandColor()}'></cork-icon>
            <cork-icon icon='fas.face-meh' size='large' fetch-strategy='manual' class='${this.getRandomBrandColor()}'></cork-icon>
            <cork-icon icon='fas.face-grin' size='large' fetch-strategy='manual' disable-fade-in class='${this.getRandomBrandColor()}'></cork-icon>
            <cork-icon icon='fas.face-grin-beam' size='large' fetch-strategy='manual' class='${this.getRandomBrandColor()}'></cork-icon>
            <cork-icon icon='fas.face-grin-hearts' size='large' fetch-strategy='manual' disable-fade-in class='${this.getRandomBrandColor()}'></cork-icon>
            <div class='u-space-mt--medium'>
              <button @click=${this._onManualLoadClick} class='btn'>Manually Fetch Icons</button>
            </div>
        </section>
        <section>
          <h3>Lazy Fetch</h3>
          <cork-icon icon='fas.face-grin-squint' size='large' fetch-strategy='lazy' class='${this.getRandomBrandColor()}'></cork-icon>
          <cork-icon icon='fas.face-grin-squint-tears' size='large' fetch-strategy='lazy' class='${this.getRandomBrandColor()}'></cork-icon>
          <cork-icon icon='fas.face-grin-tongue-wink' size='large' fetch-strategy='lazy' class='${this.getRandomBrandColor()}'></cork-icon>
        </section>
      </section>
    </div>
  `
}
