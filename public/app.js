$(document).ready(function() {
  function getBars(location) {
    $('.list').empty();
    $.ajax({
      url: `http://localhost:3000/search/${location}`,
      method: 'POST',
      //data: JSON.stringify({ "location": location }),
      success: function(response) {
        $('#input').val('')
        console.log(response)
        response.forEach(bar => {

          $('.list').append(`<div class="row list-item"><li><div class="col span-1-of-3"><img src="${bar.image_url}"></div><div class="col span-1-of-3"><a href="${bar.url}" target="_blank" class="bar-name">${bar.name}</a><br>
          ${bar.location.display_address.join('<br>')}<br>${bar.going.length} going </div><div class="col span-1-of-3">Are you going?<br><a href="/rsvp/${bar.yelp_id}" class="btn btn-full">Yes </a>
          <a href="/not-going/${bar.yelp_id}" class="btn btn-ghost">No</a></div></li></div>`)
        })
      },
      error: function(error) {
        console.error(error)
      }
    })
  }
  if (localStorage.getItem('location')) {
    getBars(localStorage.getItem('location'));
  }
  $('#search-form').on('submit', function(e) {
    e.preventDefault()
    var location = $('#input').val()
    localStorage.setItem('location', location)
    getBars(location);
  })
});
