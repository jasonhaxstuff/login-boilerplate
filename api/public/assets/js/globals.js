var API_ENDPOINT = 'https://localhost:8000/api'

$.getJSON(`${API_ENDPOINT}/account`, data => {
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
        url: `${API_ENDPOINT}/logout`,
        async: true,
        success: (data) => {            
            window.location.href = "https://localhost:8000"
        }
    })
}
