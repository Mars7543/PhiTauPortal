$(() => {
    window.duties_master = window.duties_master || {}
    window.duties_master.deleteDuty = deleteDuty
    window.duties_master.showEditDutyModal = showEditDutyModal
    window.duties_master.addSelectFunctionality = addSelectFunctionality
    window.duties_master.initExemptBorders = initExemptBorders
    window.duties_master.toggleBorders = toggleBorders

    $('.manage-duties').on('click', scrollToCalendar)
    $('.view-changes').on('click', function() {
        addSelectedBrothersToModal()
        $(".cancel-duty").off('click')
        $(".cancel-duty").on('click', reset)
        M.Modal.getInstance($('#add-edit-duty')).open()
    })
    
    $('.add-brother').focus(function() { $(this).blur() })
    $(".cancel-duty").on('click', reset)
    $('.choose-brothers').click(chooseBrothers)

    initExemptBorders()
})

function initExemptBorders() {
    $('tr[duty-exempt="true"]').each(function () {
        const $this = $(this)
        const $prev = $this.prev().length === 1 ? $this.prev() : $this.parent().prev().children('tr')    

        $this.addClass('no-border')
        $prev.addClass('no-border')
    })
}

function toggleBorders() {
    const $this = $(this)
    const $prev = $this.prev().length === 1 ? $this.prev() : $this.parent().prev().children('tr')
    const $next = $this.next()

    if (!$prev.hasClass('selected') && (!$prev.hasClass('select-brother') || $prev.attr('duty-exempt') == "false") && 
        !$this.hasClass('selected') && $this.attr('duty-exempt') == "false") 
    {
        $prev.removeClass('no-border')
    }

    if (!$this.hasClass('selected') &&  $this.attr('duty-exempt') == "false" && 
        !$next.hasClass('selected') &&  $next.attr('duty-exempt') == "false") 
    {
        $(this).removeClass('no-border')
    }
}

function chooseBrothers() {
    M.Modal.getInstance($('#add-edit-duty')).close()
    scrollToBrothers()
    
    $('.view-changes').removeClass('hidden')
    $('.manage-duties').addClass('hidden')

    if ($('tr.select-brother').length == 0)
        addSelectFunctionality()
}

function addSelectedBrothersToModal() {
    let $brothers = $('tr.selected')

    $('.assigned-brothers').remove()
    $('.modal-footer').remove()
    $('.cancel-duty').remove()

    let $brother_elements = ``

    $brothers.each(function() {
        let $tr = $(this)
        let brother_id = $tr.attr('brother-id')
        let credit_amount = $tr.attr('credit-amount')
        let $name = $($tr.children('td')[0]).text()

        let credit_text = `${credit_amount} credit${(Number(credit_amount) === 1 ? '' : 's')}`

        $brother_elements += 
            `<li class="collection-item">
                <div brother-id="${brother_id}" credit-amount="${credit_amount}">
                    <span class="name">${$name}</span>
                    <span class="credit">
                        ${credit_text} <i class="material-icons secondary-content unassign-brother">delete</i>
                    </span>
                </div>
            </li>`
    })
    let $assigned_brothers = `<ul class="collection with-header assigned-brothers">
        <li class="collection-header">
            <h4>Assigned Brothers</h4>
        </li>
        ${$brother_elements}
    </ul>`

    $("#add-edit-duty .add-container").append($assigned_brothers)

    const editing = $("#add-edit-duty").attr('duty-id') !== undefined
    let submit_text = editing ? 'Edit Duty' : 'Add Duty'

    let $modal_footer = 
        `<div class="modal-footer">
            <div class="actions-container">
                <button class="btn btn-large waves-effect waves-light assign-duty">${submit_text}</button>
                <button class="btn btn-large waves-effect waves-light cancel-duty">Cancel</button>
            </div>
        </div>`
        
    $("#add-edit-duty").append($modal_footer)

    $(".unassign-brother").on('click', unassignBrother)
    $(".assign-duty").on('click', editing ? editDuty : createDuty)
}

