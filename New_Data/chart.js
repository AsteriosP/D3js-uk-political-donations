// GLOBALS
var w = 1500, h = 960;
var padding = 2;
var nodes = [];
var force, node, data, maxVal;
var brake = 0.2;
var radius = d3.scale.sqrt().range([10, 20]);



var fill = d3.scale.ordinal().range(["#ff0000","#ffbb00","#bbff00","#00ff00","#00ff83","#00d8ff","#0061ff","#4300ff","#fa00ff"]);

var categories = ["passenger", "trucks", "buses", "motorcycles"];

passCent = {
	x: 300,
	y: 500
};

truCent = {
	x: 1100,
	y: 500
};

busCent = {
	x: 300,
	y: 1300
};

motoCent = {
	x: 1100,
	y: 1300
};

var centers = {
	"passenger": passCent,
	"trucks": truCent,
	"buses": busCent,
	"motorcycles": motoCent
};

var p1 = {
	x: -160,
	y: -190
};

var p2 = {
	x: 160,
	y: -190
};

var p3 = {
	x: 0,
	y: -130
};

var p4 = {
	x: -160,
	y: -60
};

var p5 = {
	x: 160,
	y: -60
};

var p6 = {
	x: 0,
	y: 0
};

var p7 = {
	x: -160,
	y: 100
};

var p8 = {
	x: 160,
	y: 100
};

var p9 = {
	x: 0,
	y: 180
};

perRegion = {
	"ΣΤΕΡΕΑΣ ΕΛΛΑΔΑΣ": p9,
	"ΠΕΛΟΠΟΝΝΗΣΟΥ": p8,
	"ΙΟΝΙΩΝ   ΝΗΣΩΝ": p7,
	"ΗΠΕΙΡΟΥ": p6,
	"ΘΕΣΣΑΛΙΑΣ": p5,
	"ΜΑΚΕΔΟΝΙΑΣ": p4,
	"ΘΡΑΚΗΣ": p3,
	"ΝΗΣΩΝ  ΑΙΓΑΙΟΥ": p2,
	"ΚΡΗΤΗΣ": p1
}

colors = {
	"#ff0000": "ΣΤΕΡΕΑΣ ΕΛΛΑΔΑΣ",
	"#ffbb00": "ΠΕΛΟΠΟΝΝΗΣΟΥ",
	"#bbff00": "ΙΟΝΙΩΝ   ΝΗΣΩΝ",
	"#00ff00": "ΗΠΕΙΡΟΥ",
	"#00ff83": "ΘΕΣΣΑΛΙΑΣ",
	"#00d8ff": "ΜΑΚΕΔΟΝΙΑΣ",
	"#0061ff": "ΘΡΑΚΗΣ",
	"#4300ff": "ΝΗΣΩΝ  ΑΙΓΑΙΟΥ",
	"#fa00ff": "ΚΡΗΤΗΣ"
}

var regions = {
	'ΠΕΛΟΠΟΝΝΗΣΟΥ': ['ΑΡΓΟΛΙΔΑΣ', 'ΑΡΚΑΔΙΑΣ', 'ΑΧΑΪΑΣ', 'ΗΛΕΙΑΣ', 'ΚΟΡΙΝΘΙΑΣ', 'ΛΑΚΩΝΙΑΣ', 'ΜΕΣΣΗΝΙΑΣ'],
	'ΝΗΣΩΝ  ΑΙΓΑΙΟΥ': ['ΔΩΔΕΚΑΝΗΣΟΥ', 'ΚΥΚΛΑΔΩΝ', 'ΛΕΣΒΟΥ', 'ΣΑΜΟΥ', 'ΧΙΟΥ'],
	'ΚΡΗΤΗΣ': ['ΗΡΑΚΛΕΙΟΥ', 'ΛΑΣΙΘΙΟΥ', 'ΡΕΘΥΜΝΟΥ', 'ΧΑΝΙΩΝ'],
	'ΣΤΕΡΕΑΣ ΕΛΛΑΔΑΣ': ['ΑΤΤΙΚΗΣ', 'ΑΙΤΩΛΟΚΑΡΝΑΝΙΑΣ', 'ΒΟΙΩΤΙΑΣ', 'ΕΥΒΟΙΑΣ', 'ΕΥΡΥΤΑΝΙΑΣ', 'ΦΘΙΩΤΙΔΑΣ', 'ΦΩΚΙΔΑΣ'],
	'ΙΟΝΙΩΝ   ΝΗΣΩΝ': ['ΖΑΚΥΝΘΟΥ', 'ΚΕΡΚΥΡΑΣ', 'ΚΕΦΑΛΛΗΝΙΑΣ', 'ΛΕΥΚΑΔΑΣ'],
	'ΘΕΣΣΑΛΙΑΣ': ['ΚΑΡΔΙΤΣΑΣ', 'ΛΑΡΙΣΑΣ', 'ΜΑΓΝΗΣΙΑΣ', 'ΤΡΙΚΑΛΩΝ'],
	'ΘΡΑΚΗΣ': ['ΕΒΡΟΥ', 'ΞΑΝΘΗΣ', 'ΡΟΔΟΠΗΣ'],
	'ΗΠΕΙΡΟΥ': ['ΑΡΤΑΣ', 'ΘΕΣΠΡΩΤΙΑΣ', 'ΙΩΑΝΝΙΝΩΝ', 'ΠΡΕΒΕΖΑΣ'],
	'ΜΑΚΕΔΟΝΙΑΣ': ['ΓΡΕΒΕΝΩΝ', 'ΔΡΑΜΑΣ', 'ΗΜΑΘΙΑΣ', 'ΘΕΣΣΑΛΟΝΙΚΗΣ', 'ΚΑΒΑΛΑΣ', 'ΚΑΣΤΟΡΙΑΣ', 'ΚΙΛΚΙΣ', 'ΚΟΖΑΝΗΣ', 'ΠΕΛΛΑΣ', 'ΠΙΕΡΙΑΣ', 'ΣΕΡΡΩΝ', 'ΦΛΩΡΙΝΗΣ', 'ΧΑΛΚΙΔΙΚΗΣ']
}


