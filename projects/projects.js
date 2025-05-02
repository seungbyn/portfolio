import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadProjects() {
  const projects = await fetchJSON('../lib/projects.json');
  const projectsContainer = document.querySelector('.projects');
  const searchInput = document.querySelector('.searchBar');
  const svg = d3.select('#projects-pie-plot');
  const legend = d3.select('.legend');

  // State
  let query = '';
  let selectedYears = new Set(); // ⬅ allows multiple selection
  let currentPieData = [];

  // Initial render
  renderAll(projects);

  // Search interactivity
  searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    const filtered = filterProjects(projects, query, selectedYears);
    renderProjects(filtered, projectsContainer, 'h2');
    renderPieChart(filtered);
  });

  function filterProjects(data, query, selectedYearsSet) {
    return data.filter((project) => {
      const matchesQuery = Object.values(project)
        .join('\n')
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesYear =
        selectedYearsSet.size === 0 || selectedYearsSet.has(project.year);

      return matchesQuery && matchesYear;
    });
  }

  function renderAll(projectList) {
    renderProjects(projectList, projectsContainer, 'h2');
    renderPieChart(projectList);
  }

  function renderPieChart(projectsGiven) {
    // Group by year
    const rolled = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year
    );

    const data = rolled.map(([year, count]) => ({
      label: year,
      value: count,
    }));

    currentPieData = data;

    const arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    const sliceGenerator = d3.pie().value((d) => d.value);
    const arcData = sliceGenerator(data);
    const colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Clear old content
    svg.selectAll('path').remove();
    legend.selectAll('li').remove();

    // Draw wedges
    svg
      .selectAll('path')
      .data(arcData)
      .enter()
      .append('path')
      .attr('d', arcGenerator)
      .attr('fill', (_, idx) => colors(idx))
      .attr('data-year', (_, idx) => data[idx].label)
      .classed('selected', (_, idx) => selectedYears.has(data[idx].label))
      .on('click', function (_, idx) {
        const year = data[idx].label;
        // Toggle year in Set
        if (selectedYears.has(year)) {
          selectedYears.delete(year);
        } else {
          selectedYears.add(year);
        }
        const filtered = filterProjects(projects, query, selectedYears);
        renderProjects(filtered, projectsContainer, 'h2');
        renderPieChart(filtered);
      });

    // Draw legend
    legend
      .selectAll('li')
      .data(data)
      .enter()
      .append('li')
      .attr('style', (_, idx) => `--color:${colors(idx)}`)
      .attr('data-year', (d) => d.label)
      .classed('selected', (d) => selectedYears.has(d.label))
      .html((d, idx) => `<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', function (_, idx) {
        const year = data[idx].label;
        if (selectedYears.has(year)) {
          selectedYears.delete(year);
        } else {
          selectedYears.add(year);
        }
        const filtered = filterProjects(projects, query, selectedYears);
        renderProjects(filtered, projectsContainer, 'h2');
        renderPieChart(filtered);
      });
  }
}

loadProjects();


/*import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


async function loadProjects() {
  const projects = await fetchJSON('../lib/projects.json');
  console.log('Loaded projects:', projects);
  const projectsContainer = document.querySelector('.projects');
  const searchInput = document.querySelector('.searchBar');

  // Render full project list and pie chart on load
  renderProjects(projects, projectsContainer, 'h2');
  renderPieChart(projects);

  // Declare query state
  let query = '';

  // SEARCH BAR INTERACTIVITY
  searchInput.addEventListener('input', (event) => {
    query = event.target.value;

    let filteredProjects = projects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query.toLowerCase());
    });

    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
  });

  // PIE CHART RENDER FUNCTION
  function renderPieChart(projectsGiven) {
    // Rollup: count projects per year
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year
    );

    // Map rolled data to { label, value } for pie chart
    let newData = newRolledData.map(([year, count]) => ({
      label: year,
      value: count,
    }));

    // D3 setup: arc generator, pie slice generator, color scale
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(newData);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    // Clear existing chart + legend
    let svg = d3.select('#projects-pie-plot');
    svg.selectAll('path').remove();

    let legend = d3.select('.legend');
    legend.selectAll('li').remove();

    // Draw arcs
    arcData.forEach((d, idx) => {
      svg
        .append('path')
        .attr('d', arcGenerator(d))
        .attr('fill', colors(idx));
    });

    // Draw legend
    newData.forEach((d, idx) => {
      legend
        .append('li')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
  }
}

loadProjects();
*/

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