// recursively create assignments until all are done
function createAssignments(startDay, duty, $brothers, index) {
    // base case, all assignments were created
    if (index >= $brothers.length) {
        const dateString = `${duty.date.month+1}/${duty.date.day}`
        M.toast({
            html: `Created duty "${duty.name}" on ${dateString}`,
            displayLength: 1000 * 3,
            classes: "toast-success"
        })

        reset()
        window.duties_master.renderCalendar(duty.date.month, startDay, duty.year)
        scrollToCalendar()

        return
    }

    const $brother = $($brothers[index])

    const brother_id = $brother.attr('brother-id')
    const credit = Number($brother.attr('credit-amount'))
    
    if (credit === 0) status = "Missed"
    else if (credit < 1) status = "Incomplete"
    else status = "Completed"
    
    let today = new Date()
    let duty_date = new Date(duty.date.year, duty.date.month, duty.date.day)

    if (duty_date <= today) status = "Upcoming"

    $.ajax('/api/assignment', {
        method: 'POST',
        data: {
            duty : duty._id, 
            brother : brother_id,
            status, credit
        },
        success: assignment => {
            $credit_td = $(`.class-table tr[brother-id="${brother_id}"] .credits`)
            $credit_td.text(Number($credit_td.text()) + credit)
            createAssignments(startDay, duty, $brothers, index + 1)
        },
        error: e => {
            alert('Error assigning duty, check console.')
            console.log(JSON.stringify(e))
        }
    })
}

function createDuty() {
    let name = $("#duty-name").val()
    
    let month       = $("#add-edit-duty").attr('month')
    let day         = $("#add-edit-duty").attr('day')
    let year        = $("#add-edit-duty").attr('year')
    let startDay    = $(".duties-view").attr('start-day')

    // create duty
    $.ajax('/api/duty', {
        method: 'POST',
        data: {
            type : window.duties_master.duty_type, 
            name, 
            date: JSON.stringify({ month, day, year })
        },
        success: res => {
            const $brothers = $('#add-edit-duty .collection-item div').toArray()
            createAssignments(startDay, res.duty, $brothers, 0)
        },
        error: e => {
            alert('Error assigned duty, check console.')
            console.log(JSON.stringify(e))
        }
    })
}

function editDuty() {
    let name = $("#duty-name").val()
    let duty_id = $("#add-edit-duty").attr('duty-id')
    let startDay = $(".duties-view").attr('start-day')

    // update duty
    $.ajax(`/api/duty/${duty_id}?_method=PUT`, {
        method: 'POST',
        data: { name },
        success: ({ duty }) => {
            // delete old assignments
            $.ajax(`/api/assignment/${duty_id}?delete_by_duty=1&_method=DELETE`, {
                method: 'POST',
                success: ({ assignments }) => {
                    for (let { brother : brother_id, credit } of assignments) {
                        $credit_td = $($(`.class-table tr[brother-id="${brother_id}"] .credits`))
                        $credit_td.text(Number($credit_td.text()) - credit)
                    }

                    // create new assignments
                    let $brothers = $('#add-edit-duty .collection-item div').toArray()
                    createAssignments(startDay, duty, $brothers, 0)
                },
                error: e => {
                    alert('Error deleting assignments, check console.')
                    console.log(JSON.stringify(e))
                }
            })
        },
        error: e => {
            alert('Error updating duty, check console.')
            console.log(JSON.stringify(e))
        }
    })
}

function deleteDuty() {
    const $dutyDiv = $(this).parents('.duty')
    const dutyID = $dutyDiv.attr('duty-id')

    let $date = $dutyDiv.parents('td')
    let month = Number($date.attr('month'))
    let day = Number($date.attr('day'))
    let dateString = `${month+1}/${day}`
    let startDay = $(".duties-view").attr('start-day')

    const dutyName = $dutyDiv.children('.duty-details').children('h3').text()

    if(confirm(`Are you sure you would like to delete "${dutyName}" on ${dateString}`)) {
        $.ajax(`/api/duty/${dutyID}?_method=DELETE`, {
            method: 'POST',
            success: ({ assignments }) => {
                for (let { brother : brother_id, credit } of assignments) {
                    $td = $($(`.class-table tr[brother-id="${brother_id}"] .credits`))
                    $td.text(Number($td.text()) - credit)
                }

                M.toast({
                    html: `Deleted "${dutyName}" on ${dateString}`,
                    displayLength: 1000 * 3,
                    classes: "toast-success"
                })

                renderCalendar(month, startDay)
            },
            error: err => {
                alert(`Error deleting duty, check console.`)
                console.log(JSON.stringify(err))
            }
        })
    }
}

function unassignBrother() {
    let $div = $(this).parent().parent()
    let $li = $div.parent()
    let brother_id = $div.attr('brother-id')

    let $tr = $(`tr.selected[brother-id="${brother_id}"]`)
    $tr.removeClass('selected')
    $li.fadeOut(300, function() {
        $(this).remove()

        toggleBorders.call($tr)

        let $ul = $("ul.assigned-brothers")
        if ($ul.children(".collection-item").length == 0) {
            $('#add-edit-duty .add-close-container')
                .append('<button class="btn btn-large waves-effect waves-light cancel-duty">Cancel</button>')

            $ul.fadeOut(200, function() {
                $(this).remove()
            })
            
            $(".modal-footer").fadeOut(200, function() {
                $(this).remove()
            })

            $(".cancel-duty").off('click')
            $(".cancel-duty").on('click', reset)
        }
    })
}

