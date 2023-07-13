//seperate function for handling the layout so all 
//formats are the same no matter the num of entries
function createBarChartLayout(headers, values) {
  var maxValue = Math.max(...values);
  var numCategories = headers.length - 1;

  // Calculate the desired width and height based on the number of categories
  var desiredWidth = Math.max(800, 80 * numCategories);
  var desiredHeight = Math.max(600, 40 * values.length);

  //basic layout formatting
  return {
    title: 'Number of Users in Each Game',
    barmode: 'stack',
    bargap: 0.8,
    bargroupwidth: 0.7,
    autosize: true, 
    width: desiredWidth,
    height: desiredHeight, 
    lines: false,
    color: 'rgba(31, 119, 180, 0.8)',
    xaxis: {
      title: headers[1],
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
//one handleFile function for all chart inputs
//three parameters to pass different ids for different chart inputs
function handleFile(fileInputId, chartContainerId, outputInfoId) {
  var fileInput = document.getElementById(fileInputId);
  var chartContainer = document.getElementById(chartContainerId);
  var outputInfo = document.getElementById(outputInfoId);
  var file = fileInput.files[0];
  var reader = new FileReader();

  //start reading csv file
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

        //make sure that only numeric values are being considered
        if (!isNaN(value)) {
          //if a y value doesnt exist, initialize to zero
          if (!dataByHeaders[xHeader].hasOwnProperty(yHeader)) {
            dataByHeaders[xHeader][yHeader] = 0;
          }

          dataByHeaders[xHeader][yHeader] += value;
        }
      }
    }

    //log all values and inputs to the console (primarily for testing)
    //calculate total value for pie chart funtion (now removed), or
    //in case we would like to use the total value in the future
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

    //start creating bar graph
    var barData = [];

    var colorIndex = 0;
    // parse through data
    for (var xHeader in dataByHeaders) {
      var yHeaders = Object.keys(dataByHeaders[xHeader]);
      var values = [];

      for (var yHeader of yHeaders) {
        var value = dataByHeaders[xHeader][yHeader];
        values.push(value);
      }

      // sort data, then flip it since smallest comes before largest when sorting
      // this way the largest elements will be on top of the bar chart, and smallest
      // on the bottom
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

      yHeaders.reverse();
      values.reverse();

      //trace for bargraph
      var barTrace = {
        y: yHeaders,
        x: values,
        width: Array(values.length).fill(0.7), // Set a fixed width for all bars
        type: 'bar',
        name: xHeader,
        orientation: 'h',
        //number values displayed next to bar
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

    //actually create graph, but then start adding the clicking bar fucnction
    Plotly.newPlot(chartContainer, barData, barLayout).then(function () {
      var colors = Array.from({ length: yHeaders.length }, () => 'rgba(31, 119, 180, 0.8)');
      var currentClickedIndex = null;
    
      chartContainer.on('plotly_click', function (data) {
        var clickedIndex = data.points[0].pointIndex;
    
        if (currentClickedIndex !== null && currentClickedIndex !== clickedIndex) {
          colors[currentClickedIndex] = 'rgba(31, 119, 180, 0.8)'; // Revert previously clicked bar to blue
        }
    
        currentClickedIndex = clickedIndex;
    
        if (colors[clickedIndex] === 'green') {
          colors[clickedIndex] = 'rgba(31, 119, 180, 0.8)'; // Revert current clicked bar to blue
          currentClickedIndex = null; // Reset current clicked index
        } else {
          colors[clickedIndex] = 'green'; // Set current clicked bar to green
        }
    
        var update = {
          marker: { color: colors }
        };
    
        Plotly.update(chartContainer, update);
    
        if (colors[clickedIndex] === 'green') {
          // Showcase the clicked bar's information onto the webpage itself
          var clickedBarData = data.points[0]; // Get the clicked bar's data directly
          var clickedBarName = clickedBarData.label;
          var clickedBarValue = clickedBarData.x;
          console.log(clickedBarData);
    
          var statement = "Selected Information: " + clickedBarName + "<br>Value: " + clickedBarValue;
          outputInfo.innerHTML = statement;
          outputInfo.style.border = "2px solid green";
        } else {
          outputInfo.innerHTML = "";
          outputInfo.style.border = "none";
        }
      });
    
      var update = {
        marker: { color: colors }
      };
    
      Plotly.update(chartContainer, update);
    });
    
    
  };

  reader.readAsText(file);
}
