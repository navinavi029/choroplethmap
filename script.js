// Load the data
Promise.all([
    d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'),
    d3.json('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json')
]).then(([counties, education]) => {
    // Create SVG container
    const width = 960;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const svg = d3.select('#map')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // Create tooltip
    const tooltip = d3.select('#tooltip');

    // Create color scale
    const colorScale = d3.scaleQuantize()
        .domain([0, d3.max(education, d => d.bachelorsOrHigher)])
        .range(d3.schemeBlues[5]);

    // Create path generator
    const path = d3.geoPath();

    // Draw counties
    svg.append('g')
        .selectAll('path')
        .data(topojson.feature(counties, counties.objects.counties).features)
        .enter()
        .append('path')
        .attr('class', 'county')
        .attr('d', path)
        .attr('data-fips', d => d.id)
        .attr('data-education', d => {
            const countyData = education.find(item => item.fips === d.id);
            return countyData ? countyData.bachelorsOrHigher : 0;
        })
        .attr('fill', d => {
            const countyData = education.find(item => item.fips === d.id);
            return countyData ? colorScale(countyData.bachelorsOrHigher) : '#ccc';
        })
        .on('mouseover', (event, d) => {
            const countyData = education.find(item => item.fips === d.id);
            if (countyData) {
                tooltip
                    .attr('data-education', countyData.bachelorsOrHigher)
                    .style('opacity', 0.9)
                    .html(`
                        ${countyData.area_name}, ${countyData.state}: ${countyData.bachelorsOrHigher}%
                    `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            }
        })
        .on('mouseout', () => {
            tooltip.style('opacity', 0);
        });

    // Create legend
    const legendWidth = 300;
    const legendHeight = 30;
    const legend = d3.select('#legend')
        .append('svg')
        .attr('width', legendWidth)
        .attr('height', legendHeight);

    const legendScale = d3.scaleLinear()
        .domain([0, d3.max(education, d => d.bachelorsOrHigher)])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickFormat(d => `${d}%`);

    legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(legendAxis);

    // Add color rectangles to legend
    const legendColors = d3.schemeBlues[5];
    const legendRectWidth = legendWidth / legendColors.length;

    legend.selectAll('rect')
        .data(legendColors)
        .enter()
        .append('rect')
        .attr('x', (d, i) => i * legendRectWidth)
        .attr('y', 0)
        .attr('width', legendRectWidth)
        .attr('height', legendHeight)
        .attr('fill', d => d);
}); 