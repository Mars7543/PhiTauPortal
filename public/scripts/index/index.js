let displaying_user = true

$(() => {
    handleQueryParams()

    $('.user').on('mouseenter', showLogout)
    $('.user').on('mouseleave', showUser)

    $('.sign-in-container').on('click', () => {
        window.location.href = $("a.sign-in").attr('href')
    })

    $('.logout-container').on('click', () => {
        window.location.href ='/logout'
    })
})

function handleAuthErrors() {
    M.toast({
        html: $("#auth-error").attr('error'),
        displayLength: 1000 * 3,
        classes: "toast-error"
    })
}

function handleLoggedOut() {
    const status = $("#logged-out").attr('status')
    const msg = $("#logged-out").attr('msg')

    M.toast({
        html: msg,
        displayLength: 1000 * 3,
        classes: status === "success" ? "toast-notification" : 'toast-error'
    })
}

function handleSignedIn() {
    const status = $("#signed-in").attr('status')
    const msg = $("#signed-in").attr('msg')

    M.toast({
        html: msg,
        displayLength: 1000 * 3,
        classes: status === "success" ? "toast-notification" : 'toast-error'
    })
}

function handleQueryParams() {
    const query = window.location.search.split('=')
    if (query.length === 2) {
        if (query[0] === "?auth_error") handleAuthErrors()
        else if (query[0] === "?signed_in") handleSignedIn()
        else if (query[0] === "?logged_out") handleLoggedOut()
        window.history.replaceState({}, document.title, window.location.origin)
    }
}

function showLogout() {
    if (displaying_user)
        $('.user-container').fadeOut(200, function() {
            $(this).attr('hidden', true)
            $('.logout-container').fadeIn(200, function() {
                displaying_user = false
            })
        })
}

function showUser() {
    if (!displaying_user)
        $('.logout-container').fadeOut(200, function() {
            $(this).attr('hidden', true)
            $('.user-container').fadeIn(200, function() {
                displaying_user = true
            })
        })
}