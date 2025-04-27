import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');


//github
const githubData = await fetchGitHubData('seungbyn'); // <-- replace with your GitHub username

const profileStats = document.querySelector('#profile-stats');

if (profileStats) {
  profileStats.innerHTML = `
    <dl>
      <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
      <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
      <dt>Followers:</dt><dd>${githubData.followers}</dd>
      <dt>Following:</dt><dd>${githubData.following}</dd>
    </dl>
  `;
}

/*
<script type="module">
        import { fetchJSON } from './global.js';
        
        fetchJSON('https://seungbyn.github.io/portfolio/lib/projects.json').then(data => {
            console.log('Fetched data:', data);
        });
    </script>
    <script type="module">
        import { renderProjects, fetchJSON } from './global.js';
        
        // FETCH from correct path: "./lib/projects.json"
        fetchJSON('./lib/projects.json')
          .then(data => {
            const container = document.querySelector('.projects');
            container.innerHTML = ''; // clear if needed
            for (const project of data) {
              renderProjects(project, container, 'h3');
            }
          })
          .catch(error => {
            console.error('Error loading project data:', error);
          });
    </script>
    */