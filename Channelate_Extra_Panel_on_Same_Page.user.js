// ==UserScript==
// @name        Channelate Extra Panel on Same Page
// @namespace   channelate.com
// @description Adds the Extra Panel for each comic back to the comic page.
// @include     /^https?:\/\/(www\.)?channelate\.com\/(comic|(\d{4}\/\d{2}\/\d{2})\/[\w-]+\/?)?$/
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @version     2.0
// @grant       GM.addStyle
// ==/UserScript==

function getElementFromURL(u, s) {
  return fetch(u).then(r => r.text()).then(h => {
    const p = new DOMParser()
    const d = p.parseFromString(h, 'text/html')
    return d.querySelector(s)
  }).catch(e => console.warn('Extra Panel Userscript: Error occurred while retrieving panel.', e))
}

async function main() {
  const bonusURL = document.querySelector('#extrapanelbutton a')?.href
  if(!bonusURL) return console.log('Extra Panel Userscript: Button directing to Extra Panel not found.')
  const bonusImage = await getElementFromURL(bonusURL, '.extrapanelimage') ?? document.createTextNode('Extra Panel Userscript: Extra Panel image not found.')
  const container = document.querySelector('#comic img').parentNode
  GM.addStyle('.extrapanelimage { opacity: 0.1 } .extrapanelimage:hover { opacity: 1 }');
  container.appendChild(bonusImage)
}

main()

/*function getElementFromURL(u, s) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onload = function () {
      if(this.status >= 200 && this.status < 300) resolve(xhr.response.querySelector(s))
      else reject({ status: this.status, statusText: xhr.statusText })
    }
    xhr.onerror = function () {
      reject({ status: this.status, statusText: xhr.statusText })
    }
    xhr.open('GET', u)
    xhr.responseType = 'document'
    xhr.send()
  })
}*/
