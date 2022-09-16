import { path } from './helpers/path'
import { html, render } from './helpers/uhtml'
import prefixes from './helpers/prefixes'

;(async () => {
  const ruben = await path('https://ruben.verborgh.org/profile/#me', prefixes, 'foaf')
  const daniel = await path('https://danielbeeke.nl/', prefixes, 'foaf')

  const draw = async () => {
    render(document.body, html`
      <div class="person">

        <h2>${ruben.label}</h2>

        <ul>
          ${ruben.interest.map(interest => html`
            <li><span>${interest['rdfs:label']}</span></li>
          `)}
        </ul>

        <ul style="max-height: 300px; overflow: scroll; background: #eee;">
          ${ruben.knows.map(person => html`
            <li><span>${person['rdfs:label']}</span></li>
          `)}
        </ul>

        ${html`
          <h3>
            <span>${daniel.name}</span>
            <span>${daniel.givenName}</span>
            <span>${daniel.familyName}</span>
          </h3>
          <img src=${daniel.img}/>
          <span>${daniel.mbox}</span>        
        `}

      </div>
    `)
  }

  draw()

})()