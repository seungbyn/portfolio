console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}



// navLinks = $$("nav a");

// console.log(navLinks);

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
// );

// console.log(location.host);
// console.log(location.pathname);

// currentLink?.classList.add('current');


//Navigation Control
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/website/";         // GitHub Pages repo name

let pages = [
    { url: 'https://seungbyn.github.io/portfolio/index.html', title: 'Home' },
    { url: 'https://seungbyn.github.io/portfolio/projects/index.html', title: 'Projects' },
    { url: 'https://seungbyn.github.io/portfolio/contact/index.html', title: 'Contact'},
    { url: 'https://seungbyn.github.io/portfolio/CV/index.html', title: 'Resume'},
    { url: 'https://github.com/seungbyn', title: 'Github'}
  ];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    if (!url.startsWith('http')) {
        url = BASE_PATH + url;
      }
    let title = p.title;
    
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);

    console.log(a.host);
    console.log(location.host);
    console.log(a.pathname);
    console.log(location.pathname);

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

}



{/* <li><a href="https://seungbyn.github.io/portfolio/index.html">Home</a></li>
            <li><a href="https://seungbyn.github.io/portfolio/projects/index.html">Projects</a></li>
            <li><a href="https://seungbyn.github.io/portfolio/contact/index.html">Contact</a></li>
            <li><a href="https://seungbyn.github.io/portfolio/CV/index.html">Resume</a></li>
            <li><a href="https://github.com/seungbyn" target="_blank">GitHub</a></li> */}