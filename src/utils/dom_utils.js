export const scrollToElement = (eltId, delay = 300) => {
  setTimeout(() => {
    const elt = document.getElementById(eltId);
    if (elt) {
      elt.scrollIntoView()
    }
  }, delay);
};
