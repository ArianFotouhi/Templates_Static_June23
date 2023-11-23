$(document).ready(function() {

    var pieChart; // Declare the pieChart variable

    // Define a function to update the pie chart
    function updatePieChart(activeRate, inactiveRate) {
      // Update the data values
      pieChart.data.datasets[0].data = [activeRate, inactiveRate];
      
      // Update the chart
      pieChart.update();
    }
  
    // Create the initial pie chart
    var data = {
      labels: ['Active', 'Inactive'],
      datasets: [{
        data: [0, 0], // Initial data values
        backgroundColor: ['#00BB78', '#002F6F']
      }]
    };
  
    pieChart = new Chart(document.getElementById("pieChart"), {
      type: 'pie',
      data: data,
      options: {
        responsive: true,
        legend: {
          display: false
        },
        title: {
          display: true,
          text:'Active Lounges',
          fontColor: 'white'
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              var dataset = data.datasets[tooltipItem.datasetIndex];
              var total = dataset.data.reduce(function(previousValue, currentValue) {
                return previousValue + currentValue;
              });
              var currentValue = dataset.data[tooltipItem.index];
              var percentage = Math.floor(((currentValue / total) * 100) + 0.5);
              return data.labels[tooltipItem.index] + ': ' + percentage + '%';
            }
          }
        }
      }
    });

    var loading = document.getElementById('loading');
    loading.style.display = 'block';

    function updatePlot() {
      
        



        var selectedClient = $('#client').text();
        

        var selectedLounge = $('#lounge_name').val();
        var selectedAirport = $('#airport_name').val();
        var selectedCity = $('#city_name').val();
        var selectedCountry = $('#country_name').val();
        var timeAlert = $('#time_alert').val();
        var plotInterval = $('#plt_interval').val();
        var clientOrder = $('#client_order').val();

        var PlotGradient = $('#PlotGradient').val();
        var PlotSize = $('#PlotSizer').val();
        var PlotThickness = $('#plt_thickness').val();
    
        var currentDate = new Date();
        var lastUpdate = currentDate.toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

        var monitorWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var monitorHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;              
        var screenSize = Math.sqrt(monitorWidth * monitorWidth + monitorHeight * monitorHeight);
       
        $('#last-update').text('Last Update: ' + lastUpdate).css('font-size', screenSize/180+'px');        
        
        var startDate = $('#startDate').val();
        var endDate = $('#endDate').val();

        if (startDate === '') {
          var today = new Date(); // Get the current date
          var timeAgo = new Date(today.getTime() - (90 * 24 * 60 * 60 * 1000)); // Subtract 14 days
      
          // Format the two weeks ago date as YYYY-MM-DD
          var formattedDate =
          timeAgo.getFullYear() +
            '-' +
            String(timeAgo.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(timeAgo.getDate()).padStart(2, '0');
      
          startDate = formattedDate; // Assign the formatted date to the startDate variable
          $('#startDate').val(startDate); // Update the value of the startDate input field
  
        }

        $.ajax({
            url: '/update_dashboard',
            type: 'POST',
            data: {
                client: selectedClient,
                lounge_name: selectedLounge,
                airport_name: selectedAirport,
                city_name: selectedCity,
                country_name: selectedCountry,
                time_alert: timeAlert,
                plt_interval: plotInterval,
                start_date: startDate, // Send the selected start date to the server
                end_date: endDate, // Send the selected end date to the server
                client_order: clientOrder,
                plot_gradient_intensity: PlotGradient,
                plt_thickness: PlotThickness,
                page_user: 'dashboard'
            },

            success: function(response) {
 
                var image_info = response.image_info;
                var activeRate = response.act_loung_num / (response.act_loung_num + response.inact_loung_num);
                var inactiveRate = response.inact_loung_num / (response.act_loung_num + response.inact_loung_num);
                updatePieChart(activeRate, inactiveRate);


                   
                    var imageSize = (PlotSize * screenSize) / (6 * Math.log2(2*image_info.length));

                    document.getElementById('plotContainer').style.display = 'block'; // Show the container

                    // Create a container div to hold all the plots
                    var container = document.createElement("div");
                    container.style.display = "flex";
                    container.style.flexWrap = "wrap";
                    container.style.justifyContent = "center"; // Align items horizontally in the center
                    container.style.alignItems = "center"; // Align items vertically in the center
                    
                    // Iterate over the image_info list and associate it with cl
                    for (var i = 0; i < image_info.length; i++) {
                        var imageData = image_info[i];
                    
                        // Create an image element with the decoded image data
                        var img = document.createElement("img");
                        img.src = "data:image/png;base64," + imageData;
                        img.style.width = imageSize + "px";
                        img.style.height = "auto";
                        img.style.margin = "5px"; // Add some margin between images
                    
                        // Add click functionality to the image
                    
                        // Append each image element to the container
                        container.appendChild(img);
                    }
                    
                    // Clear the plotContainer div
                    var plotContainer = document.getElementById("plotContainer");
                    while (plotContainer.firstChild) {
                        plotContainer.removeChild(plotContainer.firstChild);
                    }
                    
                    // Append the new container to the plotContainer div
                    plotContainer.appendChild(container);


                    var loading = document.getElementById('loading');
                    loading.style.display = 'none';

                    
                    
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
