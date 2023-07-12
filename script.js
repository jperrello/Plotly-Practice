// layout function for creating layouts of the graph
function createBarChartLayout(headers, values) {
  var maxValue = Math.max(...values);
  var numCategories = headers.length - 1;
  var barGroupWidth = Math.min(0.8, 2.0 / numCategories);

  // Calculate the desired width and height based on the values and categories
  var desiredWidth = Math.max(800, 80 * numCategories);
  var desiredHeight = Math.max(600, 40 * values.length);

  return {
    title: 'Number of Users in Each Game',
    barmode: 'stack',
    bargap: 0.8,
    bargroupwidth: barGroupWidth,
    autosize: true, // Enable autosizing
    //call above variables
    width: desiredWidth, 
    height: desiredHeight, 
    lines: false,
    color: 'rgba(31, 119, 180, 0.8)',
    xaxis: {
      title: headers[1],
      range: [0, maxValue + 100],
      fixedrange: true,
      zeroline: false,
      showgrid: false,
    },
    yaxis: {
      title: {
        text: headers[0],
        standoff: 30,
      },
      automargin: true,
      showgrid: false,
      gridwidth: 3,
      zeroline: false,
      tickfont: {
        size: 10,
      },
    },
    margin: {
      1: 150,
    },
  };
}





function handleFile() {
  // read the csv file after taking it as input
  var fileInput = document.getElementById("csvFileInput");
  var file = fileInput.files[0];
  var reader = new FileReader();

  reader.onload = function (e) {
    var contents = e.target.result;
    var lines = contents.split("\n");
    var dataByHeaders = {};

// get header values
    var headers = lines[0].split(",");

// Initialize dataByHeaders object (sorting data by headers)
    for (var i = 1; i < headers.length; i++) {
      dataByHeaders[headers[i]] = {};
    }

// parse through each line of data
    for (var i = 1; i < lines.length; i++) {
      var line = lines[i].split(",");

  // Assign values to the headers
      for (var j = 1; j < headers.length; j++) {
        var xHeader = headers[j];
        var yHeader = line[0];
        var value = parseInt(line[j]);

        if (!isNaN(value)) {
          if (!dataByHeaders[xHeader].hasOwnProperty(yHeader)) {
            dataByHeaders[xHeader][yHeader] = 0;
          }

          dataByHeaders[xHeader][yHeader] += value;
        }
      }
    }

// Print Events to console and calculate total value
// of all values added together
    var totalValue = 0;
    for (var xHeader in dataByHeaders) {
      console.log(xHeader + ":");
      var yHeaders = Object.keys(dataByHeaders[xHeader]);

      for (var yHeader of yHeaders) {
        var value = dataByHeaders[xHeader][yHeader];
        console.log(yHeader + "\nValue: " + value);
        totalValue += value;
      }

      console.log("------");
      console.log("Total Value: " + totalValue);
    }

//Pie Chart
    var pieData = [];
    for (var xHeader in dataByHeaders) {
      var yHeaders = Object.keys(dataByHeaders[xHeader]);

      var sectionSizes = [];
      var labels = [];
      var ogValues = [];
      for (var yHeader of yHeaders) {
        var value = dataByHeaders[xHeader][yHeader];
        var sectionSize = value / totalValue;

        sectionSizes.push(sectionSize);
        labels.push(yHeader);
        ogValues.push(value);
      }

      var dataPoint = {
        values: sectionSizes,
        labels: labels,
        type: 'pie',
        hole: 0.45,
        hoverinfo:'label+text+percent',
        text: ogValues.map(String)
      };

      pieData.push(dataPoint);
    }

    var layout = {
      showlegend: true,
      width: 900,
      height: 800,
      annotations: [
        {
          text: 'Number of Users in Each Game',
          x: 0.5,
          y: 0.5,
          showarrow: false,
          font: {
            size: 14,
            color: 'black'
          }
        }
      ]
    };

    Plotly.newPlot('pieChartContainer', pieData, layout);

//bar graph
var barData = [];

var colorIndex = 0;
// parse through data
for (var xHeader in dataByHeaders) {
  var yHeaders = Object.keys(dataByHeaders[xHeader]);
  var values = [];
  for (var xHeader in dataByHeaders) {
    var yHeaders = Object.keys(dataByHeaders[xHeader]);
    var values = [];
    for (var yHeader of yHeaders) {
      var value = dataByHeaders[xHeader][yHeader];
      values.push(value);
    }
    //sort data, then flip it since smallest comes before largest when sorting
    var sortedIndices = values.map(function (_, index) {
      return index;
    }).sort(function (a, b) {
      return values[b] - values[a];
    });
    yHeaders = sortedIndices.map(function (index) {
      return yHeaders[index];
    });
    values = sortedIndices.map(function (index) {
      return values[index];
    });
  }
  yHeaders.reverse();
  values.reverse();

  var barTrace = {
    y: yHeaders,
    x: values,
    width: [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 
      0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 
      0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7 ],
    type: 'bar',
    name: xHeader,
    orientation: 'h',
    text: values.map(String),
    textposition: 'auto',
    textfont_size: 20,
    textposition: 'outside',
    cliponaxis: false,
    
  };
  barData.push(barTrace);
  colorIndex++;
}

var barLayout = createBarChartLayout(headers, values);


Plotly.newPlot('barChartContainer', barData, barLayout).then(function() {
  var barChart = document.getElementById('barChartContainer');
  var colors = Array.from({ length: yHeaders.length }, () => 'rgba(31, 119, 180, 0.8)'); // Blue color

  barChart.on('plotly_click', function(data) {
    var clickedIndex = data.points[0].pointIndex;

    // Reset colors to blue for all bars
    colors = Array.from({ length: yHeaders.length }, () => 'rgba(31, 119, 180, 0.8)');

    // Set the clicked bar color to green
    colors[clickedIndex] = 'green';

    var update = {
      marker: { color: colors }
    };

    Plotly.update('barChartContainer', update);
    
    // showcase the clicked bar's information onto the webpage itself
    var clickedBarData = data.points[0]; // Get the clicked bar's data directly
    var clickedBarName = clickedBarData.label;
    var clickedBarValue = clickedBarData.x;
    console.log(clickedBarData)


    var statement = "Selected Information: " + clickedBarName + "<br>Value: " + clickedBarValue;
    document.getElementById('outputSelectInfo').innerHTML = statement;
    document.getElementById('outputSelectInfo').style.border = "2px solid green";
  });
});



};

  reader.readAsText(file);
}