function showEditDutyModal(id) {
    addSelectFunctionality()

    $.ajax(`/api/duty/${id}`, {
        method: 'GET',
        success: ({ duty, assignments }) => {
            for (let { brother, credit } of assignments) {
                // make brothers selected and add credit amount
                let $tr = $(`.class-table tr[brother-id="${brother._id}"]`)
                $tr.addClass('select-brother selected')
                $tr.attr('credit-amount', credit)
                toggleBorders.call($tr)
            }
            
            let { month, day, year } = duty.date
            let date = `${month + 1}/${day}`

            $('#add-edit-duty').attr('duty-id', duty._id)
            $('#add-edit-duty').attr('year', year)
            $('#add-edit-duty').attr('month', month)
            $('#add-edit-duty').attr('day', day)

            $('#add-edit-duty .title').text(`Edit Duty (${date})`)
            $("#duty-name").val(duty.name)
            
            addSelectedBrothersToModal()
        
            $('.cancel-duty').on('click', reset)
            M.updateTextFields()
            M.Modal.getInstance($('#add-edit-duty')).open()
        },
        error: err => {
            alert('Error showing edit duty modal, check console.')
            console.log(JSON.stringify(err))
        }
    })
}

function reset() {
    removeSelectFunctionality()

    if ($("#add-edit-duty .add-close-container .cancel-duty").length == 0) {
        $('#add-edit-duty .add-close-container')
            .append('<button class="btn btn-large waves-effect waves-light cancel-duty">Cancel</button>')
    }

    $('.assigned-brothers').remove()
    $('.modal-footer').remove()
    $("#duty-name").val('')

    $('.view-changes').addClass('hidden')
    $('.manage-duties').removeClass('hidden')

    M.Modal.getInstance($('#add-edit-duty')).close()
}

function removeSelectFunctionality() {
    $('tr.select-brother').off('mouseenter')
    $('tr.select-brother').off('mouseleave')
    $('tr.select-brother').off('click')
    $('tr.select-brother').each(function() {
        $(this).removeClass('selected')
        $(this).removeClass('select-brother')
        $(this).removeAttr('credit-amount')
        toggleBorders.call(this)
    })
}

function addSelectFunctionality() {
    $('.class-table tbody tr').addClass('select-brother')

    $('tr.select-brother').on("mouseenter", function () {
        const $this = $(this)
        const $prev = $this.prev().length === 1 ? $this.prev() : $this.parent().prev().children('tr')

        $this.addClass('no-border')
        $prev.addClass('no-border')
    })

    $('tr.select-brother').on("mouseleave", toggleBorders)

    $('tr.select-brother').on("click", function() {
        let selecting = !$(this).hasClass('selected')
        $(this).toggleClass('selected')

        let confirmText = ''
        let brother = $($(this).children('td')[0]).text()

        if (selecting)
            confirmText = $(this).attr('duty-exempt') == "false" 
                                ? `Assign ${brother} a ${window.duties_master.duty_type}?`
                                : `${brother} is exempt from duties.\nWould you like to assign him a ${window.duties_master.duty_type} anyway?`

        else
            confirmText = `Unassign ${brother}?`

        if (!confirm(confirmText))
            $(this).toggleClass('selected')
        else if (selecting) {
            let promptText = `How many credits would you like to give ${brother}?\n(Default is 1 credit)`
            let credit = prompt(promptText, 1)
            while (!credit || isNaN(Number(credit)) || Number(credit) < 0) {
                if (isNaN(credit)) promptText = `${credit} is not a valid number.\nPlease input a valid number (default is 1 credit).`
                else promptText = `Credit amount must be a nonnegative number (default is 1).`
                credit = Number(prompt(promptText, 1))
            }

            $(this).attr('credit-amount', credit)
        }
    })
}

function scrollToCalendar() {
    $('html, body').stop().animate({
        'scrollTop': $("#calendar-start").offset().top
    }, 400, 'swing', function () {
        window.location.hash = "#calendar-start";
    })
}

function scrollToBrothers() {
    $('html, body').stop().animate({
        'scrollTop': $("#page-start").offset().top
    }, 400, 'swing', function () {
        window.location.hash = "#page-start";
    })
}