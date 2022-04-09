$(() => {
    window.duties_master = window.duties_master || {}
    window.duties_master.renderCalendar = renderCalendar
    window.duties_master.duty_type = $("#duty-type").attr('duty-type')
    init()
})

const monthsText = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]

function init() {
    verfiyDeviceSize()
    $(window).resize(verfiyDeviceSize)

    let date = new Date()
    let month = date.getMonth()
    let day = date.getDate()
    let year = date.getFullYear()

    renderCalendar(month, day)

    $('.show-prev-month').click(() => {
        month = month === 0 ? 11 : month - 1
        day = month === date.getMonth() ? date.getDate() : 1

        renderCalendar(month, day, year)
    })
    $('.show-next-month').click(() => {
        month = month === 11 ? 0 : month + 1
        day = month === date.getMonth() ? date.getDate() : 1

        renderCalendar(month, day, year)
    })
    $('.show-cur-month').click(() => {
        month = new Date().getMonth()
        day = date.getDate()

        renderCalendar(month, day, year)
    })

    $('#add-edit-duty').modal({ dismissible: false })
}

function renderCalendar(month=(new Date()).getMonth(), day=(new Date()).getDate(), year=(new Date().getFullYear())) {
    month = Number(month)
    day = Number(day)
    year = Number(year)

    $('.calendar').addClass('loading')
    if ($('.calendar').children('.preloader').length === 0)
        $('.calendar').append(`
            <div class="preloader-wrapper active">
                <div class="spinner-layer spinner-blue-only">
                    <div class="circle-clipper left">
                        <div class="circle"></div>
                    </div>
                    <div class="gap-patch">
                        <div class="circle"></div>
                    </div>
                    <div class="circle-clipper right">
                        <div class="circle"></div>
                    </div>
                </div>
            </div>
        `)

    $.ajax(`/api/duty/schedule/${window.duties_master.duty_type}/${month}/${year}`, {
        success: ({ schedule }) => {
            // clear calendar
            $('.days').empty()

            // set month and current day text
            let currentDate = new Date()
            let date = new Date(currentDate.getFullYear(), month)

            let daysAdded = 0

            let isCurrentMonth = currentDate.getMonth() === date.getMonth()
            let dateString = "" 

            if (isCurrentMonth) {
                dateString = currentDate.toDateString()
                $('.date p').addClass('inactive')
            } else { 
                dateString = "Jump to Today"
                $('.date p').removeClass('inactive')
            }

            $('.date h1').text(monthsText[date.getMonth()])
            $('.date p').text(dateString)

            // add days before 1st of current month with days of previous month
            tempDate = new Date(date.getFullYear(), month)
            tempDate.setDate(1)
            const daysBefore1st = tempDate.getDay()
            tempDate.setDate(0)
            const lastDayOfPrevMonth = tempDate.getDate()
            for (let day = daysBefore1st; day > 0; day--) {
                let d = lastDayOfPrevMonth - day + 1
                let dayClass = 'prev-month'
                if (schedule.prevMonth.indexOf(d) === -1) dayClass += ' no-duty'
                $('.days').append(`<div day=${d} class='${dayClass}'>${d}</div>`)
                daysAdded++
            }

            // add days of this month
            const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
            const days = lastDayOfMonth.getDate()
            const currentDay = currentDate.getDate()
            for (let day = 1; day < days + 1; day++) {
                let dayText = isCurrentMonth && day === currentDay ? `${day}*` : day
                let dayClass = ""

                if (date.getMonth() < currentDate.getMonth() || isCurrentMonth && day < currentDay)
                    dayClass = "before-today"
                if (schedule.month.indexOf(day) === -1) dayClass += ' no-duty'

                $('.days').append(`<div day=${day} class="${dayClass}">${dayText}</div>`)
                daysAdded++
            }

            // fill remaining days with days of next month
            const daysToAdd = 42 - daysAdded
            for (let day = 1; day <= daysToAdd; day++) {
                let dayClass = 'next-month'
                if (schedule.nextMonth.indexOf(day) === -1) dayClass += ' no-duty'
                $('.days').append(`<div day=${day} class="${dayClass}">${day}</div>`)
            }

            let timer
            $('.days div').click(function() {
                if (event.detail === 1) {
                    // if no dblclick functionality no delay is needed
                    delay = !$(this).hasClass('prev-month') && !$(this).hasClass('before-today') && !$(this).hasClass('next-month') ? 250 : 0
                    timer = setTimeout(() => {
                        let startDay = Number($(this).attr('day'))
                        let startMonth = month
                        if ($(this).hasClass('prev-month')) startMonth = month === 0 ? 11 : month - 1
                        if ($(this).hasClass('next-month')) startMonth = month === 11 ? 0 : month + 1
                        renderDutiesView(startMonth, startDay)
                    }, delay)
                }
            })
            $('.days div').dblclick(function () {
                clearTimeout(timer)
                
                let monthText = $(".calendar .month h1").text().toLowerCase()
                monthText = monthText.charAt(0).toUpperCase() + monthText.slice(1)
                let month = monthsText.indexOf(monthText)
                let day = $(this).attr('day')

                showAddDutyModal(month, day)
            })

            renderDutiesView(month, day)
        },
        error: err => {
            alert('Error rendering calendar, check console.')
            console.log(JSON.stringify(err))
        },
        complete: _ => {
            $('.calendar').children('.preloader-wrapper').remove()
            $('.calendar').removeClass('loading')
        }
    })
}

