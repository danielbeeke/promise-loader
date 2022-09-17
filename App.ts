import { get } from './helpers/path'
import { html, render } from './helpers/uhtml'

;(async () => {
  
  const soren = await get('http://dbpedia.org/resource/Søren_Kierkegaard', 'dbo', 'https://dbpedia.org/sparql')

  const draw = async () => {
    render(document.body, html`
      <div class="philosopher">

        <h1>${soren.label}</h1>

        <p>${soren.abstract}</p>

        <span>${soren.deathYear}</span>

        <img src=${soren.thumbnail} />

        <ul>
          ${soren.influenced.map(influencee => html`
            <li>
              <span>${influencee.label}</span>
            </li>
          `)}
        </ul>

      </div>
    `)
  }

  draw()

})()