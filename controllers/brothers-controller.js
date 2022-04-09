const Brother   = require('../models/Brother')
const debug     = require('debug')('controller:brothers-master')

const add_brothers = async (req, res) => {
    let { brothersData } = req.body

    if (!brothersData) 
        return res
                .status(400)
                .json({ 
                    status: "Failed",
                    msg : 'Please enter all fields before submitting.' 
                })
    
    brothersData = JSON.parse(brothersData)

    try {
        let brothers = await Brother.insertMany(brothersData)
        for (brother of brothers) {
            await brother.populate('class')
        }
        res
            .status(200)
            .json({ 
                status: "Success",
                brothers
            })
    } catch (e) {
        debug(e)
        res
            .status(400)
            .json({
                status: "Failed",
                msg: "Failed to add brothers.",
                error: e
            })
    }
}

const get_brothers = async (req, res) => {
    try {
        let brothers = await Brother.find({}).populate('class')
        brothers.sort((a, b) => {
            if (a.class.classNumber === b.class.classNumber)
                return a.name.first.toLowerCase().localeCompare(b.name.first.toLowerCase())
            
            return a.class.classNumber < b.class.classNumber ? -1 : 1
        })

        res
            .status(200)
            .json({ 
                status: "Success",
                brothers 
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to get brothers.",
                error: e
            })
    }
}

const get_brothers_by_class = async (req, res) => {
    try {
        let sort = req.query.sort || "name"
        let duty_type
        if (sort == "credits")
            duty_type = req.query.duty_type

        let brothers = await Brother.find({ class : req.params.class }).populate('class')
        brothers.sort((a, b) => {
            if (sort == "name")
                return a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase())
            else 
                return a.credits[duty_type] <= b.credits[duty_type] ? -1 : 1
        })

        res
            .status(200)
            .json({ 
                status: "Success",
                brothers 
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to load brothers by class.",
                error: e 
            })
    }
}

const update_brother = async (req, res) => {
    let { brotherData } = req.body

    if (!brotherData) 
        return res
            .status(400)
            .json({ 
                status: "Failed",
                msg : 'Please enter all fields before submitting.' 
            })
    
    brotherData = JSON.parse(brotherData)
    
    try {
        const brother = await Brother.findByIdAndUpdate(req.params.id, brotherData, { new : true }).populate('class')
        res
            .json({ 
                status: "Success",
                brother 
            })
    } catch (e) {
        debug(e)
        res
            .status(400)
            .json({ e })
    }
}

const update_brother_phone = async (req, res) => {
    try {
        const { phone_raw, phone_formatted } = req.body
    
        let brother = await Brother.findById(req.user._id)
        brother.phone = { 
            raw : phone_raw, 
            formatted : phone_formatted,
            verified: false
        }
        await brother.save()
    
        res
            .status(200)
            .json({
                status: "Success",
                brother
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to update phone number.",
                error: e
            })
    }
}

const delete_brother = async (req, res) => {
    try {
        const brother = await Brother.findByIdAndDelete(req.params.id)

        if (!brother)
            return res
                    .status(400)
                    .json({
                        status: "Failed",
                        msg: "Brother does not exist."
                    })

        res
            .status(200)
            .json({
                status: "Success",
                brother: brother
            })
    } catch (e) {
        debug(e)
        res
            .status(500)
            .json({ 
                status: "Failed",
                msg: "Failed to delete brother.",
                error: e
            })
    }
}

module.exports = {
    add_brothers,
    get_brothers,
    get_brothers_by_class,
    update_brother,
    update_brother_phone,
    delete_brother
}