function createDutyElement(month, day, duties_assignments) {
    let $duties_tr = $(`<tr>
                            <td month=${month} day=${day}>
                                <h2 class="duty-date">${month+1}/${day}</h2>
                                <div class="tr-duties"></div>
                            </td>
                        </tr>`)

    let $duties_div = $duties_tr.children('td').children('.tr-duties')

    if (duties_assignments.length === 0) {
        let $duty_div = $(`<div class="duties">
                                <div class="duty">
                                    <div class="duty-details">
                                        <h3 class="duty-title no-duty-title">No ${window.duties_master.duty_type.toLocaleLowerCase()} duties</h3>
                                        <p class="duty-brothers"></p>
                                    </div>
                                    <div class="duty-actions">
                                        <i class="material-icons add-duty">add</i>
                                    </div>
                                </div>
                            </div>`)

        $duties_div.append($duty_div)

        let $addButton = $duty_div.children('.duty').children('.duty-actions').children('.add-duty')
        $addButton.click(function() {
            let date = $(this).parents('.tr-duties').siblings('h2.duty-date').text()
            month = Number(date.split('/')[0]) - 1
            day = Number(date.split('/')[1])

            showAddDutyModal(month, day)
        })
    } else {
        for (let { duty, assignments } of duties_assignments) {
            // get ids and names of assigned brothers
            let brother_ids = []
            let brother_names = ""

            for (let { brother } of assignments) {
                brother_ids.push(brother._id)
                brother_names += `${brother.full_name} & `
            }

            brother_names = brother_names.slice(0, brother_names.length - 2)

            let $duties = $(`<div class="duties">
                                <div class="duty" duty-id=${duty._id} brother-ids='${JSON.stringify(brother_ids)}'>
                                    <div class="duty-details">
                                        <h3 class="duty-title">${duty.name}</h3>
                                        <p class="duty-brothers">${brother_names}</p>
                                    </div>
                                    <div class="duty-actions">
                                        <i class="material-icons edit-duty">edit</i>
                                        <i class="material-icons delete-duty">delete</i>
                                    </div>
                                </div>
                            </div>`)

            $duties.children('.duty').children('.duty-actions').children('i.edit-duty').click(function() {
                window.duties_master.showEditDutyModal(duty._id)
            })

            $duties_div.append($duties)
        }
    }

    return $duties_tr
}

// recursively render duties after in ajax call so they are rendered in order
function renderDuty(index, dates) {
    if (index >= dates.length) {
        $('.duties-container table tbody').removeClass('loading')
        $('.duties-container').children('.preloader-wrapper').remove()
        $('i.delete-duty').click(window.duties_master.deleteDuty)
        
        return
    }

    const { month, day, year } = dates[index]
    $.ajax(`/api/assignment/${window.duties_master.duty_type}/${month}/${day}/${year}`, {
        method: 'GET',
        success: ({ duties_assignments }) => {
            const $dutyEl = createDutyElement(month, day, duties_assignments)
            $('.duties-container tbody').append($dutyEl)

            renderDuty(index + 1, dates)
        },
        error: e => {
            $('.duties-container table tbody').removeClass('loading')
            $('.duties-container').children('.preloader-wrapper').remove()
            $('i.delete-duty').click(window.duties_master.deleteDuty)

            alert('Error loading duties, check console.')
            console.log(e)
        }
    })
}

function renderDutiesView(month, day, year=(new Date().getFullYear())) {
    $('.duties-container tbody').addClass('loading')
    $('.duties-container').append(
        `<div class="preloader-wrapper active">
            <div class="spinner-layer spinner-blue-only">
                <div class="circle-clipper left">
                    <div class="circle"></div>
                </div><div class="gap-patch">
                    <div class="circle"></div>
                </div><div class="circle-clipper right">
                    <div class="circle"></div>
                </div>
            </div>
        </div>`
    )

    month = Number(month)
    day = Number(day)
    year = Number(year)

    let startDate = { month, day, year }
    
    let endDate = new Date(year, month, day + 6)
    endDate = {
        month: endDate.getMonth(),
        day: endDate.getDate(),
        year: endDate.getFullYear()
    }

    let dates = []
    
    // if week spans two months
    if (startDate.month !== endDate.month) {
        lastDateOfMonth = new Date(year, month + 1, 0)

        for (let day = startDate.day; day <= lastDateOfMonth.getDate(); day++)
            dates.push({ month, day, year })
        
        for (let day = 1; day <= endDate.day; day++)
            dates.push({
                month: endDate.month,
                day,
                year: endDate.year
            })
    } else {
        for (let day = startDate.day; day <= endDate.day; day++)
            dates.push({ month, day, year })
    }

    $('.duties-view').attr('start-day', day)
    $('.duties-view tbody').empty()
    $('.duties-view .header p').text(`${monthsText[startDate.month]} ${startDate.day} - ${monthsText[endDate.month]} ${endDate.day}`)

    renderDuty(0, dates)
}

function showAddDutyModal(month, day) {
    month = Number(month)
    day = Number(day)
    year = new Date().getFullYear()

    let date = `${month + 1}/${day}`

    $('#add-edit-duty').removeAttr('duty-id')
    $('#add-edit-duty').attr('month', month)
    $('#add-edit-duty').attr('day', day)
    $('#add-edit-duty').attr('year', year)

    $('#add-edit-duty .title').text(`Add Duty (${date})`)

    M.updateTextFields()
    M.Modal.getInstance($('#add-edit-duty')).open()
}

const verfiyDeviceSize = _ => {
    if ($(window).width() < 650 || $(window).height() < 650) {
        $('.invalid-screen').removeClass('none')
        $('.container').addClass('fade')
        $('body').addClass('no-clicks')
    } else {
        $('.invalid-screen').addClass('none')
        $('.container').removeClass('fade')
        $('body').removeClass('no-clicks')
    }
}