var svg = d3.select("#chart");

var nodeGroup = svg.append("g");

var tooltip = d3.select("body")
	.append("div")
	.attr("class", "tooltip")
	.attr("id", "tooltip");

var comma = d3.format(",.0f");

function transition(name) {
	if (name === "all-departments") {
		return all_departments();
	}
	if (name === "group-by-region") {
		return groupRegion();
	}

}

function start() {

	node = nodeGroup.selectAll("circle")
		.data(nodes)
		.enter().append("circle")
		.attr("name", function (d) { return "node " + d.department; })
		.attr("total", function (d) { return d.passenger_total; })
		// disabled because of slow Firefox SVG rendering
		// though I admit I'm asking a lot of the browser and cpu with the number of nodes
		//.style("opacity", 0.9)
		.attr("r", 0)
		.style("fill", function (d) { 
			return fill(d.color); 
		})
		.on("mouseover", mouseover)
		.on("mouseout", mouseout)
		.on("click", function (d) {	
			window.open('http://google.com/search?q=' + d.name_el);
		});
		

	force.gravity(0)
		.friction(0.75)
		.charge(function (d) { return -Math.pow(d.radius, 2) / 3; })
		.on("tick", all)
		.start();

	node.transition()
		.duration(2500)
		.attr("r", function (d) { return d.radius; });
}

function all_departments() {

	force.gravity(0)
		.friction(0.9)
		.charge(function (d) { return -Math.pow(d.radius, 2) / 2.8; })
		.on("tick", all)
		.start();
}

function all(e) {
	node.each(moveToCentre(e.alpha))
		.each(collide(0.001));
	node.attr("cx", function (d) { return d.x; })
		.attr("cy", function (d) { return d.y; });
}

function moveToCentre(alpha) {
	return function (d) {
		centreX = centers[d.category].x;
		centreY = centers[d.category].y;

		d.x += (centreX - d.x) * (brake + 0.06) * alpha * 1.2;
		d.y += (centreY - 100 - d.y) * (brake + 0.06) * alpha * 1.2;
	};
}

function groupRegion() {

	force.gravity(0)
		.friction(0.9)
		.charge(function (d) { return -Math.pow(d.radius, 2) / 2.8; })
		.on("tick", region)
		.start();
}

function region(e) {
	node.each(moveToRegions(e.alpha))
		.each(collide(0.001));
	node.attr("cx", function (d) { return d.x; })
		.attr("cy", function (d) { return d.y; });
}

function moveToRegions(alpha) {
	return function (d) {
		var cur_region = "";//getRegion(d.name_el);
		// console.log(cur_region);
		keys = Object.keys(regions);
		// console.log(keys);
		keys.forEach(key => {
			for(var i = 0; i < regions[key].length; i++){
				// console.log(regions[key][i])
				if (regions[key][i] == d.name_el){
					cur_region = key;
					break;
				}
			}
		});
		// console.log(cur_region);
		// console.log(cur_region)
		centreX = centers[d.category].x + perRegion[cur_region].x;
		centreY = centers[d.category].y + perRegion[cur_region].y;

		d.x += (centreX - d.x) * (brake + 0.06) * alpha * 1.2;
		d.y += (centreY - 100 - d.y) * (brake + 0.06) * alpha * 1.2;
	};
}



