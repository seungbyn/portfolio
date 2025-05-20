import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// Global Variables
let xScale, yScale;
let filteredCommits = [];
let commitProgress = 100;
let timeScale;
let commitMaxTime;
let commits = [];
let fileTypeColors = d3.scaleOrdinal(d3.schemeTableau10);

let NUM_ITEMS = 100;
let ITEM_HEIGHT = 100;
let VISIBLE_COUNT = 6;
let totalHeight = (NUM_ITEMS - 1) * ITEM_HEIGHT;

const scrollContainer = d3.select('#scroll-container');
const spacer = d3.select('#spacer');
const itemsContainer = d3.select('#items-container');

spacer.style('height', `${totalHeight}px`);


/**
 * Load data from CSV and convert necessary fields to appropriate data types.
 */
async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));
    return data;
}

/**
 * Process commits data by grouping by commit ID and extracting key information.
 */
function processCommits(data) {
    return d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
        const first = lines[0];
        const { author, datetime } = first;
        return {
            id: commit,
            url: `https://github.com/vis-society/lab-7/commit/${commit}`,
            author,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            totalLines: lines.length,
            lines,
        };
    });
}

/**
 * Update the time scale based on the commits data.
 */
function updateTimeScale(commits) {
    timeScale = d3.scaleTime()
        .domain([d3.min(commits, d => d.datetime), d3.max(commits, d => d.datetime)])
        .range([0, 100]);
    commitMaxTime = timeScale.invert(commitProgress);
}

/**
 * Filter commits based on the selected time range.
 */
function filterCommitsByTime() {
    filteredCommits = commits.filter(commit => commit.datetime <= commitMaxTime);
}

/**
 * Update the slider and trigger data filtering and plot rendering.
 */
/**
 * Update the slider and trigger data filtering, plot rendering, and file visualization.
 */
function updateSlider() {
    const slider = document.getElementById('commit-slider');
    const selectedTime = document.getElementById('selectedTime');

    slider.addEventListener('input', function () {
        commitProgress = +this.value;
        commitMaxTime = timeScale.invert(commitProgress);
        selectedTime.textContent = commitMaxTime.toLocaleString('en-US', { dateStyle: "long", timeStyle: "short" });

        filterCommitsByTime();

        // Update scatter plot and file visualization
        renderScatterPlot(filteredCommits);
        renderFileVisualization(); 
    });

    const initialTime = timeScale.invert(commitProgress);
    selectedTime.textContent = initialTime.toLocaleString('en-US', { dateStyle: "long", timeStyle: "short" });
}



/**
 * Render scatter plot with data points, brush, and tooltips.
 */
