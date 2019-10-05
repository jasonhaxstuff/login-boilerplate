if (window.location.href.endsWith('/registration.html')) {
    $(document).ready(main)
}

function main () {
    $.getJSON('https://localhost:8000/api/account', data => {
        window.location.href = window.location.href.replace('/registration.html', '/account.html')
    })
}

function onRegistrationForm() {
    const data = $('#registrationForm').serializeArray()
    const toSend = {}

    data.forEach(d => toSend[d.name] = d.value)
    
    $.ajax({
        type: 'POST',
        url: 'https://localhost:8000/api/account',
        dataType: 'json',
        contentType: 'application/json',
        async: true,
        data: JSON.stringify(toSend),
        success: (data) => {
            if (data.errors && data.errors.length > 0) {
                const error = $('#error')
                const text = $('#errorText')

                text.text(data.errors.join(', '))
                error.attr('style', 'display:block')
                return
            }
            
            window.location.href = window.location.href.replace('/registration.html', '/account.html')
        },
        error: (jqXHR, textStatus, errorThrown) => {
            if (textStatus !== 'error') {
                return
            }
            
            const error = $('#error')
            const text = $('#errorText')
            const json = JSON.parse(jqXHR.responseText)

            text.text(json.errors.join(', '))
            error.attr('style', 'display:block')
        }
    })
}
