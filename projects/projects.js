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

let data = [1, 2, 3, 4, 5, 5];
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Create the pie slice angle generator
let sliceGenerator = d3.pie(); 
let arcData = sliceGenerator(data); // [{startAngle, endAngle, value}, ...]
let arcs = arcData.map((d) => arcGenerator(d));

let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Append each arc to the SVG
let svg = d3.select('#projects-pie-plot'); 
arcs.forEach((arc, idx) => {svg.append('path').attr('d', arc).attr('fill', colors(idx));});