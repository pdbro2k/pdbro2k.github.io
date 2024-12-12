"use strict";

//function initD3Graph(selector, nodes, links, groupColors, addTexts = false, manyBodyForceStrength = -1000, width = window.innerWidth, height = window.innerHeight) {
function initD3Graph(selector, nodes, links, conf, width = window.innerWidth, height = window.innerHeight) {
  // get params from conf or use defaults  
  var addTexts = "addTexts" in conf ? conf.addTexts : false;

  var nodeSize = "nodeSize" in conf ? conf.nodeSize : 10;
  var markerWidth = "markerWidth" in conf ? conf.markerWidth : 6;
  var markerHeight = "markerHeight" in conf ? conf.markerHeight : 6;
  var linkSize = "linkSize" in conf ? conf.linkSize : 1;
  
  var groupColors = "groupColors" in conf ? conf.groupColors : {};
  var highlightingColor = "highlightingColor" in conf ? conf.highlightingColor : "#FFA500";
  var linkColor = "linkColor"  in conf ? conf.linkColor : "#E5E5E5";
  
  var manyBodyForceStrength = "manyBodyForceStrength" in conf ? conf.manyBodyForceStrength : -1000;

  // init dragDrop
  var dragDrop = d3.drag().on('start', function(event, node) {
    node.fx = node.x;
    node.fy = node.y;
  }).on('drag', function(event, node) {
    simulation.alphaTarget(0.7).restart();
    node.fx = event.x;
    node.fy = event.y;
  }).on('end', function(event, node) {
    if (!event.active) {
      simulation.alphaTarget(0);
    }
    node.fx = null;
    node.fy = null;
  });

  // build svg root
  var svg = d3.select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", function(event) {
      svg.attr("transform", event.transform);
    }));

  // build the arrowheads for directed edges
  var defs = svg.append("svg:defs");
  // create distinct arrowheads for each strength in the data
  new Set(links.map(x => x.strength)).forEach(function(value) {
    appendArrowhead(defs, getArrowheadId(value), linkColor, value);
    appendArrowhead(defs, getArrowheadId(value, true), highlightingColor, value);
  });
  // add a default for links wo/ strengths
  appendArrowhead(defs, getArrowheadId(), linkColor);
  appendArrowhead(defs, getArrowheadId(), highlightingColor);
  
    function getArrowhead(node, link) {
    return link.directed ? getArrowheadUrl(link.strength, isNeighborLink(node, link)) : "";
  }

  function getArrowheadId(linkSize="", isHighlighted=false) {
    if (isHighlighted)
      return "arrowhead_" + linkSize;
    return "highlightedArrowhead_" + linkSize;
  }

  function getArrowheadUrl(linkSize="", isHighlighted=false) {
    return "url(#" + getArrowheadId(linkSize, isHighlighted) + ")";
  }

  function getArrowheadOffset(nodeSize, markerWidth, markerHeight, linkSize=1) {
    return 2 * (nodeSize/2 + Math.sqrt(markerWidth**2 + markerHeight**2)/linkSize) - Math.sqrt(2) // MEMO: this formula is based on trial and error and can probably be improved;
  }

  function appendArrowhead(defs, id, color, linkSize=1) {
    defs.append("svg:marker")
      .attr("id", id)
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", getArrowheadOffset(nodeSize, markerWidth, markerHeight, linkSize))
      .attr("refY", 0)
      .attr("markerWidth", markerWidth)
      .attr("markerHeight", markerHeight)
      .attr("orient", "auto")
      .append("svg:path")
          .attr("d", "M 0,-5 L 10 ,0 L 0,5")
          .attr('fill', color);
  }

  // add the links and arrows
  svg = svg.append("g");

  // build links and nodes with (tooltip) texts
  var linkElements = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter()
    .append("line")
        .attr("stroke-width", function(link) {
		  return link.strength ? linkSize * link.strength : linkSize;
        })
        .attr("stroke", linkColor)
        .attr("class", "link")
        .attr("id", function(link, idx) {
          return "edge_" + idx;
        })
        .attr('marker-end', function(link) {
          return link.directed ? getArrowheadUrl(link.strength) : "";
        });

  var nodeWrappers = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(nodes)
    .enter()
    .append("g");

   nodeWrappers.each(function(node) {
	   if (node.img) {
		   var currentNodeElement = d3.select(this).append("svg:image")
			  .attr('xlink:href', function(node) { return node.img; })
			  .attr('width', function(node) {
				  return 3 * (node.strength ? nodeSize * node.strength : nodeSize);
				})
			  .attr('height', function(node) {
				  return 3 * (node.strength ? nodeSize * node.strength : nodeSize);
				});
	   } else {
		   var currentNodeElement = d3.select(this).append("svg:circle")
			  .attr("r", function(node) {
				  return node.strength ? nodeSize * node.strength : nodeSize;
				})
			  .attr('x', function(node) { return(node.x) })
			  .attr('y', function(node) { return(node.y) })
			  .attr("fill", getNodeColor);			   
	   }
	   currentNodeElement.attr('class', 'node');
		currentNodeElement.call(dragDrop).on('click', selectNode);
   });
  let nodeElements = d3.selectAll("g.nodes g .node");
  nodeElements.append("svg:title")
    .text(function(node) {
        return node.text ? node.text : node.id;
    });

  var textElements = null;
  if (addTexts) {
    nodeWrappers.each(function(node) {
        if (node.url) {
			var currentTextElement = d3.select(this).append("svg:a")
                .attr("xlink:href", function(node) {
                    return node.url ? node.url : "";
                })
                .attr("xlink:target", "_blank") // MEMO: not yet working as expected
				.append("svg:text");
        } else {
			var currentTextElement = d3.select(this).append("svg:text");
		}
        currentTextElement.text(function(node) {
            return node.text ? node.text : node.id;
        });
		return currentTextElement;
    });
	textElements = d3.selectAll("g.nodes g text");
  }

  // init simulation with forces
  var linkForce = d3.forceLink()
    .id(function(link) {
      return link.id;
    });

  var simulation = d3.forceSimulation()
    .force('link', linkForce)
    .force('charge', d3.forceManyBody().strength(manyBodyForceStrength))
    .force('center', d3.forceCenter(width / 2, height / 2));

  simulation.nodes(nodes).on('tick', () => {
	nodeElements.each(function(node) {
		if (node.img) {
			d3.select(this).attr('x', node.x - 1.5 * (node.strength ? nodeSize * node.strength : nodeSize))
				.attr('y', node.y - 1.5 * (node.strength ? nodeSize * node.strength : nodeSize));
		} else {
			d3.select(this).attr('cx', node.x)
				.attr('cy', node.y);
		}
	});
    if (textElements != null) {
		textElements
			.attr('x', function(node) {
			  return node.x - (node.img ? 1.5 : 1) * (node.strength ? nodeSize * node.strength : nodeSize);
			})
			.attr('y', function(node) {
			  return node.y - (node.img ? 1.5 : 1) * (node.strength ? nodeSize * node.strength : nodeSize) - 3;
			});
    }
    linkElements
      .attr('x1', function(link) {
        return link.source.x;
      })
      .attr('y1', function(link) {
        return link.source.y;
      })
      .attr('x2', function(link) {
        return link.target.x;
      })
      .attr('y2', function(link) {
        return link.target.y;
      });
  });

  simulation.force("link").links(links);


  // init local helper functions
  function selectNode(event, selectedNode) {
    var neighbors = getNeighbors(selectedNode);

    // we modify the styles to highlight selected nodes
    nodeElements.attr('fill', function(node) {
      return getNodeColor(node, neighbors);
    });
    linkElements.attr('stroke', function(link) {
      return getLinkColor(selectedNode, link);
    });
    linkElements.attr('marker-end', function(link) {
      return getArrowhead(selectedNode, link);
    });
  }

  function getNeighbors(node) {
    return links.reduce(function(neighbors, link) {
        if (link.target.id === node.id) {
          neighbors.push(link.source.id);
        } else if (link.source.id === node.id) {
          neighbors.push(link.target.id);
        }
        return neighbors;
      },
      [node.id]
    );
  }

  function isNeighborLink(node, link) {
    return link.target.id === node.id || link.source.id === node.id;
  }

  function getNodeColor(node, neighbors) {
    return groupColors[node.group];
  }


  function getLinkColor(node, link) {
    return isNeighborLink(node, link) ? highlightingColor : linkColor;
  }
  
}
