$('#btn-delete').click(function (e) {
    e.preventDefault();

    let $this = $(this);
    const response = confirm('Are you sure you want to delete this account?');
    if (response) {
      $.ajax({
        url: '/delete-account/',
        type: 'DELETE',
        success: (result) => {
            window.location = '/'
        },
        fail: (result) => {
            alert('An Error occurred while deleting')
            window.location = '/dashboard'
        }
      })
        .done(function(result) {
        });
    }
  })