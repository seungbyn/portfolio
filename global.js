console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}


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

    if (a.host !== location.host) {
        a.target = "_blank";
    }

}

// 1. Insert the theme switcher UI
document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
      Theme:
      <select id="theme-select">
        <option value="light dark">Auto</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
    `
  );
  
  // 2. Reference the <select> element
const select = document.querySelector('#theme-select');
  
  // 3. If there's a saved preference, apply it
if ('colorScheme' in localStorage) {
    const saved = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', saved);
    select.value = saved; // update UI to match
}

console.log('switch')
  
  // 4. Save the user's preference and apply the theme when changed
select.addEventListener('input', (event) => {
    const value = event.target.value;
    localStorage.colorScheme = value;
    document.documentElement.style.setProperty('color-scheme', value);
});
  
  
  
/*Importing project data into projects page */
export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        const json = await response.json();   // parse response into JSON
        return json;                           // RETURN it!!
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}