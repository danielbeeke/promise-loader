import { get } from './helpers/path'
import { html, render } from './helpers/uhtml'

;(async () => {
  
  const [ruben, daniel, soren, catapub] = await Promise.all([
    get('https://ruben.verborgh.org/profile/#me'),
    get('https://danielbeeke.nl/'),
    get('http://dbpedia.org/resource/Søren_Kierkegaard', 'dbo'),
    get('https://danielbeeke.nl', 'foaf', 'http://localhost:8080/sparql')
  ])

  const draw = async () => {
    render(document.body, html`
      <div class="person">

        <h1>${catapub.name}</h1>

        <h2>${ruben.label}</h2>

        <ul>
          ${ruben.interest.map(interest => html`
            <li><span>${interest.label}</span></li>
          `)}
        </ul>

        <ul style="max-height: 300px; overflow: scroll; background: #eee;">
          ${ruben.knows.map(person => html`
            <li><span>${person.label}</span></li>
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

        <h1>${soren.label.en}</h1>

      </div>
    `)
  }

  draw()

})()