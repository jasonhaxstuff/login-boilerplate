if (window.location.href.endsWith('/login.html')) {
    $(document).ready(main)
}

function main () {
    $.getJSON(`${API_ENDPOINT}/account`, data => {
        window.location.href = window.location.href.replace('/login.html', '/account.html')
    })
}

function onLoginForm() {
    const data = $('#loginForm').serializeArray()
    const toSend = {}

    data.forEach(d => toSend[d.name] = d.value)
    
    $.ajax({
        type: 'POST',
        url: `${API_ENDPOINT}/login`,
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
            
            window.location.href = window.location.href.replace('/login.html', '/account.html')
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
