$(() => {
    window.duties_master = window.duties_master || {}
    init()
})

function init() {
    createInputBrotherRows(10)
    loadBrothers()
    modalInit()
    selectInit()

    $('.submit-brothers').click(submitNewBrothers)
    $('#edit-brother .btn.edit').click(editBrother)

    $(".off-campus").change(function() {
        if(this.checked) {
            $('.duty-exempt').prop('checked', true)
            $("#duty-exemption").removeAttr('disabled')
            $("#duty-exemption").val('Off Campus')
        } else {
            let exemption_reason = $("#duty-exemption").val()

            if (exemption_reason == "Off Campus") {
                $('.duty-exempt').prop('checked', false)
                $("#duty-exemption").val('')
                $("#duty-exemption").attr('disabled', 'disabled')
            }
        }
    })

    $(".duty-exempt").change(function() {
        if(this.checked)
            $("#duty-exemption").removeAttr('disabled')
        else {
            $('.off-campus').prop('checked', false)
            $("#duty-exemption").val('')
            $("#duty-exemption").attr('disabled', 'disabled')
        }
    })
}

function selectInit() {
    $.ajax('/api/class', {
        success: ({ classes }) => {
            let massAddByClassOptions = '<option value="" selected>Custom</option>'
            let filterByClassOptions = '<option value="show-all" selected>Show All</option>'

            for (class_ of classes) {
                massAddByClassOptions += `<option value="${class_._id}">${class_.className}</option>`
                filterByClassOptions += `<option value="${class_._id}">${class_.className}</option>`
            }

            $("#mass-select-class").append(massAddByClassOptions)
            $("#filter-by-class").append(filterByClassOptions)

            $('select').formSelect();
            $('#mass-select-class').on('change', massAddByClass)
            $('#filter-by-class').on('change', filterByClass)
        },
        error: err => {
            alert('Error loading classes for brother input, check console.')
            console.log(JSON.stringify(err))
        }
    })
}

function massAddByClass() {
    let class_ = $(this).val()
    $('.add-brothers select').each(function() {
        $(this).val(class_)
    })

    $('select').formSelect()
}

function filterByClass() {
    let class_ = $(this).val()
    $(".view-brothers tr").each(function() {
        let class_id = $(this).attr('class-id')
        if (class_ === "show-all") $(this).removeClass('hidden')
        else {
            if (class_id !== class_) $(this).addClass('hidden')
            else $(this).removeClass('hidden')
        }
    })
}

function createInputBrotherRows(rows) {
    $.ajax('/api/class', {
        success: res => {
            for (let i = 0; i < rows; i++) addBrotherRow.call(null, res.classes)
        },
        error: err => {
            alert('Error loading classes for brother input, check console.')
            console.log(JSON.stringify(err))
        }
    })
}

function addBrotherRow(classes) {
    const table = '.add-brothers table tbody'
    const lastRow = table + ' tr:last-of-type'
    const lastRowInput = lastRow + ' td:first-child'
    const lastRowDeleteBtn = lastRow + ' .delete-row'

    // // previous tr behave normally
    $(lastRow).off('click')
    $(lastRowInput).off('focusin')
    $(lastRowDeleteBtn).click(deleteCreateBrotherRow)

    // add new tr
    let newBrotherRow = `<tr>
                        <td><input name="first" type="text" placeholder="First Name"></td>
                        <td><input name="last" type="text" placeholder="Last Name"></td>
                        <td><input name="netid" type="text" placeholder="Net ID"></td>
                        <td>
                            <select name="class">
                                <option value="" disabled selected>Class</option>`

    for (class_ of classes) 
        newBrotherRow += `<option value="${class_._id}">${class_.className}</option>`

    newBrotherRow += `</select>
                </td>
                <td><i class="material-icons action-icon delete-row">delete</i></td>
            </tr>`

    $(table).append(newBrotherRow)

    // last tr creates brothers on click or focusin
    $(lastRow).on('click', createInputBrotherRows.bind(null, 1))
    $(lastRowInput).on('focusin', createInputBrotherRows.bind(null, 1))
    M.FormSelect.init($(lastRow + ' select')) // materialize select init
}

function deleteCreateBrotherRow() {
    const $tr = $(this).parent().parent()
    $tr.remove()
}

function submitNewBrothers() {
    // get brothers from inputs
    let brothers = []
    
    $('.add-brothers table tbody tr:not(:last-child)').each(function() {
        let brother = { name: {} }
        let $inputs = $(this).find('td input')

        brother.name['first'] = $($inputs[0]).val()
        brother.name['last'] = $($inputs[1]).val()
        brother['netid'] = $($inputs[2]).val()
        brother['class'] = $inputs.siblings('select').val()
    
        brothers.push(brother)
    })

    $.ajax('/api/brother', {
        method: 'POST',
        dataType: 'json',
        data : { brothersData : JSON.stringify(brothers) },
        success: ({ brothers }) => {
            console.log({ brothers })
            resetCreateBrotherInputs()
            loadBrothers()
        },
        error: err => {
            alert('Error submitting new brothers, check console.')
            console.log(JSON.stringify(err))
        }
    })
}
function resetCreateBrotherInputs() {
    $(".add-brothers tbody").empty()
    createInputBrotherRows(10)
}

