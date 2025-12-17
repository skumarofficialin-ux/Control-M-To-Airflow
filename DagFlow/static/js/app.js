document.getElementById('jsonFileInput').addEventListener('change', handleFileUpload);

let controlMData = null;

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                controlMData = { jobs: data.jobs };
                buildFolderStructure();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Upload failed');
        });
    }
}

function buildFolderStructure() {
    const folderDiv = document.getElementById('folderStructure');
    folderDiv.innerHTML = '<h2>Jobs</h2><ul class="tree" id="jobTree"></ul>';
    const tree = document.getElementById('jobTree');

    // Build a map of jobs
    const jobMap = {};
    controlMData.jobs.forEach(job => {
        jobMap[job.name] = job;
    });

    // Find root jobs (those not depended on by others)
    const allDeps = new Set();
    controlMData.jobs.forEach(job => {
        job.dependencies?.forEach(dep => allDeps.add(dep));
    });
    const rootJobs = controlMData.jobs.filter(job => !allDeps.has(job.name));

    // Build tree
    rootJobs.forEach(job => {
        const li = buildTreeItem(job, jobMap);
        tree.appendChild(li);
    });
}

function buildTreeItem(job, jobMap) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="job" data-job="${job.name}">${job.name}</span>`;
    li.querySelector('.job').addEventListener('click', () => showJobDetails(job));

    if (job.dependencies && job.dependencies.length > 0) {
        li.classList.add('has-children');
        const ul = document.createElement('ul');
        ul.className = 'tree';
        job.dependencies.forEach(depName => {
            const depJob = jobMap[depName];
            if (depJob) {
                const childLi = buildTreeItem(depJob, jobMap);
                ul.appendChild(childLi);
            }
        });
        li.appendChild(ul);
        li.addEventListener('click', function(e) {
            if (e.target.classList.contains('job')) return; // Don't toggle if clicking on job name
            this.classList.toggle('expanded');
        });
    }

    return li;
}

function showJobDetails(job) {
    const detailsDiv = document.getElementById('jobDetails');
    detailsDiv.innerHTML = `
        <h2>${job.name}</h2>
        <p><strong>Type:</strong> ${job.type}</p>
        <p><strong>Command:</strong> ${job.command}</p>
        <p><strong>Description:</strong> ${job.description}</p>
        <p><strong>Schedule:</strong> ${job.schedule}</p>
        <h3>Events</h3>
        <p><strong>Add:</strong> ${job.events?.add?.join(', ') || 'None'}</p>
        <p><strong>Delete:</strong> ${job.events?.delete?.join(', ') || 'None'}</p>
        <p><strong>Wait For:</strong> ${job.events?.waitfor?.join(', ') || 'None'}</p>
        <h3>Dependency Graph</h3>
        <div id="dependencyGraph"></div>
    `;
    renderDependencyGraph(job);
}

function renderDependencyGraph(job) {
    const graphDiv = document.getElementById('dependencyGraph');
    graphDiv.innerHTML = ''; // Clear previous graph

    // Prepare data for D3
    const nodes = [{ id: job.name, group: 'main', label: job.name }];
    const links = [];

    // Add dependencies as nodes and links
    job.dependencies?.forEach(dep => {
        const depJob = controlMData.jobs.find(j => j.name === dep);
        nodes.push({ id: dep, group: 'dependency', label: dep });
        links.push({ source: job.name, target: dep });
    });

    // Add events as nodes
    ['add', 'delete', 'waitfor'].forEach(eventType => {
        job.events?.[eventType]?.forEach(event => {
            const eventJob = controlMData.jobs.find(j => j.name === event);
            if (eventJob) {
                nodes.push({ id: event, group: eventType, label: event });
                links.push({ source: job.name, target: event });
            } else {
                // If not a job, still add as event node
                nodes.push({ id: event, group: eventType, label: event });
                links.push({ source: job.name, target: event });
            }
        });
    });

    // Remove duplicates
    const uniqueNodes = nodes.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    const width = graphDiv.clientWidth || 600;
    const height = 400;

    const svg = d3.select('#dependencyGraph').append('svg')
        .attr('width', width)
        .attr('height', height)
        .call(d3.zoom().on('zoom', function(event) {
            g.attr('transform', event.transform);
        }))
        .append('g');

    const g = svg.append('g');

    // Add zoom controls
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', function(event) {
            g.attr('transform', event.transform);
        });

    d3.select('#dependencyGraph svg').call(zoom);

    // Add fit to screen button
    d3.select('#dependencyGraph').append('button')
        .attr('class', 'fit-button')
        .text('Fit to Screen')
        .on('click', function() {
            const bounds = g.node().getBBox();
            const fullWidth = bounds.width,
                  fullHeight = bounds.height;
            const midX = bounds.x + fullWidth / 2,
                  midY = bounds.y + fullHeight / 2;
            const scale = 0.8 / Math.max(fullWidth / width, fullHeight / height);
            const translate = [width / 2 - scale * midX, height / 2 - scale * midY];

            d3.select('#dependencyGraph svg')
                .transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
        });

    // Add legend at the bottom
    const legend = d3.select('#dependencyGraph').append('div')
        .attr('class', 'legend')
        .style('margin-top', '10px');

    legend.append('div').html('<span style="color: red;">●</span> Main Job');
    legend.append('div').html('<span style="color: blue;">●</span> Dependency');
    legend.append('div').html('<span style="color: green;">●</span> Add Event');
    legend.append('div').html('<span style="color: orange;">●</span> Delete Event');
    legend.append('div').html('<span style="color: purple;">●</span> Wait For Event');

    const simulation = d3.forceSimulation(uniqueNodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => Math.max(50, d.label.length * 4)));

    const link = g.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line')
        .attr('stroke-width', 2);

    const node = g.append('g')
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .selectAll('g')
        .data(uniqueNodes)
        .join('g')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));

    node.append('rect')
        .attr('width', d => Math.max(80, d.label.length * 8))
        .attr('height', 30)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('fill', d => {
            if (d.group === 'main') return 'red';
            if (d.group === 'dependency') return 'blue';
            if (d.group === 'add') return 'green';
            if (d.group === 'delete') return 'orange';
            if (d.group === 'waitfor') return 'purple';
            return 'gray';
        })
        .attr('x', d => -Math.max(40, d.label.length * 4))
        .attr('y', -15);

    node.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('font-size', '11px')
        .attr('font-weight', 'lighter')
        .attr('fill', '#333')
        .text(d => d.label);

    // Remove the separate labels group since text is now inside node
    // const labels = ... remove this

    // Tooltip with more details
    d3.select('#dependencyGraph .tooltip').remove(); // Remove previous tooltip
    const tooltip = d3.select('#dependencyGraph').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'lightsteelblue')
        .style('padding', '5px')
        .style('border-radius', '5px')
        .style('pointer-events', 'none');

    node.on('mouseover', function(event, d) {
            const jobDetails = controlMData.jobs.find(j => j.name === d.id);
            let tooltipContent = `<strong>${d.label}</strong><br>Type: ${d.group}`;
            if (jobDetails) {
                tooltipContent += `<br>Schedule: ${jobDetails.schedule}<br>Command: ${jobDetails.command}`;
            }
            const rect = graphDiv.getBoundingClientRect();
            tooltip.transition().duration(200).style('opacity', 0.9);
            tooltip.html(tooltipContent)
                .style('left', (event.clientX - rect.left + 5) + 'px')
                .style('top', (event.clientY - rect.top - 28) + 'px');
        })
        .on('mouseout', function(d) {
            tooltip.transition().duration(500).style('opacity', 0);
        });

    simulation.on('tick', () => {
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        node
            .attr('transform', d => `translate(${d.x}, ${d.y})`);
    });

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
}