function renderScatterPlot(commits) {
    const width = 1000;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    let svg = d3.select('#chart').select('svg');
    if (svg.empty()) {
        svg = d3.select('#chart').append('svg')
            .attr('width', width)
            .attr('height', height);
    }

    const usableArea = {
        left: margin.left,
        right: width - margin.right,
        top: margin.top,
        bottom: height - margin.bottom,
    };

    xScale = d3.scaleTime()
        .domain(d3.extent(commits, d => d.datetime))
        .range([usableArea.left, usableArea.right]);

    yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    const rScale = d3.scaleSqrt()
        .domain(d3.extent(commits, d => d.totalLines))
        .range([2, 30]);

    // Create gridlines
    const xGrid = d3.axisBottom(xScale)
        .tickSize(-usableArea.bottom + usableArea.top)
        .tickFormat('');

    const yGrid = d3.axisLeft(yScale)
        .tickSize(-usableArea.right + usableArea.left)
        .tickFormat('');

    // Append X gridlines
    svg.selectAll('.x-grid').remove();
    svg.append('g')
        .attr('class', 'x-grid grid')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xGrid);

    // Append Y gridlines
    svg.selectAll('.y-grid').remove();
    svg.append('g')
        .attr('class', 'y-grid grid')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yGrid);

    // Create X and Y axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b %d"));
    const yAxis = d3.axisLeft(yScale).ticks(10);

    // Append X axis
    svg.selectAll('.x-axis').remove();
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    // Append Y axis
    svg.selectAll('.y-axis').remove();
    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    // Axis Labels
    svg.selectAll('.x-axis-label').remove();
    svg.append('text')
        .attr('class', 'x-axis-label axis-label')
        .attr('x', usableArea.left + (usableArea.right - usableArea.left) / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .text('Date');

    svg.selectAll('.y-axis-label').remove();
    svg.append('text')
        .attr('class', 'y-axis-label axis-label')
        .attr('x', -usableArea.top - (usableArea.bottom - usableArea.top) / 2)
        .attr('y', 15)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text('Time');


    // Brush
    const brush = d3.brush()
        .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
        .on('end', brushed);

    svg.selectAll('.brush').remove();
    svg.append('g').attr('class', 'brush').call(brush);

    function brushed(event) {
        const selection = event.selection;
        if (!selection) return;

        const [[x0, y0], [x1, y1]] = selection;
        const selectedCommits = filteredCommits.filter(commit => {
            const cx = xScale(commit.datetime);
            const cy = yScale(commit.hourFrac);
            return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
        });

        renderSelectionCount(selectedCommits.length);
    }

    const dots = svg.selectAll('.dots').data([null]);
    const dotContainer = dots.enter().append('g').attr('class', 'dots').merge(dots);

    const circles = dotContainer.selectAll('circle')
        .data(commits, d => d.id);

    circles.exit().transition().duration(300).attr('r', 0).remove();

    circles.enter()
        .append('circle')
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', 0)
        .style('fill', '#42a5f5')
        .on('mouseenter', (event, d) => {
            renderTooltipContent(d);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mousemove', updateTooltipPosition)
        .on('mouseleave', () => updateTooltipVisibility(false))
        .transition()
        .duration(400)
        .attr('r', d => rScale(d.totalLines));

    circles.transition()
        .duration(400)
        .attr('cx', d => xScale(d.datetime))
        .attr('cy', d => yScale(d.hourFrac))
        .attr('r', d => rScale(d.totalLines));
}

/**
 * Render file unit visualization after filtering
 */
/**
 * Render file unit visualization with colors based on line type
 */
function renderFileVisualization() {
    let lines = filteredCommits.flatMap(d => d.lines);
    let files = d3.groups(lines, d => d.file).map(([name, lines]) => ({ name, lines }));

    // Sort files by number of lines in descending order
    files = d3.sort(files, (a, b) => b.lines.length - a.lines.length);

    // Select the container for files
    const filesContainer = d3.select('.files').selectAll('div').data(files, d => d.name);

    // Remove old entries
    filesContainer.exit().remove();

    // ENTER new files
    const newFiles = filesContainer.enter().append('div');

    // Append filename and line count
    newFiles.append('dt')
        .html(d => `<code>${d.name}</code> <small>${d.lines.length} lines</small>`);

    // Append dd for lines
    const dd = newFiles.append('dd');

    // Merge with existing
    const allFiles = newFiles.merge(filesContainer);

    // Update the filename and line count text
    allFiles.select('dt')
        .html(d => `<code>${d.name}</code> <small>${d.lines.length} lines</small>`);

    // Update the lines with new data
    const lineSelection = allFiles.selectAll('dd')
        .selectAll('.line')
        .data(d => d.lines, d => d.line);  // Use `line` as a unique identifier

    console.log(allFiles);
    // EXIT
    lineSelection.exit()
        .transition()
        .duration(300)
        .style('opacity', 0)
        .remove();

    // ENTER
    lineSelection.enter()
        .append('div')
        .attr('class', 'line')
        .style('background', d => fileTypeColors(d.type)) // Apply color based on `type`
        .style('opacity', 0)
        .transition()
        .duration(400)
        .style('opacity', 1);

    // UPDATE
    lineSelection.transition()
        .duration(400)
        .style('background', d => fileTypeColors(d.type)); // Update color based on `type`
}






/**
 * Render tooltip content.
 */
function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime.toLocaleDateString();
    time.textContent = commit.datetime.toLocaleTimeString();
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.opacity = isVisible ? 1 : 0;
}

function renderSelectionCount(count) {
    document.getElementById('selection-count').textContent = `${count || 'No'} commits selected`;
}


//Scroll Listener
scrollContainer.on('scroll', () => {
    const scrollTop = scrollContainer.property('scrollTop');
    let startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
    startIndex = Math.max(0, Math.min(startIndex, commits.length - VISIBLE_COUNT));
    renderItems(startIndex);
});

/**
 * Render scrollytelling items with a narrative
 */
function renderItems(startIndex) {
    itemsContainer.selectAll('div').remove();

    const endIndex = Math.min(startIndex + VISIBLE_COUNT, commits.length);
    const newCommitSlice = commits.slice(startIndex, endIndex);

    // Update the scatter plot based on the current slice
    renderScatterPlot(newCommitSlice);

    // Render narrative items
    itemsContainer.selectAll('div')
        .data(newCommitSlice)
        .enter()
        .append('div')
        .attr('class', 'item')
        .style('position', 'absolute')
        .style('top', (_, idx) => `${idx * ITEM_HEIGHT}px`)
        .html((commit, index) => {
        return `
            <p>
            On ${commit.datetime.toLocaleString("en", { dateStyle: "full", timeStyle: "short" })}, I made 
            <a href="${commit.url}" target="_blank">
                ${index > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'}
            </a>. 
            I edited ${commit.totalLines} lines across ${d3.rollups(commit.lines, d => d.length, d => d.file).length} files.
            Then I looked over all I had made, and I saw that it was very good.
            </p>
        `;
        });
}







/**
 * Initialize visualization.
 */
(async function init() {
    const data = await loadData();
    commits = processCommits(data);

    updateTimeScale(commits);
    updateSlider();
    filterCommitsByTime();
    renderScatterPlot(filteredCommits);
    renderFileVisualization();
})();
