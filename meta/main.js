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
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Total files
    const fileCount = d3.group(data, d => d.file).size;
    dl.append('dt').text('Total files');
    dl.append('dd').text(fileCount);
  
    // Longest line
    const longestLine = d3.max(data, d => d.line.length);
    dl.append('dt').text('Longest line length (characters)');
    dl.append('dd').text(longestLine);
  
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
  
  
let data = await loadData();
let commits = processCommits(data);
console.log(commits);
  
renderCommitInfo(data, commits);
