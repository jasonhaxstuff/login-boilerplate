if (window.location.href.endsWith('/account.html')) {
    $(document).ready(main)
}

function main () {
    const email = $('#email')
    const username = $('#username')
    
    $.getJSON('https://localhost:8000/api/account', data => {
        email.val(data.email)
        username.val(data.username)
    })
    .fail((jqXHR, textStatus, errorThrown) => {
        if (textStatus !== 'error') {
            return
        }
        
        if (errorThrown === 'Unauthorized') {
            window.location.href = window.location.href.replace('/account.html', '/login.html')
        } else {
            const error = $('#error')
            const text = $('#errorText')
            const json = JSON.parse(jqXHR.responseText)
            
            text.text(json.errors.join(', '))
            error.attr('style', 'display:block')
        }
    })
}

function onAccountForm() {
    const error = $('#error')
    const text = $('#errorText')
    const data = $('#accountForm').serializeArray()
    const toSend = {}
    
    error.attr('style', 'display:none')
    data.forEach(d => {
        if (d.value !== '' && d.value !== undefined && d.value !== null) {
            toSend[d.name] = d.value
        }
    })
    
    delete toSend.email
    
    if (toSend.editedPassword !== toSend.confirmPassword) {
        text.text('Passwords must match')
        error.attr('style', 'display:block')
        return
    }
    
    if (toSend.password === undefined) {
        text.text('Please enter your current password above')
        error.attr('style', 'display:block')
        return
    }
    
    $.ajax({
        type: 'PUT',
        url: 'https://localhost:8000//apiaccount',
        dataType: 'json',
        contentType: 'application/json',
        async: true,
        data: JSON.stringify(toSend),
        success: (data) => {
            if (data.errors && data.errors.length > 0) {
                $('#success').attr('style', 'display:none')
                $('#error').attr('style', 'display:block')
                $('#errorText').text(data.errors.join(', '))
                return
            }
            
            $('#success').attr('style', 'display:block')
            $('#successText').text('Successfully saved changes')
        },
        error: (jqXHR, textStatus, errorThrown) => {
            if (textStatus !== 'error') {
                return
            }
            
            const json = JSON.parse(jqXHR.responseText)

            $('#success').attr('style', 'display:none')
            $('#error').attr('style', 'display:block')
            $('#errorText').text(json.errors.join(', '))
        }
    })
}