// smaller graph practice
function handleSmallFile() {
  // read the csv file after taking it as input
  var fileInput = document.getElementById("smallCsvFileInput");
  var file = fileInput.files[0];
  var reader = new FileReader();

  reader.onload = function (e) {
    var contents = e.target.result;
    var lines = contents.split("\n");
    var dataByHeaders = {};

// get header values
    var headers = lines[0].split(",");

// Initialize dataByHeaders object (sorting data by headers)
    for (var i = 1; i < headers.length; i++) {
      dataByHeaders[headers[i]] = {};
    }

// parse through each line of data
    for (var i = 1; i < lines.length; i++) {
      var line = lines[i].split(",");

  // Assign values to the headers
      for (var j = 1; j < headers.length; j++) {
        var xHeader = headers[j];
        var yHeader = line[0];
        var value = parseInt(line[j]);

        if (!isNaN(value)) {
          if (!dataByHeaders[xHeader].hasOwnProperty(yHeader)) {
            dataByHeaders[xHeader][yHeader] = 0;
          }

          dataByHeaders[xHeader][yHeader] += value;
        }
      }
    }
    var totalValue = 0;
    for (var xHeader in dataByHeaders) {
      console.log(xHeader + ":");
      var yHeaders = Object.keys(dataByHeaders[xHeader]);

      for (var yHeader of yHeaders) {
        var value = dataByHeaders[xHeader][yHeader];
        console.log(yHeader + "\nValue: " + value);
        totalValue += value;
      }

      console.log("------");
      console.log("Total Value: " + totalValue);
    }
var barData = [];

var colorIndex = 0;
// parse through data
for (var xHeader in dataByHeaders) {
  var yHeaders = Object.keys(dataByHeaders[xHeader]);
  var values = [];
  for (var xHeader in dataByHeaders) {
    var yHeaders = Object.keys(dataByHeaders[xHeader]);
    var values = [];
    for (var yHeader of yHeaders) {
      var value = dataByHeaders[xHeader][yHeader];
      values.push(value);
    }
    //sort data, then flip it since smallest comes before largest when sorting
    var sortedIndices = values.map(function (_, index) {
      return index;
    }).sort(function (a, b) {
      return values[b] - values[a];
    });
    yHeaders = sortedIndices.map(function (index) {
      return yHeaders[index];
    });
    values = sortedIndices.map(function (index) {
      return values[index];
    });
  }
  yHeaders.reverse();
  values.reverse();

  var barTrace = {
    y: yHeaders,
    x: values,
    width: [0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7 
       ],
    type: 'bar',
    name: xHeader,
    orientation: 'h',
    text: values.map(String),
    textposition: 'auto',
    textfont_size: 20,
    textposition: 'outside',
    cliponaxis: false,
    
  };
  barData.push(barTrace);
  colorIndex++;
}

var barLayout = createBarChartLayout(headers, values);

Plotly.newPlot('smallBarChartContainer', barData, barLayout).then(function() {
  var barChart = document.getElementById('smallBarChartContainer');
  var colors = Array.from({ length: yHeaders.length }, () => 'rgba(31, 119, 180, 0.8)'); // Blue color
  

  barChart.on('plotly_click', function(data) {
    var clickedIndex = data.points[0].pointIndex;

    // Reset colors to blue for all bars
    colors = Array.from({ length: yHeaders.length }, () => 'rgba(31, 119, 180, 0.8)');

    // Set the clicked bar color to green
    colors[clickedIndex] = 'green';

    var update = {
      marker: { color: colors }
    };

    Plotly.update('smallBarChartContainer', update);
    
    // showcase the clicked bar's information onto the webpage itself
    var clickedBarData = data.points[0]; // Get the clicked bar's data directly
    var clickedBarName = clickedBarData.label;
    var clickedBarValue = clickedBarData.x;
    console.log(clickedBarData)


    var statement = "Selected Information: " + clickedBarName + "<br>Value: " + clickedBarValue;
    document.getElementById('outputSelectSmallInfo').innerHTML = statement;
    document.getElementById('outputSelectSmallInfo').style.border = "2px solid green";
  });
});
  }
  reader.readAsText(file);
}
