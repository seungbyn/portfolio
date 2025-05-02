import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadProjects() {
  const projects = await fetchJSON('../lib/projects.json');
  const projectsContainer = document.querySelector('.projects');

  // Render all projects at once
  renderProjects(projects, projectsContainer, 'h2');

  // Update the title with number of projects
  const projectsTitle = document.querySelector('.projects-title');
  if (projectsTitle) {
    projectsTitle.textContent = `Projects (${projects.length})`;
  }
}

loadProjects();

//Pie Chart
const projects = await fetchJSON('../lib/projects.json');
/*let rolledData = d3.rollups(
    projects,
    v => v.length,
    d => d.year
  );
  
let data = rolledData.map(([year, count]) => ({ value: count, label: year }));

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Create the pie slice angle generator
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data); // [{startAngle, endAngle, value}, ...]
let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Append each arc to the SVG
let svg = d3.select('#projects-pie-plot'); 
arcs.forEach((arc, idx) => {svg.append('path').attr('d', arc).attr('fill', colors(idx));});

//legend
let legend = d3.select('.legend');
data.forEach((d, idx) => {
  legend
    .append('li')
    .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
    .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
});
*/
function renderPieChart(projectsGiven) {
    // Clear old paths and legend
    d3.select('svg').selectAll('path').remove();
    d3.select('.legend').selectAll('li').remove();
  
    let rolled = d3.rollups(projectsGiven, v => v.length, d => d.year);
    let data = rolled.map(([year, count]) => ({ value: count, label: year }));
  
    let sliceGen = d3.pie().value(d => d.value);
    let arcGen = d3.arc().innerRadius(0).outerRadius(50);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
    let arcs = sliceGen(data).map(d => arcGen(d));
  
    arcs.forEach((arc, idx) => {
      d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx));
    });
  
    let legend = d3.select('.legend');
    data.forEach((d, idx) => {
      legend.append('li')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}
  
renderPieChart(projects); // on load
  

//searching 
let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value;
  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});



