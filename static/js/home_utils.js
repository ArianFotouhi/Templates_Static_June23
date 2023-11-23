$(document).ready(function() {
    $('#update-btn').click(function() {
      // $('#filterForm').collapse('hide');
      $('#filterForm').removeClass('show');

      document.getElementById("mySidenav").style.width = "0";
      document.getElementById("main").style.marginLeft= "0";
      document.body.style.backgroundColor = "#002F6F";
    });
  });
  
