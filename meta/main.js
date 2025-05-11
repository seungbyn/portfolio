import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let xScale, yScale;

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

function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleDateString('en-US');
    time.textContent = commit.datetime?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.opacity = isVisible ? 1 : 0;
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    const padding = 10;
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    let left = event.clientX + padding;
    let top = event.clientY + padding;

    if (left + tooltipWidth > window.innerWidth) {
        left = event.clientX - tooltipWidth - padding;
    }
    if (top + tooltipHeight > window.innerHeight) {
        top = event.clientY - tooltipHeight - padding;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
}

function renderSelectionCount(count) {
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${count || 'No'} commits selected`;
}

function renderScatterPlot(data, commits) {
    const width = 1000;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };

    const svg = d3.select('#chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    const usableArea = {
        left: margin.left,
        right: width - margin.right,
        top: margin.top,
        bottom: height - margin.bottom,
    };

    // Scales
    xScale = d3.scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top])
        .nice();

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

    const rScale = d3.scaleSqrt()
        .domain([minLines, maxLines])
        .range([2, 30]);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat('%b %d'));
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => `${d}:00`);

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    // Sort by totalLines for better interaction handling
    const sortedCommits = commits.sort((a, b) => b.totalLines - a.totalLines);

    // Dots
    const dots = svg.append('g').attr('class', 'dots');

    dots.selectAll('circle')
        .data(sortedCommits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .style('fill', '#42a5f5')
        .style('fill-opacity', 0.7)
        .on('mouseenter', function (event, commit) {
            d3.select(this).style('fill-opacity', 1);
            renderTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mousemove', updateTooltipPosition)
        .on('mouseleave', function () {
            d3.select(this).style('fill-opacity', 0.7);
            updateTooltipVisibility(false);
        });

    // Brush
    const brush = d3.brush()
        .extent([[usableArea.left, usableArea.top], [usableArea.right, usableArea.bottom]])
        .on('start brush end', brushed);

    svg.append('g').call(brush);

    function brushed(event) {
        const selection = event.selection;

        if (!selection) {
            d3.selectAll('circle').classed('selected', false);
            renderSelectionCount(0);
            return;
        }

        const [[x0, y0], [x1, y1]] = selection;

        const selectedCommits = sortedCommits.filter((commit) => {
            const cx = xScale(commit.datetime);
            const cy = yScale(commit.hourFrac);
            return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
        });

        d3.selectAll('circle')
            .classed('selected', (d) => selectedCommits.includes(d));

        renderSelectionCount(selectedCommits.length);
    }
}

(async function () {
    const data = await loadData();
    const commits = processCommits(data);
    renderScatterPlot(data, commits);
})();
