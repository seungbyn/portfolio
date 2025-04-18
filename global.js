console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

navLinks = $$("nav a");

console.log(navLinks);

let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname,
);

console.log(location.host);
console.log(location.pathname);

currentLink?.classList.add('current');