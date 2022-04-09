$(() => {
    $('.brother-options .profile').click(() => {
        window.location.href = "/profile";
    })

    $('.brother-options .my-duties').click(() => {
        window.location.href = "/duties";
    })

    $('.brother-options .assign-duties').click(() => {
        window.location.href = "/exec/duties-master";
    })
})