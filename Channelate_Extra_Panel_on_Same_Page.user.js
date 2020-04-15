// ==UserScript==
// @name        Channelate Extra Panel on Same Page
// @namespace   channelate.com
// @description Adds the Extra Panel for each comic back to the comic page.
// @include     /^https?:\/\/(?:www\.)?channelate\.com\/(?:(?:comic|\d{4}\/\d{2}\/\d{2})\/[\w-]+\/?)?$/
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @version     2.1
// @grant       GM.addStyle
// ==/UserScript==

const pref = 'Extra Panel Userscript:'
const getElementFromURL = (u, s, m = 'Error retrieving element.') => fetch(u).then(r => r.text()).then(h => (new DOMParser()).parseFromString(h, 'text/html')?.querySelector(s)).catch(e => console.warn(m, e) && null)

async function main() {
  const bonusURL = document.querySelector('#extrapanelbutton a')?.href
  if (!bonusURL) return console.log(`${pref} Button directing to Extra Panel not found.`)
  const bonusImage = await getElementFromURL(bonusURL, '.extrapanelimage', pref) ?? document.createTextNode(`${pref} Extra Panel image not found.`)
  const container = document.querySelector('#comic img')?.parentNode ?? document.body
  GM.addStyle('.extrapanelimage { opacity: 0.1 } .extrapanelimage:hover { opacity: 1 }');
  container.appendChild(bonusImage)
}

main()