// Collision detection function by m bostock
function collide(alpha) {
	var quadtree = d3.geom.quadtree(nodes);
	return function (d) {
		var r = d.radius + radius.domain()[1] + padding,
			nx1 = d.x - r,
			nx2 = d.x + r,
			ny1 = d.y - r,
			ny2 = d.y + r;
		quadtree.visit(function (quad, x1, y1, x2, y2) {
			if (quad.point && (quad.point !== d)) {
				var x = d.x - quad.point.x,
					y = d.y - quad.point.y,
					l = Math.sqrt(x * x + y * y),
					r = d.radius + quad.point.radius + (d.color !== quad.point.color) * padding;
				if (l < r) {
					l = (l - r) / l * alpha;
					d.x -= x *= l;
					d.y -= y *= l;
					quad.point.x += x;
					quad.point.y += y;
				}
			}
			return x1 > nx2
				|| x2 < nx1
				|| y1 > ny2
				|| y2 < ny1;
		});
	};
}

function display(data) {
	data.forEach(d => {
		d.passenger_total = parseInt(d.passenger_total);
		d.trucks_total = parseInt(d.trucks_total);
		d.buses_total = parseInt(d.buses_total);
		d.motorcycles_total = parseInt(d.motorcycles_total);
	});
	maxValPass = d3.max(data, function (d) { return d.passenger_total; });
	minValPass = d3.min(data, function (d) { return d.passenger_total; });
	var radiusScalePass = d3.scale.sqrt()
		.domain([minValPass, maxValPass])
		.range([10, 20]);

	maxValTruc = d3.max(data, function (d) { return d.trucks_total; });
	minValTruc = d3.min(data, function (d) { return d.trucks_total; });
	var radiusScaleTruc = d3.scale.sqrt()
		.domain([minValTruc, maxValTruc])
		.range([10, 20]);

	maxValBus = d3.max(data, function (d) { return d.buses_total; });
	minValBus = d3.min(data, function (d) { return d.buses_total; });
	var radiusScaleBus = d3.scale.sqrt()
		.domain([minValBus, maxValBus])
		.range([10, 20]);

	maxValMoto = d3.max(data, function (d) { return d.motorcycles_total; });
	minValMoto = d3.min(data, function (d) { return d.motorcycles_total; });
	var radiusScaleMoto = d3.scale.sqrt()
		.domain([minValMoto, maxValMoto])
		.range([10, 20]);


//["passenger", "trucks", "buses", "motorcycles"]
	categories.forEach(cat => {
		data.forEach(function (d, i) {
			if (d.NUTS3 != "") {
				var node = {
					name_el: d.m_name,
					name_en: d.department,
					category: cat,
					color: d.color,
					region: getRegion(d.m_name)
				};
				if (cat == "passenger") {
					var y = radiusScalePass(d.passenger_total);
					node.total = d.passenger_total;
					node.radius = y;
					node.x = Math.random() * w / 2;
					node.y = -y;
				}else if (cat == "trucks") {
					var y = radiusScaleTruc(d.trucks_total);
					node.total = d.trucks_total;
					node.radius = y;
					node.x = Math.random() * w / 2;
					node.y = -y;
				}else if (cat == "buses") {
					var y = radiusScaleBus(d.buses_total);
					node.total = d.buses_total;
					node.radius = y;
					node.x = Math.random() * w / 2;
					node.y = -y;
				}else if (cat == "motorcycles") {
					var y = radiusScaleMoto(d.motorcycles_total);
					node.total = d.motorcycles_total;
					node.radius = y;
					node.x = Math.random() * w / 2;
					node.y = -y;
				}

				
				nodes.push(node);
			}
		});
	});

	// console.log(nodes.length);

	force = d3.layout.force()
		.nodes(nodes)
		.size([w, h]);

	return start();
}

function mouseover(d, i) {
	// tooltip popup
	console.log(d)
	var mosie = d3.select(this);
	var total = d.total;
	var name = d.name_el;
	var region = colors[d.color];
	var offset = $("svg").offset();
	// image url that want to check
	// *******************************************
	console.log(region)
	var infoBox = "<p> Source: <b>" + name + "</b> " + "</p>"

		+ "<p> Geografical area: <b>" + region + "</b></p>"
		+ "<p> Number of vehicles <b>" + total + "</b></p>";
	mosie.classed("active", true);
	d3.select(".tooltip")
		.style("left", (parseInt(d3.select(this).attr("cx") - 80) + offset.left) + "px")
		.style("top", (parseInt(d3.select(this).attr("cy") - (d.radius + 100)) + offset.top) + "px")
		.html(infoBox)
		.style("display", "block");
}

function mouseout() {
	// no more tooltips
	var mosie = d3.select(this);

	mosie.classed("active", false);

	d3.select(".tooltip")
		.style("display", "none");
	responsiveVoice.cancel();
}

$(document).ready(function () {
	d3.selectAll(".switch").on("click", function (d) {
		var id = d3.select(this).attr("id");
		return transition(id);
	});
	return d3.csv("data/data.csv", display);
});

function getRegion(name) {
	keys = Object.keys(regions);
	console.log(name)
	keys.forEach(key => {
		for (var i = 0; i < regions[key].length; i++) {
			// console.log(regions[key][i])
			if (regions[key][i] == name) {
				console.log(key)
				return key;
			}
		}
	});
}