import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));
  
    return data;
}

function processCommits(data) {
    return d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;
  
            let ret = {
                id: commit,
                url: 'https://github.com/vis-society/lab-7/commit/' + commit,
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };
  
            Object.defineProperty(ret, 'lines', {
                value: lines,
                enumerable: false, // Do not include in console output
                writable: true,
                configurable: true,
            });
  
            return ret;
        });
}

function renderCommitInfo(data, commits) {
    // Clear previous content
    d3.select('#stats').selectAll('*').remove();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">Lines of Code</abbr>');
    dl.append('dd').text(data.length);
  
    // Total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Total files
    const fileCount = d3.group(data, d => d.file).size;
    dl.append('dt').text('Total files');
    dl.append('dd').text(fileCount);
  
    // Day of the week with most work
    const workByDay = d3.rollups(
        data,
        v => v.length,
        d => new Date(d.datetime).toLocaleString('en-US', { weekday: 'long' })
    );
  
    const maxDay = d3.greatest(workByDay, d => d[1])?.[0];
    dl.append('dt').text('Day of the week with most work');
    dl.append('dd').text(maxDay);
  
}

function renderScatterPlot(data, commits) {
    const width = 1000;
    const height = 600;
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };
    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width])
        .nice();
      
      const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    const dots = svg.append('g').attr('class', 'dots');

    dots
        .selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue');
}
  
  
  
  
let data = await loadData();
let commits = processCommits(data);
console.log(commits);
  
renderCommitInfo(data, commits);
renderScatterPlot(data, commits);
