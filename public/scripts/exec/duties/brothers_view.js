$(() => {
    populate_brother_credits()

    $('select').formSelect();
    $('.sort-class').change(sortClass)
})

function sortByCredits(brother1, brother2) {
    const brother1_credits = $(brother1)
                                .children('.credits')
                                .text()
    const brother2_credits = $(brother2)
                                .children('.credits')
                                .text()

    return brother1_credits - brother2_credits
}

function sortByName(brother1, brother2) {
    const brother1_name = $(brother1)
                                .children('.name')
                                .text()
    const brother2_name = $(brother2)
                                .children('.name')
                                .text()

    return brother1_name.localeCompare(brother2_name)
}

function sortClass() {
    let sort = $(this).val()
    let $tbody = $(this)
                    .parents('.sort')
                    .siblings('.class-table')
                    .children('tbody')

    let brothers_tr = $tbody.children('tr').toArray()

    if (sort === 'name') brothers_tr.sort(sortByName)
    else brothers_tr.sort(sortByCredits)
    
    $tbody.html(brothers_tr)

    if (!$('.view-changes').hasClass('hidden'))
        window.duties_master.addSelectFunctionality()

    for (const brother_tr of brothers_tr)
        window.duties_master.toggleBorders.call($(brother_tr))

    window.duties_master.initExemptBorders()
}

function populate_brother_credits() {
    let $brother_trs = $('.class-table tbody tr')

    $brother_trs.each(function() {
        let $tr = $(this)
        let $td = $tr.children('td.credits')
        
        const id = $tr.attr('brother-id')
        $.ajax(`/api/assignment/credits/${id}/waiter`, {
            method: 'GET',
            success: ({ credits }) => {
                $td.attr('credits', credits)
                $td.text(credits)
            },
            error: e => {
                alert('Error getting brother credits, check console.')
                console.log(e)
            }
        })
    })
}