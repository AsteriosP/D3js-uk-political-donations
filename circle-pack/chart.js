var w = 960, h = 960;
var g_all_donations = [25001, 50001, 100001, 500001, 1000001, 20000001];

var svg = d3.select("#chart").append("svg")
    .attr("id", "svg")
    .attr("width", w)
    .attr("height", h);

var margin = 20,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var tooltip = d3.select("#chart")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip");

var color = d3.scaleLinear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

d3.csv("7500up.csv", function (error, data) {
    if (error) throw error;
    data.forEach(function (d) {
        d["amount"] = +d["amount"];
        d["name"] = d["donor"];
    });

    root = csvJSON(data);

    root = d3.hierarchy(root)
        .sum(function (d) { return d.amount; })
        .sort(function (a, b) { return b.value - a.value; });

    var focus = root;
    var    nodes = pack(root).descendants(),
        view;

    var circle = g.selectAll("circle")
        .data(nodes)
        .enter().append("circle")
        .attr("class", function (d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
        .style("fill", function (d) { return d.children ? color(d.depth) : null; })
        .on("click", function (d) {
            // if (focus !== d) zoom(d), d3.event.stopPropagation(); 
            if (focus == d.parent && d.depth == 2) {
                console.log("SEARCH");
                console.log(d.depth);
                console.log(focus.depth);
                // search on google
                window.open('http://google.com/search?q=' + d.data.donor);
                zoom(d.parent)
                d3.event.stopPropagation();
            } else {
                console.log(d.depth);
                console.log(focus);
                if (d.depth == focus.depth || d.depth == 2) {
                    d = d.parent;
                }
                zoom(d)
                d3.event.stopPropagation();
            }
        })
        .on("mouseover", function (d) {
            if (focus.depth == 1){
                mouseover(d)
            }
        })
        .on("mouseout", mouseout);



    var node = g.selectAll("circle");


    svg.style("background", color(-1))
        .on("click", function () { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
        var focus0 = focus;
        focus = d;

        var transition = d3.transition()
            .duration(d3.event.altKey ? 7500 : 750)
            .tween("zoom", function (d) {
                var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                return function (t) { zoomTo(i(t)); };
            });

        transition.selectAll("text")
            .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
            .style("fill-opacity", function (d) { return d.parent === focus ? 1 : 0; })
            .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
            .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });
    }

    function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function (d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function (d) { return d.r * k; });
    }

});





function get_line(headers, currentline) {
    var obj = {}
    for (var h = 0; h < headers.length; h++) {
        if (h == 1) {
            obj[headers[h]] = parseint(currentline[h]);
        } else {
            obj[headers[h]] = currentline[h];
        }
    }
    return obj;
}
/**
 * .on("mouseover", function(){
        console.log("geiA");
    });
 */
function mouseover(d) {
    console.log(focus)
    if (d.children == null) {
        // tooltip popup
        var mosie = d3.select(d);
        var amount = d.data.amount;
        var donor = d.data.donor;
        var party = d.data.partyname;
        var entity = d.data.entityname;
        var offset = $("svg").offset();
        // image url that want to check
        var imageFile = "https://raw.githubusercontent.com/ioniodi/D3js-uk-political-donations/master/photos/" + donor + ".ico";
        // *******************************************

        var infoBox = "<p> Source: <b>" + donor + "</b> " + "<span><img src='" + imageFile + "' height='42' width='42' onError='this.src=\"https://github.com/favicon.ico\";'></span></p>"

            + "<p> Recipient: <b>" + party + "</b></p>"
            + "<p> Type of donor: <b>" + entity + "</b></p>"
            + "<p> Total value: <b>&#163;" + amount + "</b></p>";
        // mosie.classed("active", true);

        d3.select(".tooltip")
            .style("left", (parseInt(d.x - 80) + offset.left) + "px")
            .style("top", (parseInt(d.y - (d.r + 150)) + offset.top) + "px")
            .html(infoBox)
            .style("display", "block");

        responsiveVoice.speak("Donor's Name: " + donor + " " + "Total Value: " + amount);
        // appendHistory(imageFile)
    }
}

function mouseout() {
    // no more tooltips
    var mosie = d3.select(this);

    // mosie.classed("active", false);

    d3.select(".tooltip")
        .style("display", "none");

    responsiveVoice.cancel();
}

