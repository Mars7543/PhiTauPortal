$(() => {
    $("#phone").change(function() { $(this).val('') })
    $("#phone").keydown(validatePhone)
    $("#update-phone").click(updatePhone)
    $("#verify-phone").click(verifyPhone)
})

function updatePhone() {
    let phone_raw = $("#phone").attr('phone')
    let phone_formatted = $("#phone").val()
    let brother_id = $(".page-title h1").attr('brother-id')
    
    $.ajax(`/api/brother/phone/${brother_id}?_method=PUT`, {
        method: 'POST',
        data: { phone_raw, phone_formatted },
        success: res => {
            const { raw, formatted } = res.brother.phone
            let $phone = $("input#phone")
            
            $phone.val(formatted)
            $phone.attr('phone', raw)

            $("#update-phone").attr('disabled', 'disabled')

            M.toast({
                html: 'Phone number updated.',
                displayLength: 1000 * 3,
                classes: "toast-success"
            })
        },
        error: e => {
            M.toast({
                html: 'Error updating phone number.',
                displayLength: 1000 * 3,
                classes: "toast-error"
            })

            console.log(e)
        }
    })
}

function verifyPhone() {
    let phone = `${$("#phone").attr('phone')}`
    let phone_formatted = $("#phone").val()

    // $.ajax('/api/twilio/verify-phone', {
    //     method: 'POST',
    //     data: { phone, phone_formatted },
    //     success: ({ validationCode }) => {
    //         alert(`Your confirmation code is ${validationCode}.`)
    //     },
    //     error: e => {
    //         alert('Erroring verifying phone number. Checking console.')
    //         console.log(e)
    //     }
    // })
}

function validatePhone() {
    const prevValue = $(this).val()
    let key = event.key

    const special_keys = ['Tab', 'Enter', 'Meta', 'Alt', 'Control', 'Escape']

    if (special_keys.indexOf(key) !== -1) return
       
    else if (key === 'Backspace') {
        event.preventDefault()
    
        if (prevValue.length === 5)
            $(this).val('')
        else if (prevValue.length === 9) {
            $(this).val(prevValue.slice(0, prevValue.length-3))
        } else if (prevValue.length === 13) {
            $(this).val(prevValue.slice(0, prevValue.length-2))
        } else {
            $(this).val(prevValue.slice(0, prevValue.length-1))
        }

        let phone = $(this).attr('phone') || ''
        if (phone !== '') $(this).attr('phone', phone.slice(0, phone.length-1))
        if ($(this).val() === '') $(this).attr('phone', '')
        
        $("#update-phone").attr('disabled', 'disabled')
    }
    
    else if (key !== ' ' && !Number.isNaN(Number(key)) && prevValue.length < 17) {
        event.preventDefault()
        
        if (prevValue.length === 0) {
            $(this).val(`+1 (${key}`)
            key = 1 + key
        }
        else if (prevValue.length === 6)
            $(this).val(`${prevValue + key}) `)
        else if (prevValue.length === 11)
            $(this).val(`${prevValue + key}-`)
        else
            $(this).val(`${prevValue + key}`)

        let phone = $(this).attr('phone') || ''
        $(this).attr('phone', phone + key)

        if ($(this).attr('phone').length === 11) {
            $("#update-phone").removeAttr('disabled')
        }
    } else {
        event.preventDefault()
    }
}