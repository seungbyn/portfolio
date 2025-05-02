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

let data = [1, 2];
let total = data.reduce((a, b) => a + b, 0);
let angle = 0;
let arcData = [];

for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = ['gold', 'purple'];

arcs.forEach((arc, idx) => {
  d3.select('svg').append('path').attr('d', arc).attr('fill', colors[idx]);
});