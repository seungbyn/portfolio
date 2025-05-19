console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}


//Navigation Control
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/website/";         // GitHub Pages repo name

let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'projects/index.html', title: 'Projects' },
  { url: 'contact/index.html', title: 'Contact' },
  { url: 'CV/index.html', title: 'Resume' },
  { url: 'meta/index.html', title: 'Meta' },
  { url: 'https://github.com/seungbyn', title: 'Github' }
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
        const data = await response.json();
        return data;                     
    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}


export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    // Validate containerElement
    if (!(containerElement instanceof HTMLElement)) {
      console.error('renderProjects error: containerElement is not a valid DOM element.');
      return;
    }
  
    // Validate headingLevel
    const allowedHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    if (!allowedHeadings.includes(headingLevel)) {
      console.warn(`Invalid headingLevel "${headingLevel}". Defaulting to "h2".`);
      headingLevel = 'h2';
    }
  
    // 🟡 Clear the container ONCE
    containerElement.innerHTML = '';
  
    // 🟡 Loop through all the projects
    for (const project of projects) {
      const article = document.createElement('article');
  
      article.innerHTML = `
        <${headingLevel}>${project.title || 'Untitled Project'}</${headingLevel}>
        ${project.image ? `<img src="${project.image}" alt="${project.title || 'Project Image'}">` : ''}
        <div>
            <p>${project.description || 'No description available.'}</p>
            ${project.year ? `<p class="project-year">${project.year}</p>` : ''}
        </div>
        `;

  
      // 🟡 Only appending, not clearing again
      containerElement.appendChild(article);
    }
  }

  //Githubdata

  export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
  }
  
  