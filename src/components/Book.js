import React, { useState, useEffect } from 'react'
import { Row, Col, UncontrolledDropdown, DropdownMenu, DropdownItem, Inout, Buttom } from 'reactstrap'
import Table from './Table'

const Book = (props) => {

    const [totalTables, setTotalTables] = useState([])

    //Users selections
    const [selection, setSelection] = useState({
        table: {
            name: null,
            id: null
        },
        date: new Date(),
        time: null,
        location: "Any Location",
        size: 0
    })

    //Users booking details
    const [booking, setBooking] = useState({
        name: "",
        phone: "",
        email: ""
    })

    //Potential Locations
    const [locations] = useState(["Any Location", "Patio", "Inside", "Bar"])
    const [times] = useState(["9AM", "10AM", "11AM", "1PM", "2PM", "3PM", "4PM", "5PM"])

    //Basic reservation validation
    const [reservationError, setReservationError] = useState(false)

    const getDate = () => {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        const date = months[selection.date.getMonth()] + " " + selection.date.getDate() + " " + selection.date.getFullYear()
        let time = selection.time > 12 ? time + 12 + ":00" : time + ":00"
        console.log(time)
        const datetime = new Date(date + " " + time)
        return datetime
    }

    const getEmptyTables = () => {
        let tables = totalTables.filter(table => table.isAvailable)
        return tables.length
    }

    useEffect(() => {
        //Check availability of tables in DB
        if (selection.time && selection.date) {
            (async () => {
                let dateTime = getDate()
                let res = await fetch('http://localhost:3005/availability', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        date: dateTime
                    })
                })
                res = await res.json()
                // Filter tables with location and size criteria
                let tables = res.tables.filter(
                    table =>
                        (selection.size > 0 ? table.capacity >= selection.size : true) &&
                        (selection.location !== "Any location"
                            ? table.location === selection.location : true)

                )
                setTotalTables(tables)
            })()
        }
    }, [selection.time, selection.date, selection.size, selection.location])

    // Make reservation if all filters are filled out
    const reserve = async () => {
        if (
            booking.name.length === 0 |
            booking.phone.length === 0 |
            booking.email.length === 0
        ) {
            console.log('Incomplete details')
            setReservationError(true)
        } else {
            const datetime = getDate()
            let res = await fetch('http://localhost:3005', {
                method: 'POST',
                headers: {
                    "Contet-Type": "application/json",
                    body: JSON.stringify({
                        ...booking,
                        date: datetime,
                        table: selection.table.id
                    })
                }
            })
            res = await res.text()
            console.log('Reserved ' + res)
            props.setPage(2)
        }
    }

    const selectTable = (table_name, table_id) => {
        setSelection({
            ...selection,
            table: {
                name: table_name,
                id: table_id
            }
        })
    }

    const getSizes = () => {
        let newSizes = []
        for (let i = 1; i < 8; i++) {
            newSizes.push(
                <DropdownItem key={i} className="booking-dropdown-item"
                    onClick={e => {
                        let newSel = {
                            ...selection,
                            table: {
                                ...selection.table
                            },
                            size: i
                        }
                        setSelection(newSel)
                    }}>
                    {i}
                </DropdownItem>
            )
        }
        return newSizes
    }

    const getLocations = () => {
        let newLocations = []
        locations.forEach(loc => {
            newLocations.push(
                <DropdownItem key={loc} className="booking-dropdown-item"
                    onClick={() => {
                        let newSel = {
                            ...selection,
                            table: {
                                ...selection.table
                            },
                            location: loc
                        }
                        setSelection(newSel)
                    }}>
                    {loc}
                </DropdownItem>
            )
        })
        return newLocations
    }


    const getTimes = () => {
        let newTimes = []
        times.forEach(time => {
            newTimes.push(
                <DropdownItem key={time} className="booking-dropdown-item"
                    onClick={() => {
                        let newSel = {
                            ...selection,
                            table: {
                                ...selection.table
                            },
                            time: time
                        }
                        setSelection(newSel)
                    }}>
                    {time}
                </DropdownItem>
            )
        })
        return newTimes
    }

    const getTables = () => {
        console.log('Getting Tables')
        if (getEmptyTables > 0) {
            let tables = []
            totalTables.forEach(table => {
                if (table.isAvailable) {
                    tables.push(
                        <Table
                            key={table._id}
                            id={table._id}
                            chairs={table.capacity}
                            name={table.name}
                            empty
                            selectTable={selectTable}
                        />
                    )
                } else {
                    tables.push(
                        <Table
                            key={table._id}
                            id={table._id}
                            chairs={table.capacity}
                            name={table.name}
                            selectTable={selectTable}
                        />
                    )
                }
            })
            return tables
        }
    }


    return (
        <div>
            <Row noGutters className="text-center align-items-center pizza-cta">
                <Col>
                    <p className="looking-for-pizza">
                        {!selection.table.id ? "Book a table" : "Confirm reservation"}
                        <i></i>
                    </p>
                </Col>
            </Row>
        </div>
    )

}


export default Book
