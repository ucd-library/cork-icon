import '@ucd-lib/theme-elements/brand/ucd-theme-primary-nav/ucd-theme-primary-nav.js';
import '@ucd-lib/theme-elements/brand/ucd-theme-header/ucd-theme-header.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-branding-bar/ucdlib-branding-bar.js';
import '@ucd-lib/theme-elements/ucdlib/ucdlib-pages/ucdlib-pages.js';
import {categoryBrands } from "@ucd-lib/theme-sass/colors.js";

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
    .flex {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
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
      <a href="/other-elements">Other Elements</a>
    </ucd-theme-primary-nav>
  </ucd-theme-header>

  <div class='l-container u-space-mt--large'>
    <ucdlib-pages
      id='app-pages'
      selected=${this.page}
      attr-for-selected='page-id'>
      ${renderIconExamples.call(this)}
      ${renderIconSelectExamples.call(this)}
      ${renderOtherElements.call(this)}
    </ucdlib-pages>

  </div>

`;}

function renderOtherElements(){
  return html`
    <div page-id='other-elements'>
      <h2>Other Elements</h2>
      <section>
        <h3>cork-icon-button</h3>
        <p>Style Variants</p>
        <div class='flex'>
          <cork-icon-button icon='fas.thumbs-up' @click=${e => console.log(`color: ${e.target.color}`)}></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' disabled @click=${e => console.log(`color: ${e.target.color}`)}></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' color='dark' @click=${e => console.log(`color: ${e.target.color}`)}></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' color='dark' disabled @click=${e => console.log(`color: ${e.target.color}`)}></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' color='medium' @click=${e => console.log(`color: ${e.target.color}`)}></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' color='medium' disabled @click=${e => console.log(`color: ${e.target.color}`)}></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' color='white' @click=${e => console.log(`color: ${e.target.color}`)}></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' color='white' disabled @click=${e => console.log(`color: ${e.target.color}`)}></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' basic @click=${e => console.log(`basic boolean: true`)}></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' basic disabled @click=${e => console.log(`basic boolean: true`)}></cork-icon-button>
        </div>
      </section>
      <section>
        <p>Style Variants with href</p>
        <div class='flex'>
          <cork-icon-button icon='fas.thumbs-up' href='/'></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' color='dark' href='/'></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' color='medium' href='/'></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' color='white' href='/'></cork-icon-button>
          <cork-icon-button icon='fas.thumbs-up' basic href='/'></cork-icon-button>
        </div>
      </section>
      <section>
        <p>With icon fetch strategy</p>
        <div class='flex'>
          <cork-icon-button icon='fas.thumbs-down' icon-fetch-strategy='lazy' @click=${e => console.log(`fetch strategy: ${e.target.iconFetchStrategy}`)}></cork-icon-button>
          <cork-icon-button icon='fas.plus' icon-fetch-strategy='lazy' @click=${e => console.log(`fetch strategy: ${e.target.iconFetchStrategy}`)}></cork-icon-button>
          <cork-icon-button icon='fas.minus' icon-fetch-strategy='lazy' @click=${e => console.log(`fetch strategy: ${e.target.iconFetchStrategy}`)}></cork-icon-button>
        </div>
      </section>

      <section>
        <h3>cork-prefixed-icon-button</h3>
        <p>Style Variants</p>
        <div class='flex'>
          <cork-prefixed-icon-button icon='fas.thumbs-up' @click=${e => console.log(`color: ${e.target.color}`)}>Like</cork-prefixed-icon-button>
          <cork-prefixed-icon-button icon='fas.thumbs-up' text='Like' disabled @click=${e => console.log(`color: ${e.target.color}`)}></cork-prefixed-icon-button>
          <cork-prefixed-icon-button icon='fas.thumbs-up' text='Like' color='dark' @click=${e => console.log(`color: ${e.target.color}`)}></cork-prefixed-icon-button>
          <cork-prefixed-icon-button icon='fas.thumbs-up' color='dark' disabled @click=${e => console.log(`color: ${e.target.color}`)}>Like</cork-prefixed-icon-button>
          <cork-prefixed-icon-button icon='fas.thumbs-up' text='Like' color='medium' @click=${e => console.log(`color: ${e.target.color}`)}></cork-prefixed-icon-button>
          <cork-prefixed-icon-button icon='fas.thumbs-up' text='Like' color='medium' disabled @click=${e => console.log(`color: ${e.target.color}`)}></cork-prefixed-icon-button>
        </div>
      </section>
      <section>
        <p>Style Variants with href</p>
        <div class='flex'>
          <cork-prefixed-icon-button icon='fas.thumbs-up' text='Like' href='/'></cork-prefixed-icon-button>
          <cork-prefixed-icon-button icon='fas.thumbs-up' text='Like' color='dark' href='/'></cork-prefixed-icon-button>
          <cork-prefixed-icon-button icon='fas.thumbs-up' text='Like' color='medium' href='/'></cork-prefixed-icon-button>
          <cork-prefixed-icon-button icon='fas.thumbs-up' text='Like' basic href='/'></cork-prefixed-icon-button>
        </div>
      </section>
      <section>
        <p>With icon fetch strategy</p>
        <div class='flex'>
          <cork-prefixed-icon-button icon='fas.file-pdf' icon-fetch-strategy='lazy' @click=${e => console.log(`fetch strategy: ${e.target.iconFetchStrategy}`)}>Download</cork-prefixed-icon-button>
          <cork-prefixed-icon-button icon='fas.file-excel' icon-fetch-strategy='lazy' @click=${e => console.log(`fetch strategy: ${e.target.iconFetchStrategy}`)}>Download</cork-prefixed-icon-button>
          <cork-prefixed-icon-button icon='fas.file-word' icon-fetch-strategy='lazy' @click=${e => console.log(`fetch strategy: ${e.target.iconFetchStrategy}`)}>Download</cork-prefixed-icon-button>
        </div>
      </section>
    </div>
  `;
}

function renderIconSelectExamples() {
  return html`
    <div page-id='select'>
      <div class='search-container'>
        <div class='field-container'>
          <label for='search-limit'>attr: limit</label>
          <input
            id='search-limit'
            style='width: 100%;max-width: 100px;'
            .value=${this.searchOptions.limit || ''}
            @input=${e => this._onSearchOptionsUpdate('limit', e.target.value)}
            type='number' />
        </div>
        <div class='field-container'>
          <label for='search-iconsets'>attr: iconsets</label>
          <input
            id='search-iconsets'
            style='width: 100%;max-width: 200px;'
            .value=${this.searchOptions.iconsets || ''}
            @input=${e => this._onSearchOptionsUpdate('iconsets', e.target.value)}
            type='text' />
        </div>
        <div class='field-container'>
          <label for='search-exclude-iconsets'>attr: excludeIconsets</label>
          <input
            id='search-exclude-iconsets'
            style='width: 100%;max-width: 200px;'
            .value=${this.searchOptions.excludeIconsets || ''}
            @input=${e => this._onSearchOptionsUpdate('excludeIconsets', e.target.value)}
            type='text' />
        </div>
        <div class='field-container'>
          <cork-icon-select
            label='cork-icon-select element'
            limit=${this.searchOptions.limit || ''}
            iconsets=${this.searchOptions.iconsets || ''}
            exclude-iconsets=${this.searchOptions.excludeIconsets || ''}
            @icon-search-response=${e => console.log('icon-search-response', e.detail)}
            @icon-search-results=${e => console.log('icon-search-results', e.detail)}
            @icon-select=${e => this.selectedIcon = e.detail}
          ></cork-icon-select>
        </div>
      </div>
      ${this.selectedIcon ? html`
        <div class='u-space-mt--large'>
          <h2>Selected Icon</h2>
          <div>
            ${Object.values(categoryBrands).map(color => html`
              <cork-icon
                icon='${this.selectedIcon.icon.iconset}.${this.selectedIcon.icon.name}'
                size='huge'
                class='${color.id}'
                >
              </cork-icon>
            `)}
          </div>
        </div>
        ` : html``}

    </div>
  `;
}

function renderIconExamples(){
  return html`
    <div page-id='cork-icon'>
      <section>
        <h2>Preloaded Icons</h2>
        ${this.preloadedIcons.map(icon => html`
          <cork-icon icon='${icon}' size='large' class='${this.getRandomBrandColor()}'></cork-icon>
        `)}
      </section>
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
