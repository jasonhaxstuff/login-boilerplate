$.getJSON('https://localhost:8000/api/account', data => {
    $('#login').attr('style', 'display:none')
    $('#register').attr('style', 'display:none')
})
.fail(() => {
    $('#account').attr('style', 'display:none')
    $('#logout').attr('style', 'display:none')
})

function logout () {
    $.ajax({
        type: 'GET',
        url: 'https://localhost:8000/api/logout',
        async: true,
        success: (data) => {            
            window.location.href = "https://localhost:8000"
        }
    })
}
