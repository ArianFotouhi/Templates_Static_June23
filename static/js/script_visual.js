$(document).ready(function() {

    var notifContainer = document.getElementById("notif-container");
    var currentIndex = 0;
    var intervalId = null;

    function startInterval() {
        intervalId = setInterval(function() {
            notifContainer.textContent = notifications[currentIndex];
            currentIndex = (currentIndex + 1) % notifications.length;
        }, 5000); // Adjust interval timing as needed
    }

    function updateNotifications(newNotifications) {
        clearInterval(intervalId); // Clear existing interval
        notifications = newNotifications;
        currentIndex = 0;
        startInterval(); // Start the interval with updated notifications
    }

    // startInterval(); // Start the initial interval

    function calculatePlotsPerRow() {
        var windowWidth = window.innerWidth;
        var plotWidth = 250; // Width of each plot in pixels
        var margin = 0; // Margin between plots in pixels
      
        // Calculate the number of plots per row
        var plotsPerRow = Math.floor((windowWidth - margin) / (plotWidth + margin));
      
        return plotsPerRow;
    }
    
    
    // Usage example
    
    function createGradientDefs(svg, gradientId, startColor, endColor) {
        var gradient = svg.append("linearGradient")
            .attr("id", gradientId)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", startColor)
            .attr("stop-opacity", 1);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", endColor)
            .attr("stop-opacity", 1);
    }

    function Interval_Picker(value, unit){
      
  
      // let minutes;
      // switch (unit) {
      //   case 'hours':
      //     minutes = value * 60;
      //     break;
      //   case 'days':
      //     minutes = value * 60 * 24;
      //     break;
      //   case 'months':
      //     // Assuming 30 days per month
      //     minutes = value * 60 * 24 * 30;
      //     break;
      //   case 'years':
      //     // Assuming 365 days per year
      //     minutes = value * 60 * 24 * 365;
      //     break;
      //   default:
      //     minutes = 0;
      //     break;
      // }

      let days;
      switch (unit) {
       
        case 'days':
          days = value;
          break;
        case 'months':
          // Assuming 30 days per month
          days = value * 30;
          break;
        case 'years':
          // Assuming 365 days per year
          days = value * 365;
          break;
        default:
          days = 10;
          break;
      }
      return days;
    }

    function updatePlot() {
        var selectedClient = $('#client').val();
        var selectedLounge = $('#lounge_name').val();
        var selectedAirport = $('#airport_name').val();
        var selectedCity = $('#city_name').val();
        var selectedCountry = $('#country_name').val();
        var clientOrder = $('#client_order').val();
        var PlotGradient = $('#PlotGradient').val();
        var PlotSize = 9 - $('#PlotSizer').val();
        var PlotThickness = $('#plt_thickness').val();


        var currentDate = new Date();

        var lastUpdate = currentDate.toLocaleString([], { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });

        var monitorWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        var monitorHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;              
        var screenSize = Math.sqrt(monitorWidth * monitorWidth + monitorHeight * monitorHeight);

        if (!$('#customSwitches').prop('checked')) {
          // The condition is not true, so we leave the function here
          return;
        }

        $('#last-update').text('Last Update: ' + lastUpdate).css('font-size', screenSize/180+'px');
        $('#title-text').css('font-size', screenSize/100+'px');
        
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

          const value_alert = parseInt(document.getElementById('intervalValue_alert').value);
          const unit_alert = document.getElementById('intervalUnit_alert').value;
          var timeAlert = Interval_Picker(value_alert, unit_alert)

          const value = parseInt(document.getElementById('intervalValue_pltInterval').value);
          const unit = document.getElementById('intervalUnit_pltInterval').value;
          var plotInterval = Interval_Picker(value, unit)



        $.ajax({
            url: '/update_plot',
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
                plt_thickness: PlotThickness
            },

            success: function(response) {
             
              var cl = response.cl;
              var image_info = response.image_info;


              var traces = response.traces;
              var layouts = response.layouts;
              var errors = response.errors;

              
              var lounge_act_num = response.lounge_act_num;
              var lounge_inact_num = response.lounge_inact_num
                


              // -----------------------------Bar 1---------------------------//
                $('#progress_bar_lounge').css('width', (lounge_act_num * 100 / (lounge_act_num + lounge_inact_num)) + '%');
                total_lgs = lounge_act_num + lounge_inact_num
                $('#progress_bar_lounge_text').text('Active Lounges: '+(lounge_act_num * 100 / (lounge_act_num + lounge_inact_num)).toFixed(0) + '%' + ' ('+lounge_act_num+' / '+ total_lgs +')');
              // ------------------------------------------------------------//


                var vol_curr = response.vol_curr;
                var vol_prev = response.vol_prev;

              // -----------------------------Bar 2---------------------------//
                $('#vol_curr').text(formatNumberWithCommas(vol_curr));
                $('#vol_prev').text(formatNumberWithCommas(vol_prev));
                
                function formatNumberWithCommas(number) {
                    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }

                $('#progress_bar_vol').css('width', (vol_curr * 100 / (vol_prev)) + '%');
                $('#progress_bar_vol_text').text('Weekly Comparison: '+(vol_curr * 100 / (vol_prev)).toFixed(0) + '%' + ' ('+vol_curr+' / '+ vol_prev +')');
              // --------------------------------------------------------//


                var active_clients_num = response.active_clients_num;
                var inactive_clients_num = response.inactive_clients_num
                total_clients = active_clients_num + inactive_clients_num

              // -----------------------------Bar 3---------------------------//
                if (image_info && image_info.length == 2){
                   
                  $('#progress_bar_client').css('width', 100 + '%');
                            
                  if (active_clients_num != 0){
                    $('#act-client').text('Active');
                    $('#progress_bar_client_text').text('Active');
                  }
                  else{
                    $('#act-client').text('Inactive');
                    $('#progress_bar_client_text').text('Inactive');
                  }
                }
                else{
                  $('#progress_bar_client').css('width', (active_clients_num * 100 / (total_clients)) + '%');
                  $('#progress_bar_client_text').text('Client Activity: '+ (active_clients_num * 100 / (total_clients)).toFixed(0) + '%' + ' ('+active_clients_num+' / '+ total_clients +')');
                }
                // --------------------------------------------------------//
                

                
                // var newNotifications = response.notifications;
                // updateNotifications(newNotifications); // Update the notifications
               
                if (!$('#customSwitches').prop('checked')) {
                  // The condition is not true, so we leave the function here
                  return;
                }
                var chartsContainer = $('#charts-container');

                if (image_info) {
                    chartsContainer.empty();
                    $('#plotContainer').replaceWith('<div id="plotContainer"></div>');
                    var imageSize = (3*screenSize) / (PlotSize * image_info.length);

                   
                  if (image_info.length < 5) {
                    if (image_info.length == 2){
                   

                      image_info = image_info.slice(1);
                      cl = cl.slice(1);
                    }

                    var imagesContainer = $('<div>');
                    imagesContainer.css({
                      'display': 'flex',
                      'flex-wrap': 'wrap',
                    });
                    $('#plotContainer').append(imagesContainer);
                    
                    for (var i = 0; i < image_info.length; i++) {
                      var imageData = image_info[i];
                      var clItem = cl[i];
                  
                      var img = $('<img>');
                      img.attr('src', 'data:image/png;base64,' + imageData);
                      img.css({
                        'width': imageSize + 'px',
                        'height': 'auto',
                        'max-width': '70%',
                        'max-height': '100%',
                        'display': 'block',
                        'margin': 'auto',
                        'margin-bottom': '10px',
                      });
                      if(clItem){
                        img.on('click', createImageClickHandler(clItem));
                        img.css({'cursor': 'pointer'});
                      }
                  
                      imagesContainer.append(img); // Append the image to the slider
                    }
                  }
                  else{


                    var slider = $('<div class="slider"></div>'); // Create a slider container
                    slider.css({
                      'width': '95%', // Set the width of the slider container to 95%
                      'margin': '0 auto', // Center align the slider container
                      'margin-bottom': '30px',
                      'margin-top': '-15px'
                    });

                    $('#plotContainer').append(slider); // Append the slider container to the plotContainer
                    for (var i = 0; i < image_info.length; i++) {
                      var imageData = image_info[i];
                      var clItem = cl[i];
                  
                      var img = $('<img>');
                      img.attr('src', 'data:image/png;base64,' + imageData);
                      img.css({
                        // 'width': imageSize + 'px',
                        'height': 'auto',
                        'max-width': '70%',
                        'max-height': '100%',
                        'display': 'block',
                        'margin': 'auto',
                        'margin-bottom': '10px',
                      });
                      if(clItem){
                        img.on('click', createImageClickHandler(clItem));
                        img.css({'cursor': 'pointer'});
                      }
                  
                      slider.append(img); // Append the image to the slider
                    }
                  
                    // Initialize the slider using Slick Carousel
                    slider.slick({
                      dots: true, // Enable slide indicators
                      slidesToShow: PlotSize, // Number of slides to show at a time
                      slidesToScroll: 1,
                      autoplay: true,
                      autoplaySpeed: 3000,
                    });


                  
                    var slider2 = $('<div class="slider"></div>'); // Create another slider container
                    slider2.css({
                      'width': '95%', // Set the width of the slider container to 95%
                      'margin': '0 auto', // Center align the slider container
                    });
                    $('#plotContainer').append(slider2); // Append the second slider container to the plotContainer
                  
                    // Shuffle the image_info array randomly
                    shuffler = Math.random()
                    image_info.sort(() => shuffler - 0.5);
                    cl.sort(() => shuffler - 0.5);

                    for (var i = 0; i < image_info.length; i++) {
                    var imageData = image_info[i];
                    var clItem = cl[i];

                    var img = $('<img>');
                    img.attr('src', 'data:image/png;base64,' + imageData);
                    img.css({
                        // 'width': imageSize + 'px',
                        'height': 'auto',
                        'max-width': '70%',
                        'max-height': '100%',
                        'display': 'block',
                        'margin': 'auto',
                    });

                    if(clItem){
                      img.on('click', createImageClickHandler(clItem));
                      img.css({'cursor': 'pointer'});
                    }

                    slider2.append(img); // Append the image to the second slider
                    }

                  
                    // Initialize the second slider using Slick Carousel
                    slider2.slick({
                      dots: true, // Enable slide indicators
                      slidesToShow: PlotSize, // Number of slides to show at a time
                      slidesToScroll: 1,
                      autoplay: true,
                      autoplaySpeed: 3000,
                    });
                  
                
                  }
                    function createImageClickHandler(clItem) {
                      return function(event) {
                        var clickedImageSrc = clItem;
                      
                        window.location.href = "/home?clicked_image=" + encodeURIComponent(clickedImageSrc);
                      };
                    }                 
                }                            
                else {
                var chartsContainer = $('#charts-container');
                chartsContainer.empty();
                $('#customSwitches').prop('checked', false);

                document.getElementById('plotContainer').style.display = 'none'; // Hide the paragraph


                var plotsPerRow = calculatePlotsPerRow();

                for (var j = 0; j < Math.ceil(traces.length / plotsPerRow); j++) {
                  
                    // Create a new row for each set of plots
                    var rowDiv = $('<div>').addClass('row');
                    chartsContainer.append(rowDiv);
                    
                    // var paragraph = $('<p>').text("hey you!");
                    // chartsContainer.append(paragraph);

                    //each slide of carousel for 


                
                    // Calculate the start and end index for the current row
                    var startIndex = j * plotsPerRow;
                    var endIndex = Math.min(startIndex + plotsPerRow, traces.length);

                    // Loop through the plots within the current row range
                    for (var i = startIndex; i < endIndex; i++) {

                        var chartId = 'chart-' + i;
                        var chartDiv = $('<div>').attr('id', chartId).addClass('plot');
                
                        if (selectedClient !== '' || selectedLounge !== '' || selectedAirport !== '' || selectedCity !== '' || selectedCountry !== '') {
                            chartDiv.addClass('single');
                        }
                
                        rowDiv.append(chartDiv);
                
                        var data = [traces[i]];
                        var layout = layouts[i];
                        Plotly.newPlot(chartId, data, layout);

                        var arrowDiv = $('<div>').addClass('arrow');
                        var arrowIcon = '';

                        // if (errors[i]) {
                        //     var errorMessageDiv = $('<div>').addClass('error-message').text(errors[i]);
                        //     chartDiv.append(errorMessageDiv);
                        //     chartDiv.css('position', 'relative');
                        //     chartDiv.css('background-color', 'white');
                        // } else {
                        //     var lastRecord = data[0].y[data[0].y.length - 1];
                        //     var prevRecord = data[0].y[data[0].y.length - 2];
                        //     var growthPercentage = ((lastRecord - prevRecord) / prevRecord) * 100;

                        //     if (growthPercentage > 0) {
                        //         arrowIcon = $('<i>').addClass('up-arrow').text('▲');
                        //         chartDiv.css('background-color', 'white');
                        //     } else if (growthPercentage < 0) {
                        //         arrowIcon = $('<i>').addClass('down-arrow').text('▼');
                        //         chartDiv.css('background-color', 'white');
                        //     }

                        //     arrowDiv.append(arrowIcon);
                        //     arrowDiv.append('<br>');
                        //     arrowDiv.append(growthPercentage.toFixed(2) + '%');
                        // }

                        chartDiv.append(arrowDiv);

                        // var chartElement = document.getElementById(chartId);
                        // var linePath = chartElement.getElementsByClassName('js-line');
                        // if (linePath.length > 0) {
                        //     var svg = d3.select(linePath[0].parentNode);
                        //     var gradientId = "gradient-" + i;
                        //     createGradientDefs(svg, gradientId, "rgb(97, 255, 123)", "rgb(255, 0, 0)");
                        //     linePath[0].style.stroke = "url(#" + gradientId + ")";
                        //     }
                        }
                    }
                }
            }
        });
    }

  //     $('#customSwitches').on('change', function() {
  //   var isChecked = $(this).prop('checked');
  //   console.log(isChecked); // This will log the value (true or false) of the checkbox to the console
  // });
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