function loadBrothers() {
    $('.view-brothers tbody').empty()
    
    $.ajax('/api/brother', {
        success: res => addLoadedBrothers(res.brothers), 
        error: err => {
            alert('Error loading brothers, check console.')
            console.log(JSON.stringify(err))
        }
    })
}

function addLoadedBrothers(brothers) {
    brothers.forEach(brother => {
        $('.view-brothers tbody').append(`
            <tr 
                brother-id="${brother._id}" 
                class-id="${brother.class._id}" 
                off-campus="${brother.off_campus}" 
                duty-exempt="${brother.duty_exempt}">
                    <td>${brother.name.first}</td>
                    <td>${brother.name.last}</td>
                    <td>${brother.netid}</td>
                    <td>${brother.class.className}</td>
                    <td>
                        <i class="material-icons action-icon edit-row">edit</i>
                        <i class="material-icons action-icon delete-row">delete</i>
                    </td>
            </tr>`
        )

        $editBtns = $('.view-brothers .edit-row')
        $editBtn = $($editBtns[$editBtns.length - 1])

        $deleteBtns = $('.view-brothers .delete-row')
        $deleteBtn = $($deleteBtns[$deleteBtns.length - 1])
        
        $editBtn.click(showEditBrotherModal)
        $deleteBtn.click(deleteBrother)
    })
}

function modalInit() {
    $.ajax('/api/class', {
        success: ({ classes }) => {
            let $select =  $("#edit-brother select")
            for (let class_ of classes)  
               $select.append(`<option value="${class_._id}">${class_.className}</option>`)

            M.FormSelect.init($select)

            $('.modal').modal();
        },
        error: err => {
            alert('Error initializing edit brother modal, check console.')
            console.log(JSON.stringify(err))
        }
    })
}

function showEditBrotherModal() {
    const $tr = $($(this).parent('td')).parent('tr')
    const brother_id = $tr.attr('brother-id')
    const class_id = $tr.attr('class-id')
    const off_campus = $tr.attr('off-campus')
    const duty_exempt = $tr.attr('duty-exempt')

    const first = $($tr.children('td')[0]).text()
    const last = $($tr.children('td')[1]).text()
    const netid = $($tr.children('td')[2]).text()

    $("#edit-brother").attr('brother-id', brother_id)
    $("#first").val(first)
    $("#last").val(last)
    $("#netid").val(netid)

    if (off_campus === "false") 
        $('input.off-campus').prop('checked', false)
    else
        $('input.off-campus').prop('checked', true)

    if (duty_exempt !== "undefined") {
        $('.duty-exempt').prop('checked', true)
        $("#duty-exemption").removeAttr('disabled')
        $("#duty-exemption").val(duty_exempt)
    } else {
        $('.duty-exempt').prop('checked', false)
        $("#duty-exemption").attr('disabled', 'disabled')
        $("#duty-exemption").val('')
    }
    
    $(`#edit-brother option`).each(function() {
        if ($(this).attr('value') === class_id)
            $(this).attr('selected', 'selected')
        else $(this).removeAttr('selected')
    })

    M.updateTextFields();
    M.FormSelect.init($("#edit-brother select"))

    M.Modal.getInstance($('#edit-brother')).open()
}

function editBrother() {
    const brother_id = $("#edit-brother").attr('brother-id')
    const first = $('#edit-brother .form-field #first').val()
    const last = $('#edit-brother .form-field #last').val()
    const netid = $('#edit-brother .form-field #netid').val()
    
    const $form_field = $($('#edit-brother .form-field')[1])
    const $input_field = $form_field.children('.input-field:last-child')
    const $select = $input_field.children('.select-wrapper').children('select')

    const class_ = $select.val()

    const off_campus = $('input.off-campus').prop("checked")
    const duty_exempt = $('input.duty-exempt').prop("checked") ? $("#duty-exemption").val() : 'undefined'

    const brother = { name: { first, last }, netid, class: class_, off_campus, duty_exempt }

    $.ajax(`/api/brother/${brother_id}?_method=PUT`, {
        method: 'POST',
        dataType: 'json',
        data: { brotherData : JSON.stringify(brother) },
        success: res => updateBrotherRow(brother_id, res.brother),
        error: err => {
            alert('Error editing brother, check console.')
            console.log(JSON.stringify(err))
        },
    })
}

function updateBrotherRow(brother_id, brother) {
    const $tds = $(`tr[brother-id=${brother_id}] td`)

    $($tds[0]).text(brother.first)
    $($tds[1]).text(brother.last)
    $($tds[2]).text(brother.netid)
    $($tds[3]).text(brother.class.className)

    $(`tr[brother-id=${brother_id}]`).attr('off-campus', brother.off_campus)
    $(`tr[brother-id=${brother_id}]`).attr('duty-exempt', brother.duty_exempt)
}

function deleteBrother() {
    const $tr = $($(this).parent('td')).parent('tr')
    const brother_id = $tr.attr('brother-id')

    const first = $($tr.children('td')[0]).text()
    const last = $($tr.children('td')[1]).text()

    if (confirm(`Are you sure you would like to delete ${first} ${last}`))
        $.ajax(`/api/brother/${brother_id}?_method=DElETE`, {
            method: 'POST',
            success: _ => {
                deleteBrotherRow(brother_id)
            },
            error: err => {
                alert('Error deleting brother, check console.')
                console.log(JSON.stringify(err))
            }
        })
}

function deleteBrotherRow(brother_id) {
    $(`tr[brother-id=${brother_id}]`).remove()
}