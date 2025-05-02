import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadProjects() {
  const projects = await fetchJSON('../lib/projects.json'); // ✅ Double check this path!
  const projectsContainer = document.querySelector('.projects');
  const searchInput = document.querySelector('.searchBar');
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');

  // State
  let query = '';
  let selectedIndex = -1;

  // Initial render
  renderAll(projects);

  // Search bar interactivity
  searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    const filtered = filterProjects(projects, query, selectedIndex);
    renderProjects(filtered, projectsContainer, 'h2');
    renderPieChart(filtered);
  });

  // ---------- HELPERS ---------- //

  function filterProjects(data, query, selectedIndex) {
    return data.filter((project) => {
      const matchQuery = Object.values(project)
        .join('\n')
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchYear =
        selectedIndex === -1 ||
        project.year === currentPieData[selectedIndex]?.label;

      return matchQuery && matchYear;
    });
  }

  let currentPieData = [];

  function renderAll(projectList) {
    renderProjects(projectList, projectsContainer, 'h2');
    renderPieChart(projectList);
  }

  function renderPieChart(projectsGiven) {
    // Rollup by year
    let rolled = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year
    );

    let data = rolled.map(([year, count]) => ({
      label: year,
      value: count,
    }));

    currentPieData = data; // Needed for matching year by index

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Clear previous
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    // Re-render arcs
    arcData.forEach((d, i) => {
      svg
        .append('path')
        .attr('d', arcGenerator(d))
        .attr('fill', colors(i))
        .attr('class', i === selectedIndex ? 'selected' : '')
        .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
          const filtered = filterProjects(projects, query, selectedIndex);
          renderProjects(filtered, projectsContainer, 'h2');
          renderPieChart(filtered);
        });
    });

    // Re-render legend
    data.forEach((d, i) => {
      legend
        .append('li')
        .attr('style', `--color:${colors(i)}`)
        .attr('class', i === selectedIndex ? 'selected' : '')
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
          const filtered = filterProjects(projects, query, selectedIndex);
          renderProjects(filtered, projectsContainer, 'h2');
          renderPieChart(filtered);
        });
    });
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
/*
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
*/