function buttonClicked(id) {
    d3.select("g").selectAll("*").remove();
    bleep.play()
    d3.csv("7500up.csv", function (error, data) {
        if (error) throw error;
        data.forEach(function (d) {
            d["amount"] = +d["amount"];
            d["name"] = d["donor"];
        });

        root = csvJSON(data, id);

        root = d3.hierarchy(root)
            .sum(function (d) { return d.amount; })
            .sort(function (a, b) { return b.value - a.value; });

        var focus = root,
            nodes = pack(root).descendants(),
            view;

        var circle = g.selectAll("circle")
            .data(nodes)
            .enter().append("circle")
            .attr("class", function (d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
            .style("fill", function (d) { return d.children ? color(d.depth) : null; })
            .on("click", function (d) {
                if (focus !== d) {
                    if (focus == d.parent) {
                        // search on google
                        window.open('http://google.com/search?q=' + d.data.donor);
                    } else {
                        if (d.depth == 2) {
                            d = d.parent;
                        }
                        zoom(d)
                        d3.event.stopPropagation();
                    }
                }
            })
            .on("mouseover", function (d) {
                if (focus.depth == 1){
                    mouseover(d)
                }
            })
            .on("mouseout", mouseout);

        var node = g.selectAll("circle");


        svg.style("background", color(-1))
            .on("click", function () { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2 + margin]);

        function zoom(d) {
            var focus0 = focus;
            focus = d;

            var transition = d3.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .tween("zoom", function (d) {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
                    return function (t) { zoomTo(i(t)); };
                });

            transition.selectAll("text")
                .filter(function (d) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function (d) { return d.parent === focus ? 1 : 0; })
                .on("start", function (d) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function (d) { if (d.parent !== focus) this.style.display = "none"; });
        }

        function zoomTo(v) {
            var k = diameter / v[2]; view = v;
            node.attr("transform", function (d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
            circle.attr("r", function (d) { return d.r * k; });
        }

    });
}

function csvJSON(data, grouping) {
    var result = [];
    if (grouping == null || grouping == "all-donations") {
        grouping = "all-donations"
        var obj = {
            "name": grouping,
            "children": []
        };
        return all_donations(data, obj);
    } else if (grouping == "group-by-money-source") {
        var obj = {
            "name": grouping,
            "children": []
        };
        return money_source(data, obj);
    } else if (grouping == "group-by-party") {
        var obj = {
            "name": grouping,
            "children": []
        };
        return by_party(data, obj);
    } else if (grouping == "group-by-donor-type") {
        var obj = {
            "name": grouping,
            "children": []
        };
        return donor_type(data, obj);
    } else if (grouping == "group-by-amount") {
        var obj = {
            "name": grouping,
            "children": []
        };
        return by_amount(data, obj);
    }




}

function all_donations(data, obj) {

    data.forEach(function (d) {
        var entered = false;
        g_all_donations.forEach(donation => {
            amount = d["amount"];
            if ((amount <= donation) && (entered == false)) {
                for (var index = 0; index < obj["children"].length; index++) {
                    if ("Up to: " + (donation - 1).toString() == obj["children"][index]["name"]) {
                        obj["children"][index]["children"].push(d);
                        entered = true;
                    }
                }
                if (entered == false) {
                    cat = (donation - 1);
                    obj["children"].push({
                        "name": "Up to: " + cat.toString(),
                        "children": []
                    });
                }
                if (entered == false) {
                    for (var index = 0; index < obj["children"].length; index++) {
                        if ("Up to: " + (donation - 1).toString() == obj["children"][index]["name"]) {
                            obj["children"][index]["children"].push(d);
                            entered = true;
                        }
                    }
                }
            }
        });
    });
    return obj;
}

function money_source(data, obj) {
    t = {
        "name": "pub",
        "children": []
    }
    obj["children"].push(t);
    t = {
        "name": "other",
        "children": []
    }
    obj["children"].push(t);
    data.forEach(function (d) {
        if (d["entity"] == "pub") {
            obj["children"][0]["children"].push(d);
        } else {
            obj["children"][1]["children"].push(d);
        }
    });
    return obj;
}

function by_party(data, obj) {
    parties = ["con", "lab", "lib"]
    parties.forEach(p => {
        t = {
            "name": p,
            "children": []
        };
        obj["children"].push(t);
    });
    data.forEach(function (d) {
        if (d["party"] == parties[0]) {
            obj["children"][0]["children"].push(d);
        } else if (d["party"] == parties[1]) {
            obj["children"][1]["children"].push(d);
        } else if (d["party"] == parties[2]) {
            obj["children"][2]["children"].push(d);
        }
    });
    return obj;
}

function donor_type(data, obj) {
    g_donor_type = ["company", "union", "other", "society", "individual"]
    g_donor_type.forEach(donor => {
        t = {
            "name": donor,
            "children": []
        };
        obj["children"].push(t);
    });
    data.forEach(function (d) {
        for (let i = 0; i < g_donor_type.length; i++) {
            if (d["entity"] == g_donor_type[i]) {
                obj["children"][i]["children"].push(d);
                continue
            }
        }
    });
    return obj;
}

function by_amount(data, obj) {
    var g_amounts = [50001, 150001, 750001, 5000001, 20000001];
    data.forEach(function (d) {
        var entered = false;
        g_amounts.forEach(donation => {
            amount = d["amount"];
            if ((amount <= donation) && (entered == false)) {
                for (var index = 0; index < obj["children"].length; index++) {
                    if ("Up to: " + (donation - 1).toString() == obj["children"][index]["name"]) {
                        obj["children"][index]["children"].push(d);
                        entered = true;
                    }
                }
                if (entered == false) {
                    cat = (donation - 1);
                    obj["children"].push({
                        "name": "Up to: " + cat.toString(),
                        "children": []
                    });
                }
                if (entered == false) {
                    for (var index = 0; index < obj["children"].length; index++) {
                        if ("Up to: " + (donation - 1).toString() == obj["children"][index]["name"]) {
                            obj["children"][index]["children"].push(d);
                            entered = true;
                        }
                    }
                }
            }
        });
    });
    return obj;
}