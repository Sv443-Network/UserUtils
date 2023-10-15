function load() {
  document
    .querySelector("#selector-observer-btn")
    .addEventListener("click", selectorObserver);
}

document.addEventListener("DOMContentLoaded", load);

//#SECTION SelectorObserver

function selectorObserver() {
  const container = document.querySelector("#selector-observer-cont");

  const cont1 = document.createElement("div");
  cont1.id = "selector-observer-subcont1";
  cont1.classList.add("selector-observer-subcont");

  const cont2 = document.createElement("div");
  cont2.id = "selector-observer-subcont2";
  cont2.classList.add("selector-observer-subcont");

  const cont3 = document.createElement("div");
  cont3.id = "selector-observer-subcont3";
  cont3.classList.add("selector-observer-subcont");

  container.appendChild(cont1);
  addElements(1, cont1);

  setTimeout(() => {
    cont1.appendChild(cont2);
    addElements(2, cont2);

    setTimeout(() => {
      cont2.appendChild(cont3);
      addElements(3, cont3);
    }, 5000);
  }, 5000);
}

/**
 * @param {number} contNum
 * @param {Element} container
 */
async function addElements(contNum, container) {
  for (let i = 0; i < 5; i++) {
    const div = document.createElement("div");
    div.classList.add("selector-observer-item");
    div.innerText = `Container #${contNum} - Item #${i}`;
    container.appendChild(div);
    await sleep(1000);
  }
}

//#SECTION utils

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
