$(document).ready(function() {

    async function initializeChart(countryData,max_rate) {
      const topology = await fetch('https://code.highcharts.com/mapdata/custom/world.topo.json')
        .then(response => response.json());
  
      Highcharts.getJSON('https://cdn.jsdelivr.net/gh/highcharts/highcharts@v7.0.0/samples/data/world-population-density.json', function (data) {
        data.forEach(function (p) {
          const country = countryData.find(c => c.name === p.name);
          if (country) {
            p.value = country.value;
          } else {
            p.value = 0;
          }
        });

        var monitorWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var monitorHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;              
        var screenSize = Math.sqrt(monitorWidth * monitorWidth + monitorHeight * monitorHeight);


        // Initialize the chart
        Highcharts.mapChart('container', {
          chart: {
            map: topology,
            backgroundColor: 'rgb(0, 47, 111,1)',
            width: screenSize/1.15 ,
            height: monitorHeight/1.2 

          },
          title: {
            text: '',
            style: {
              color: '#ffffff' // Set the color of the title to white
            }
          },
          mapNavigation: {
            enabled: true,
            enableDoubleClickZoomTo: true,
            buttonOptions: {
              verticalAlign: 'bottom'
            }
          },
          mapView: {
            fitToGeometry: {
              type: 'MultiPoint',
              coordinates: [
                // Alaska west
                [-164, 54],
                // Greenland north
                [-35, 84],
                // New Zealand east
                [179, -38],
                // Chile south
                [-68, -55]
              ]
            }
          },
          colorAxis: {
            min: 0, // Change minimum value to 0
            max: max_rate, // Adjust maximum value as needed
            type: 'linear', // Change to linear scale
            labels: {
              style: {
                color: '#ffffff' // Set the color of color axis labels to white
              }
            },
            // stops: [
            //     [0, '#ffffff'],  // Start color (e.g., red) at 0
            //     [0.5, '#00ff00'],  // Mid color (e.g., green) at 0.5
            //     [1, '#0000ff']  // End color (e.g., blue) at 1
            //   ]
          },
          
          series: [{
            data: data,
            joinBy: ['iso-a3', 'code3'],
            name: 'Traffic',
            tooltip: {
              valueSuffix: ''
            }
          }]
        });
      });
    }
  
    var monitorWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var monitorHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;              
    var screenSize = Math.sqrt(monitorWidth * monitorWidth + monitorHeight * monitorHeight);

    var spanElement = document.getElementById("last-update-container");
    spanElement.style.width = screenSize/3  + "px";
    // spanElement.style.position = "absolute";
    // spanElement.style.right = "1%";
    // spanElement.style.top = "1%";
    

    function updatePlot() {
      var startDate = $('#startDate').val();

      // If the start date is empty, set it to two weeks ago
      if (startDate === '') {
        var today = new Date(); // Get the current date

        var time_interval = new Date(today.getTime() - (3 * 60 * 60 * 1000));
        // var time_interval = new Date(today.getTime() - (60 * 24 * 60 * 60 * 1000)); 

        // Format the three hours ago date as YYYY-MM-DD
       var formattedDate =
      time_interval.getFullYear() +
      '-' +
      String(time_interval.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(time_interval.getDate()).padStart(2, '0') +
      ' ' +
      String(time_interval.getHours()).padStart(2, '0') +
      ':' +
      String(time_interval.getMinutes()).padStart(2, '0') +
      ':' +
      String(time_interval.getSeconds()).padStart(2, '0');

    startDate = formattedDate; // Assign the formatted date to the startDate variable
    $('#startDate').val(startDate); // Update the value of the startDate input field


      }


      $.ajax({
        url: '/update_map',
        type: 'POST',
        data: {start_date: startDate, // Send the selected start date to the server
      },
        success: function(response) {
          var countryDict = response.country_uq_dict;

        //   const countryData = [
        //     { name: 'Brazil', value: 150 },
        //     { name: 'United States', value: 200 },
        //     { name: 'Germany', value: 90 }
        //     // Add more countries and their values here
        //   ];

          initializeChart(countryDict, countryDict.reduce((max, item) => (item.value > max ? item.value : max), 0));
        
          var currentDate = new Date();
          var lastUpdate = currentDate.toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
          $('#last-update').text('Last Update: ' + lastUpdate);
          

        }
      });
    }
  
    function autoUpdate() {
      if ($('#customSwitches').prop('checked')) {
        updatePlot();
      }
        
    }
    setInterval(autoUpdate, 60000);
    $('#update-btn').on('click', function() {
        $('#graphDropdownForm').removeClass('show');
        updatePlot();
    });
    updatePlot();
  });
