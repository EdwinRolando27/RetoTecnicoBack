const moment = require("moment")

const {db, pgp} = require("../scripts/pgAdaptor")
const {setRedisJson, getRedisJson} = require("./utils")

const removeItemFromArr = (arr, item) => {
    let i = arr.indexOf(item)
    i !== -1 && arr.splice(i, 1)
}

Array.prototype.unique = function (a) {
    return function () {
        return this.filter(a)
    }
}(function (a, b, c) {
    return c.indexOf(a, b + 1) < 0
})

Array.prototype.clean = function (deleteValue) {
    for (let i = 0, j = this.length; i < j; i++)
        if (this[i] === deleteValue) {
            this.splice(i, 1)
            i--
        }
    return this
}

Number.prototype.myFixed = function (decimals) {
    const rounding = Math.round(parseFloat(this) * Math.pow(10, decimals)) / Math.pow(10, decimals)

    return Number(rounding).toFixed(decimals)
}

Array.prototype.orderByString = function () {
    return this.sort((a, b) => a.localeCompare(b))
}

Array.prototype.orderByStringAsc = function (element) {
    return this.sort((a, b) => a[element].localeCompare(b[element]))
}

Array.prototype.orderByDateAsc = function (element) {
    return this.sort((a, b) => new Date(a[element]) - new Date(b[element]))
}

Array.prototype.orderByTwoStringAsc = function (element, element2) {
    return this.sort((a, b) => a[element].localeCompare(b[element])).sort((a, b) => a[element2].localeCompare(b[element2]))
}

Array.prototype.orderByStringDateAsc = function (element, element2) {
    return this.sort((a, b) => a[element].localeCompare(b[element])).sort((a, b) => new Date(a[element2]) - new Date(b[element2]))
}

Array.prototype.uniqueObject = function (element) {
    return [...new Set(this.map(item => item[element]))]
}

Array.prototype.toObject = function () {
    const rv = {}
    for (const element of this)
        rv[`a${element}`] = element
    return rv
}

const validateSerie = (serie, length, iniciales = [], obligatorio = true, exacto = true, numerico = true, alfanumerico = true) => {
    serie = serie.toString().trim().toUpperCase()
    if (!isNaN(serie) && serie !== '') {
        const newLength = serie.length
        serie = Math.trunc(Number(serie)).toString()
        serie = exacto ? serie.padStart(length, '0') : serie.padStart(newLength, '0')
    }

    if (!obligatorio && serie === '')
        return {status: true, value: serie}
    else if (!obligatorio && alfanumerico) {
        if (exacto) {
            if (serie.length !== length)
                return {status: false, value: serie, msg: `Serie "${serie}" debe tener ${length} dígitos!`}
        } else if (serie.length < 1 || serie.length > length)
            return {
                status: false,
                value: serie,
                msg: `Serie "${serie}" debe tener entre 1 y ${length} dígitos!`
            }

        return {status: true, value: serie}
    }

    if (numerico) {
        const s0 = iniciales.indexOf('0000')
        const s1 = iniciales.indexOf('0001')
        const c = s0 > -1 ? '0000' : (s1 > -1 ? '0001' : '0000')

        if (!isNaN(serie) && Number(serie) < Number(c))
            return {status: false, value: serie, msg: `Serie "${serie}" debe ser numérico mayor a cero (0)!`}
        else {
            if (obligatorio || serie !== '') {
                if (exacto) {
                    if (serie.length !== length)
                        return {status: false, value: serie, msg: `Serie "${serie}" debe tener ${length} dígitos!`}
                } else if (serie.length < 1 || serie.length > length)
                    return {
                        status: false,
                        value: serie,
                        msg: `Serie "${serie}" debe tener entre 1 y ${length} dígitos!`
                    }
            }
        }

        if (!isNaN(serie))
            return {status: true, value: serie}
    }

    removeItemFromArr(iniciales, '0000')
    removeItemFromArr(iniciales, '0001')
    const completo = [], parcial = []
    iniciales.forEach(element => {
        if (element.length === length)
            completo.push(serie === element)
        else
            parcial.push(serie.substring(0, element.length) === element)
    })

    if (completo.indexOf(true) > -1)
        return {status: true, value: serie}

    if (obligatorio && alfanumerico && !exacto) {
        if (serie.length < 1 || serie.length > length)
            return {
                status: false,
                value: serie,
                msg: `Serie "${serie}" debe tener entre 1 y ${length} dígitos!`
            }

        return {status: true, value: serie}
    }

    if (parcial.indexOf(true) > -1)
        return {status: true, value: serie}
    else
        return {status: false, value: serie, msg: `Serie "${serie}" no válida!`}
}

const validateCorrelativo = (correlativo, length, obligatorio = true, exacto = true, numerico = true, alfanumerico = true) => {
    correlativo = correlativo.toString().trim().replace(/,/g, '')

    if (!isNaN(correlativo) && correlativo !== '') {
        const newLength = correlativo.length
        correlativo = Math.trunc(Number(correlativo)).toString()
        correlativo = exacto ? correlativo.padStart(length, '0') : correlativo.padStart(newLength, '0')
    }

    if (!obligatorio && correlativo === '')
        return {status: true, value: correlativo}
    else if (obligatorio && alfanumerico) {
        if (exacto) {
            if (correlativo.length !== length)
                return {
                    status: false,
                    value: correlativo,
                    msg: `Correlativo "${correlativo}" debe tener ${length} dígitos!`
                }
        } else if (correlativo.length < 1 || correlativo.length > length)
            return {
                status: false,
                value: correlativo,
                msg: `Correlativo "${correlativo}" debe tener entre 1 y ${length} dígitos!`
            }

        if (isNaN(correlativo))
            return {status: true, value: correlativo}
    }

    if (numerico) {
        if (isNaN(correlativo) || Number(correlativo) < 1)
            return {
                status: false,
                value: correlativo,
                msg: `Correlativo "${correlativo}" debe ser numérico mayor a cero (0)!`
            }
        else {
            if (obligatorio || correlativo !== '') {
                if (exacto) {
                    if (correlativo.length !== length)
                        return {
                            status: false,
                            value: correlativo,
                            msg: `Correlativo "${correlativo}" debe tener ${length} dígitos!`
                        }
                } else if (correlativo.length < 1 || correlativo.length > length)
                    return {
                        status: false,
                        value: correlativo,
                        msg: `Correlativo "${correlativo}" debe tener entre 1 y ${length} dígitos!`
                    }
            }
        }

        if (!isNaN(correlativo))
            return {status: true, value: correlativo}
    }

    return {status: true, value: correlativo}
}

const vRuc = ruc => {
    const identificador = ruc
    ruc = ruc.trim()

    if (!(ruc >= 1e10 && ruc < 11e9
        || ruc >= 15e9 && ruc < 18e9
        || ruc >= 2e10 && ruc < 21e9))
        return {status: false, ruc: identificador, msg: `RUC "${identificador}" no válido!`}

    let ultimo = ruc.substring(10, 11)
    let suma = 0

    const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2]
    factores.forEach((valor, index) => {
        suma += (Number(ruc.substring(index, index + 1)) * valor)
    })

    let di = Math.trunc(suma / 11);
    let resultado = 11 - (Number(suma) - Number(di) * 11)

    if (resultado === 10)
        resultado = 0
    if (resultado === 11)
        resultado = 1

    return Number(ultimo) === resultado ? {
        status: true,
        ruc: identificador
    } : {
        status: false,
        ruc: identificador,
        msg: `RUC "${identificador}" no válido!`
    }
}

const vDate = (fecha, format = "YYYY-MM-DD") => {
    fecha = fecha ? fecha.toString().trim().replace(/-/g, "/") : ''

    if (fecha.length === 8)
        fecha = moment(fecha, "DD/MM/YYYY")
    else if (fecha.length === 10) {
        const index = fecha.indexOf("/")
        if (index === 4)
            fecha = moment(fecha, "YYYY/MM/DD")
        if (index === 2)
            fecha = moment(fecha, "DD/MM/YYYY")
        if (index === 1)
            fecha = moment(fecha, "DD/MM/YYYY")
    } else if (fecha.length === 9) {
        const index = fecha.indexOf("/")
        if (index === 1)
            fecha = moment(fecha, "DD/MM/YYYY")
        else
            return {status: false, input: '', msg: `La fecha "${fecha}" no es válida!`}
    } else
        return {status: false, input: '', msg: `Fecha "${fecha}" no es válida!`}

    if (!fecha.isValid())
        return {status: false, input: '', msg: `Fecha "${fecha}" no es válida!`}

    return {status: true, fecha, input: moment(fecha, format)}
}

const vContVencOper = (fecha, e_periodo, type, operacion = null) => {
    e_periodo = e_periodo ? e_periodo : ''

    e_periodo = `${e_periodo.substring(0, 4)}-${e_periodo.substring(4, 6)}`
    const vFecha = vDate(fecha)

    if (!vFecha.status)
        return {status: false, input: '', msg: vFecha.msg}

    const newFecha = moment(vFecha.fecha).format("DD/MM/YYYY")

    switch (type) {
        case 'contable':
        case 'operacion':
            if (moment(moment(vFecha.fecha).format("YYYY-MM-DD")).isAfter(moment(`${e_periodo}-${new Date(Number(e_periodo.substring(0, 4)), Number(e_periodo.substring(5, 7)), 0).getDate()}`).format("YYYY-MM-DD"))) //solo <= al periodo
                return {
                    status: false,
                    input: '',
                    msg: `Fecha "${newFecha}" no debe ser mayor al periodo actual!`,
                    [type]: newFecha
                }

            return {status: true, [type]: newFecha, input: moment(vFecha.fecha).format("YYYY-MM-DD")}
        case 'vencimiento':
            operacion = vDate(operacion)
            // if (moment(moment(vFecha.fecha).format("YYYY-MM-DD")).isBefore(moment(operacion.fecha).format("YYYY-MM-DD")))
            //     return {
            //         status: false,
            //         input: '', [type]: newFecha,
            //         msg: `Vencimiento "${newFecha}" no debe ser menor a la fecha de emisión del comprobante!`
            //     }

            return {status: true, [type]: newFecha, input: moment(vFecha.fecha).format("YYYY-MM-DD")}
    }
}

const vReglasCpd = (cpd, rcv) => {
    let {comprobante, serie, correlativo} = cpd
    serie = serie ? serie.toString().trim().toUpperCase() : ''
    correlativo = correlativo ? correlativo : ''

    let errors = {}
    const TABLA_11 = ['019', '028', '046', '055', '082', '091', '118', '127', '145', '154', '163', '172', '181', '190', '217', '226', '235', '244', '262', '271', '280', '299', '884', '893', '910', '929', '938', '947', '956', '965']

    switch (comprobante) {
        case '00':
            switch (rcv) {
                case '14.1':
                case '14.2':
                    cpd.estados = [0, 1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, false, true)
                    break
                case '8.1':
                case '8.2':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, false, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, false, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '01':
        case '99':
            switch (rcv) {
                case '14.1':
                case '14.2':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001', 'F', 'V', 'N'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001', 'F', 'V', 'N'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001', 'F'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '02':
            switch (rcv) {
                case '8.1':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001', 'V', 'N'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '03':
            switch (rcv) {
                case '14.1':
                case '14.2':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'EB01', 'B', 'V', 'N'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 4, ['0000', 'EB01', 'B', 'V', 'N'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'EB01', 'B'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '04':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    const newSerie04141 = serie
                    serie = validateSerie(serie, 4, ['0000', 'E001', 'L', 'V', 'N'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, newSerie04141.substring(0, 1) === 'E' ? 8 : 7, true, false, true, false)
                    break
                case '8.1':
                    cpd.estados = [0, 1, 6, 7, 9]

                    const newSerie0481 = serie
                    serie = validateSerie(serie, 4, ['0000', 'E001', 'L', 'V', 'N'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, newSerie0481.substring(0, 1) === 'E' ? 8 : 7, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    const newSerie0411 = serie
                    serie = validateSerie(serie, 4, ['0000', 'E001', 'L', 'V', 'N'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, newSerie0411.substring(0, 1) === 'E' ? 8 : 7, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '05':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 1, ['1', '2', '3', '4', '5', 'V', 'N'], true, true, false, false)
                    correlativo = validateCorrelativo(correlativo, 11, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 1, ['1', '2', '3', '4', '5'], true, true, false, false)
                    correlativo = validateCorrelativo(correlativo, 11, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 1, ['1', '2', '3', '4', '5'], true, true, false, false)
                    correlativo = validateCorrelativo(correlativo, 11, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '06':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '07':
        case '08':
            switch (rcv) {
                case '14.1':
                case '14.2':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001', 'EB01', 'B', 'F', 'S'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '8.1':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001', 'EB01', 'B', 'F', 'S'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001', 'EB01', 'B', 'F'], true, true, true, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '09':
            switch (rcv) {
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, [], true, true, false, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, false, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '10':
            switch (rcv) {
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 4, ['1683'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['1683'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '11':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 15, true, true, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 15, true, true, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 15, true, true, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '12':
            switch (rcv) {
                case '14.1':
                case '14.2':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], true, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], true, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], true, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '13':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 20, ['F'], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, ['F'], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, ['F'], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '14':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 20, ['S'], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, ['S'], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, ['S'], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '15':
        case '16':
        case '17':
        case '18':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '19':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '20':
            switch (rcv) {
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, false, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '21':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '22':
            switch (rcv) {
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 4, ['0820'], true, false, true, false)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0820'], true, false, false, false)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '23':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 1, 2, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001'], true, false, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001'], true, false, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'E001'], true, false, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '24':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '25':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 1, 2, 8, 9]

                    serie = validateSerie(serie, 4, ['0000'], true, false, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                case '8.1':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0000'], true, false, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0000'], true, false, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '26':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '27':
        case '28':
        case '29':
        case '30':
        case '32':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '31':
        case '33':
            switch (rcv) {
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, [], false, true, false, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, false, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '34':
        case '35':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 1, 2, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'F'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                case '8.1':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0000', 'F'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'F'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '36':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'S', 'F'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0000', 'S', 'F'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0000', 'S', 'F'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '37':
        case '43':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '40':
        case '41':
            switch (rcv) {
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, [], false, true, false, true)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, false, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '42':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '44':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '8.1':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '45':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 1, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '46':
            switch (rcv) {
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0000'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0000'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '48':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 1, 2, 8, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                case '8.1':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '49':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 1, 8, 9]

                    serie = validateSerie(serie, 20, [], true, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '8.1':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 20, [], true, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], true, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '50':
        case '51':
        case '52':
            switch (rcv) {
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 3, TABLA_11, true, false, false, false)
                    correlativo = validateCorrelativo(correlativo, 6, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 3, TABLA_11, true, false, false, false)
                    correlativo = validateCorrelativo(correlativo, 6, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '53':
            switch (rcv) {
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 3, TABLA_11, true, false, false, false)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 3, TABLA_11, true, false, false, false)
                    correlativo = validateCorrelativo(correlativo, 8, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '54':
            switch (rcv) {
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 3, TABLA_11, true, false, false, false)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 3, TABLA_11, true, false, false, false)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '55':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 2, 8, 9]

                    serie = validateSerie(serie, 1, ['1', '2', '5'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 11, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 1, ['1', '2', '5'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 11, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 1, ['1', '2', '5'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 11, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '56':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 1, 2, 8, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 11, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 11, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 11, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '87':
        case '88':
            switch (rcv) {
                case '14.1':
                    cpd.estados = [0, 2, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, false)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '89':
            switch (rcv) {
                case '8.1':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, false)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 4, ['0001'], true, true, true, false)
                    correlativo = validateCorrelativo(correlativo, 7, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '91':
            switch (rcv) {
                case '8.2':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '96':
            switch (rcv) {
                case '8.1':
                case '8.3':
                    cpd.estados = [0, 1, 6, 7, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '97':
        case '98':
            switch (rcv) {
                case '8.2':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                case '1.1':
                case '1.2':
                case '3.1':
                case '3.2':
                case '3.3':
                case '3.4':
                case '3.5':
                case '3.6':
                case '3.7':
                case '3.8':
                case '3.9':
                case '3.11':
                case '3.12':
                case '3.13':
                case '3.14':
                case '3.15':
                case '3.16.1':
                case '3.16.2':
                case '3.17':
                case '3.18':
                case '3.19':
                case '3.20':
                case '3.23':
                case '3.24':
                case '3.25':
                case '4.1':
                case '5.1':
                case '5.3':
                case '5.2':
                case '5.4':
                case '6.1':
                case '7.1':
                case '7.3':
                case '7.4':
                case '9.1':
                case '9.2':
                case '10.1':
                case '10.2':
                case '10.3':
                case '10.4':
                case '12.1':
                case '13.1':
                    cpd.estados = [1, 8, 9]

                    serie = validateSerie(serie, 20, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 20, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        case '99':
            switch (rcv) {
                case '8.1':
                    cpd.estados = [0, 9]

                    serie = validateSerie(serie, 4, [], false, false, false, true)
                    correlativo = validateCorrelativo(correlativo, 15, true, false, true, true)
                    break
                default:
                    errors = {
                        ...errors,
                        error: {
                            status: false,
                            value: rcv,
                            msg: `El código "${rcv}" no es un Libro ni Registro válido!`
                        }
                    }
                    break
            }
            break
        default:
            errors = {
                ...errors,
                error: {
                    status: false,
                    value: comprobante,
                    msg: `El código "${rcv}" no es un Comprobante de Pago y/o Documento válido!`
                }
            }
            break
    }

    if (!serie.status)
        errors = {
            ...errors,
            errSerie: serie
        }

    if (!correlativo.status)
        errors = {
            ...errors,
            errCorrelativo: correlativo
        }

    switch (Object.keys(errors).length) {
        case 0:
            return {
                success: true,
                result: {
                    ...cpd,
                    serie: serie.value,
                    correlativo: correlativo.value
                }
            }
        case 1:
            if (!serie.status) {
                errors = {
                    ...errors,
                    errSerie: serie
                }

                return {
                    success: false,
                    result: {
                        ...cpd,
                        ...errors,
                        correlativo: correlativo.value
                    }
                }
            }

            if (!correlativo.status) {
                errors = {
                    ...errors,
                    errCorrelativo: correlativo
                }
                return {
                    success: false,
                    result: {
                        ...cpd,
                        ...errors,
                        serie: serie.value
                    }
                }
            }
            break
        case 2:
        case 3:
        case 4:
            return {success: false, result: errors}
    }
}

module.exports = {
    vDate: date => vDate(date),
    vRuc: ruc => vRuc(ruc),
    digitoVerificacion: dni => {
        dni = dni.toString().trim()
        dni = dni.split('')
        const serie_array = ['3', '2', '7', '6', '5', '4', '3', '2']
        const barra_array = ['6', '7', '8', '9', '0', '1', '1', '2', '3', '4', '5', '6']

        let suma = 0
        for (let i = 0; i < 8; i++)
            suma += dni[i] * serie_array[i]

        const residuo = 11 - (suma % 11)

        return barra_array[residuo]
    },
    vCuo: cuo => {
        cuo = cuo.toString().trim()

        if (cuo.length < 1 || cuo.length > 40)
            return {status: false, cuo, msg: `CUO "${cuo}" debe tener entre 1 y 40 dígitos!`}

        return {status: true, cuo}
    },
    separarNombre: nombre => {
        nombre = nombre ? nombre.toString().trim().toLowerCase().split(' ') : []

        let fullName = [], auxPalabra = '', palabrasReservadas = ['da', 'de', 'del', 'la', 'las', 'los', 'san', 'santa']
        nombre.forEach(name => {
            if (palabrasReservadas.includes(name))
                auxPalabra += `${name} `
            else {
                fullName.push(`${auxPalabra}${name}`);
                auxPalabra = ""
            }
        })

        return {
            paterno: fullName[0] ? fullName[0].trim() : '',
            materno: fullName[1] ? fullName[1].trim() : '',
            nombre1: fullName[2] ? fullName[2].trim() : '',
            nombre2: fullName[3] ? fullName[3].trim() : ''
        }
    },
    vImporte: importe => {
        importe = importe.toString().replace(',', '')
        importe = importe.toString().replace('-', '')

        if (isNaN(importe))
            return {status: false, importe, msg: `El importe "${importe}" debe ser un número!`}

        importe = Number(importe).myFixed(2)

        return {status: true, importe}
    },
    vFecha: (fecha, periodo) => {
        fecha = fecha.toString().trim().replace(/-/g, "/")
        periodo = periodo ? periodo : ''

        if (fecha.length === 8)
            fecha = moment(fecha, "DD/MM/YYYY")
        else if (fecha.length === 10) {
            const index = fecha.indexOf("/")
            if (index === 4)
                fecha = moment(fecha, "YYYY/MM/DD")
            if (index === 2)
                fecha = moment(fecha, "DD/MM/YYYY")
            if (index === 1)
                fecha = moment(fecha, "DD/MM/YYYY")
        } else if (fecha.length === 9) {
            const index = fecha.indexOf("/")
            if (index === 1)
                fecha = moment(fecha, "DD/MM/YYYY")
            else
                return {status: false, input: '', msg: `La fecha "${fecha}" no es válida!`}
        } else
            return {status: false, input: '', msg: `Fecha "${fecha}" no es válida!`}

        if (!fecha.isValid())
            return {status: false, input: '', msg: `Fecha "${fecha}" no es válida!`}

        const newFecha = moment(fecha).format("DD/MM/YYYY")

        const year = periodo.substring(0, 4)
        const month = periodo.substring(5, 7)

        if (moment(moment(fecha).format("YYYY-MM-DD")).isAfter(moment(`${periodo}-${new Date(year, month, 0).getDate()}`).format("YYYY-MM-DD"))) //solo <= al periodo
            return {status: false, input: '', msg: `Fecha "${newFecha}" no debe ser mayor al periodo actual!`}

        return {status: true, fecha: newFecha, input: moment(fecha).format("YYYY-MM-DD")}
    },
    vFechaLr: (fecha, empresa) => {
        const newFecha = moment(fecha, 'YYYY-MM-DD').format("DD/MM/YYYY")

        if (moment(moment(fecha).format("YYYY-MM-DD")).isAfter(moment(`${empresa.year}-${empresa.month}-${new Date(empresa.year, empresa.month, 0).getDate()}`).format("YYYY-MM-DD")))
            return {
                status: false, input: '', fecha: newFecha,
                msg: `Fecha "${newFecha}" no debe ser mayor al periodo actual a declarar!`
            }

        return {status: true, fecha: newFecha, input: newFecha}
    },
    vGlosa: glosa => {
        glosa = glosa.toString().trim()

        if (glosa.length < 1 || glosa.length > 200)
            return {status: false, glosa, msg: `Glosa "${glosa}" debe tener entre 1 y 200 dígitos!`}

        return {status: true, glosa}
    },
    vCodigo51: codigo => {
        codigo = codigo.toString().trim()

        if (codigo.length < 1 || codigo.length > 24)
            return {status: false, codigo, msg: `Código "${codigo}" debe tener entre 1 y 24 dígitos!`}

        return {status: true, codigo}
    },
    vDebeHaber: (debe, haber) => {
        if (debe < 0)
            return {status: false, debe, msg: `El Importe "${debe}" no debe ser negativo!`}

        if (haber < 0)
            return {status: false, haber, msg: `El Importe "${haber}" no debe ser negativo!`}

        if (debe > 0 && haber > 0)
            return {status: false, debe, haber, msg: `El importe del Debe y el Haber deben ser excluyentes!`}

        return {status: true, debe: Number(debe), haber: Number(haber)}
    },
    vOptativo: optativo => {
        optativo = optativo ? optativo.toString().trim() : ''

        if (optativo.length > 200)
            return {status: false, optativo, msg: `Campo "${optativo}" no debe ser mayor a 200 dígitos!`}

        return {status: true, optativo}
    },
    vReglasCpd: (cpd, rcv) => vReglasCpd(cpd, rcv),
    vPeriodoCompra: (i1, e_periodo, i41) => {
        i1 = i1 ? i1.toString().trim() : ''
        i41 = i41 ? i41.toString().trim() : ''
        e_periodo = e_periodo ? e_periodo.toString().trim() : ''
        let anio = '', mes = ''

        if (i1.length === 7) {
            anio = i1.substring(0, 4)
            mes = i1.substring(5, 7)

            i1 = `${anio}${mes}00`
        } else if (i1.length === 8) {
            anio = i1.substring(0, 4)
            mes = i1.substring(4, 6)
        }

        if (i1.length !== 8)
            return {status: false, i1, msg: `Periodo "${i1}" debe tener 8 caracteres!`}

        const year = e_periodo.substring(0, 4)
        const month = e_periodo.substring(5, 7).padStart(2, '0')

        if (Number(mes) < 1 || Number(mes) > 12)
            return {status: false, i1, msg: `Mes "${mes}" inválido!`}

        if (moment(`${anio}-${mes}-01`).isAfter(`${year}-${month}-01`))
            return {
                status: false,
                i1,
                input: '',
                msg: `El Periodo "${anio}-${mes}" no debe ser mayor al periodo a declarar!`
            }

        if (moment(`${anio}-${mes}-01`).isSame(`${year}-${month}-01`) && !['0', '1'].includes(i41) && !['6', '7', '9'].includes(i41))
            return {status: false, i1, msg: `Periodo "${anio}-${mes}" debe ser el mismo a informar`}

        if (moment(`${anio}-${mes}-01`).isBefore(`${year}-${month}-01`) && ['6', '7'].includes(i41))
            return {status: false, i1, msg: `Periodo "${anio}-${mes}" es menor al informado`}

        if (!moment(`${anio}-${mes}-01`).isBefore(`${year}-${month}-01`) && ['9'].includes(i41))
            return {status: false, i1, msg: `Periodo "${anio}-${mes}" debe ser menor al informado`}

        return {status: true, i1: `${anio}${mes}00`}
    },
    vPeriodoVenta: (i1, e_periodo, i34) => {
        i1 = i1 ? i1.toString().trim() : ''
        i34 = i34 ? i34.toString().trim() : ''
        e_periodo = e_periodo ? e_periodo.toString().trim() : ''
        let anio = '', mes = ''

        if (i1.length === 7) {
            anio = i1.substring(0, 4)
            mes = i1.substring(5, 7)

            i1 = `${anio}${mes}00`
        } else if (i1.length === 8) {
            anio = i1.substring(0, 4)
            mes = i1.substring(4, 6)
        }

        if (i1.length !== 8)
            return {status: false, i1, msg: `Periodo "${i1}" debe tener 8 caracteres!`}

        const year = e_periodo.substring(0, 4)
        const month = e_periodo.substring(5, 7).padStart(2, '0')

        if (Number(mes) < 1 || Number(mes) > 12)
            return {status: false, i1, msg: `Mes "${mes}" inválido!`}

        if (moment(`${anio}-${mes}-01`).isAfter(`${year}-${month}-01`))
            return {
                status: false, i1, input: '',
                msg: `El Periodo "${anio}-${mes}" no debe ser mayor al periodo a declarar!`
            }

        if (moment(`${anio}-${mes}-01`).isBefore(`${year}-${month}-01`) && ['1'].includes(i34))
            return {status: false, i1, msg: `Periodo "${anio}-${mes}" es menor al informado`}

        if (moment(`${anio}-${mes}-01`).isSame(`${year}-${month}-01`) && !['0', '1', '2'].includes(i34))
            return {status: false, i1, msg: `Periodo "${anio}-${mes}" debe ser menor al periodo informado`}

        return {status: true, i1: `${anio}${mes}00`}
    },
    vCuoCompra: i2 => {
        i2 = i2 ? i2.toString().trim() : ''

        if (i2.length < 1 || i2.length > 40)
            return {status: false, i2, msg: `CUO "${i2}" debe tener entre 1 y 40 dígitos!`}

        if (i2.includes('&'))
            return {status: false, i2, msg: `CUO "${i2}" no acepta el caracter "&"!`}

        return {status: true, i2}
    },
    vCuoVenta: (i2, i34) => {
        i2 = i2 ? i2.toString().trim() : ''
        i34 = i34 ? i34.toString().trim() : ''

        if (i2.length < 1 || i2.length > 40)
            return {status: false, i2, msg: `CUO "${i2}" debe tener entre 1 y 40 dígitos!`}

        if (i2.includes('&'))
            return {status: false, i2, msg: `CUO "${i2}" no acepta el caracter "&"!`}

        return {status: true, i2}
    },
    vCorrelativoCompra: (i3, rer080300) => {
        i3 = i3 ? i3.toString().trim() : ''
        rer080300 = rer080300 ? rer080300 : false

        if (i3.length < 2 || i3.length > 10)
            return {status: false, i3, msg: `N° de línia "${i3}" debe tener entre 2 y 10 dígitos!`}

        if (!['A', 'M', 'C'].includes(i3.substring(0, 1)))
            return {status: false, i3, msg: `N° de línia "${i3}" debe empezar con la letra A, M o C!`}

        if (i3.includes('&'))
            return {status: false, i3, msg: `N° de línia "${i3}" no acepta el caracter "&"!`}

        if (rer080300 && i3 !== 'M-RER')
            return {status: false, i3, msg: `N° de línia "${i3}" debe ser M-RER!`}

        if (!rer080300 && i3 === 'M-RER')
            return {status: false, i3, msg: `N° de línia "${i3}" debe empezar con la letra A o C!`}

        return {status: true, i3}
    },
    vCorrelativoVenta: (i3, rer140100) => {
        i3 = i3 ? i3.toString().trim() : ''
        rer140100 = rer140100 ? rer140100 : false

        if (i3.length < 2 || i3.length > 10)
            return {status: false, i3, msg: `N° de linia "${i3}" debe tener entre 2 y 10 dígitos!`}

        if (!['A', 'M', 'C'].includes(i3.substring(0, 1)))
            return {status: false, i3, msg: `N° de linia "${i3}" debe empezar con la letra A, M o C!`}

        if (i3.includes('&'))
            return {status: false, i3, msg: `N° de linia "${i3}" no acepta el caracter "&"!`}

        if (rer140100 && i3 !== 'M-RER')
            return {status: false, i3, msg: `N° de linia "${i3}" debe ser M-RER!`}

        if (!rer140100 && i3 === 'M-RER')
            return {status: false, i3, msg: `N° de linia "${i3}" debe empezar con la letra A o C!`}

        return {status: true, i3}
    },
    vVencimientoCompra: (i5, e_periodo, i4, i6, i1) => {
        i4 = i4 ? i4 : ''
        i5 = i5 ? i5 : ''
        i5 = i5 !== '01/01/0001' ? i5 : ''
        i6 = i6 ? i6 : ''
        i1 = i1 ? i1 : ''
        e_periodo = e_periodo ? e_periodo : ''

        if (i6 === '14' && i5 === '')
            return {
                status: false,
                i5Input: '',
                msg: `Vencimiento "${i5}" no debe ser menor a la fecha de emisión del comprobante!`
            }

        if (i5 === '')
            return {status: true, i5: '', i5Input: ''}

        const vFecha = vDate(i5)
        const vFecha4 = vDate(i4)

        if (!vFecha.status)
            return {status: false, input: '', msg: vFecha.msg}

        const newFecha = moment(vFecha.fecha).format("YYYY-MM-DD")
        const newFecha4 = moment(vFecha4.fecha).format("YYYY-MM-DD")

        if (moment(newFecha).isBefore(newFecha4))
            return {
                status: false, i5: moment(newFecha).format("DD/MM/YYYY"), i5Input: newFecha,
                msg: `Vencimiento "${i5}" no debe ser menor a la fecha de emisión del comprobante!`
            }

        if (moment(newFecha).isAfter(moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7).toString().padStart(2, '0')}-${new Date(Number(e_periodo.substring(0, 4)), e_periodo.substring(5, 7).toString().padStart(2, '0'), 0).getDate()}`).add(1, 'months').format("YYYY-MM-DD")))
            return {
                status: false, i5: moment(newFecha).format("DD/MM/YYYY"), i5Input: newFecha,
                msg: `Vencimiento "${i5}" no debe ser mayor al mes siguiente del periodo informado!`
            }

        const newFechai1 = i1.length === 7 ? `${i1.substr(0, 4)}-${i1.substr(5, 2).toString().padStart(2, '0')}-${new Date(Number(i1.substr(0, 4)), i1.substr(5, 2).toString().padStart(2, '0'), 0).getDate()}` : `${i1.substr(0, 4)}-${i1.substr(4, 2).toString().padStart(2, '0')}-${new Date(Number(i1.substr(0, 4)), i1.substr(4, 2).toString().padStart(2, '0'), 0).getDate()}`

        if (moment(newFecha).isAfter(moment(newFechai1).add(1, 'months').format("YYYY-MM-DD")))
            return {
                status: false, i5: moment(newFecha).format("DD/MM/YYYY"), i5Input: newFecha,
                msg: `Vencimiento "${i5}" no debe ser mayor al mes siguiente del periodo señalado en el campo 1!`
            }

        return {status: true, i5: moment(newFecha).format("DD/MM/YYYY"), i5Input: newFecha}
    },
    vVencimientoVenta: (i5, e_periodo, i4, i6, i1, i34) => {
        i4 = i4 ? i4 : ''
        i5 = i5 ? i5 : ''
        i6 = i6 ? i6 : ''
        i1 = i1 ? i1 : ''
        i34 = i34 ? i34 : ''

        if (i5 === '' && i6 === '14' && i34 !== '2')
            return {
                status: false, i5Input: '',
                msg: `Vencimiento "${i5}" no debe ser menor a la fecha de emisión del comprobante!`
            }

        if (i5 === '')
            return {status: true, i5: '', i5Input: ''}

        const vFecha = vDate(i5)
        const vFecha4 = vDate(i4)

        if (!vFecha.status)
            return {status: false, input: '', msg: vFecha.msg}

        const newFecha = moment(vFecha.fecha).format("YYYY-MM-DD")
        const newFecha4 = moment(vFecha4.fecha).format("YYYY-MM-DD")

        if (moment(newFecha).isBefore(newFecha4))
            return {
                status: false, i5: moment(newFecha).format("DD/MM/YYYY"), i5Input: newFecha,
                msg: `Vencimiento "${i5}" no debe ser menor a la fecha de emisión del comprobante!`
            }
        //Por cuestiones de quitar la validacion se cambio el add Month a 5 en lugar de 1
        if (moment(newFecha).isAfter(moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7).toString().padStart(2, '0')}-${new Date(Number(e_periodo.substring(0, 4)), e_periodo.substring(5, 7).toString().padStart(2, '0'), 0).getDate()}`).add(5, 'months').format("YYYY-MM-DD"), 'month'))
            return {
                status: false, i5: moment(newFecha).format("DD/MM/YYYY"), i5Input: newFecha,
                msg: `Vencimiento "${i5}" no debe ser mayor al mes siguiente del periodo informado!`
            }

        const newFechai1 = i1.length === 7 ? `${i1.substr(0, 4)}-${i1.substr(5, 2).toString().padStart(2, '0')}-${new Date(Number(i1.substr(0, 4)), i1.substr(5, 2).toString().padStart(2, '0'), 0).getDate()}` : `${i1.substr(0, 4)}-${i1.substr(4, 2).toString().padStart(2, '0')}-${new Date(Number(i1.substr(0, 4)), i1.substr(4, 2).toString().padStart(2, '0'), 0).getDate()}`
        //Por cuestiones de quitar la validacion se cambio el add Month a 5 en lugar de 1
        if (moment(newFecha).isAfter(moment(newFechai1).add(5, 'months').format("YYYY-MM-DD"), 'month'))
            return {
                status: false, i5: moment(newFecha).format("DD/MM/YYYY"), i5Input: newFecha,
                msg: `Vencimiento "${i5}" no debe ser mayor al mes siguiente del periodo señalado en el campo 1!`
            }

        return {status: true, i5: moment(newFecha).format("DD/MM/YYYY"), i5Input: newFecha}
    },
    vContVencOper: (fecha, e_periodo, type, operacion) => vContVencOper(fecha, e_periodo, type, operacion),
    vContableCompra: (i4, e_periodo) => {
        i4 = i4 ? i4 : ''
        e_periodo = e_periodo ? e_periodo : ''
        const vFecha = vDate(i4)

        if (!vFecha.status)
            return {status: false, i4Input: '', msg: vFecha.msg}

        const newFecha = moment(vFecha.fecha).format("YYYY-MM-DD")
        if (moment(newFecha).isAfter(moment(`${e_periodo}-${new Date(Number(e_periodo.substring(0, 4)), Number(e_periodo.substring(5, 7)), 0).getDate()}`).format("YYYY-MM-DD")))
            return {
                status: false, i4: newFecha, i4Input: newFecha,
                msg: `Fecha "${newFecha}" no debe ser mayor al periodo actual!`
            }

        return {status: true, i4: moment(newFecha).format('DD/MM/YYYY'), i4Input: newFecha}
    },
    vContableVenta: (i4, e_periodo, i34) => {
        i4 = i4 ? i4 : ''
        i34 = i34 ? i34 : ''

        if (i4 === '' && i34 === '2')
            return {status: true, i4, i4Input: ''}

        const vFecha = vDate(i4)

        if (!vFecha.status)
            return {status: false, i4Input: '', msg: vFecha.msg}

        const newFecha = moment(vFecha.fecha).format("YYYY-MM-DD")
        if (moment(newFecha).isAfter(moment(`${e_periodo}-${new Date(Number(e_periodo.substring(0, 4)), Number(e_periodo.substring(5, 7)), 0).getDate()}`).format("YYYY-MM-DD")))
            return {
                status: false, i4: newFecha, i4Input: newFecha,
                msg: `Fecha "${newFecha}" no debe ser mayor al periodo actual!`
            }

        return {status: true, i4: moment(newFecha).format('DD/MM/YYYY'), i4Input: newFecha}
    },
    vTipoComprobantesCompra: i6 => {
        i6 = i6 ? i6.toString().trim().padStart(2, '0') : ''

        let comprobantes = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '10', '11', '12', '13', '14', '15', '16',
            '17', '18', '19', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '32', '34', '35', '36', '37', '42',
            '46', '48', '49', '50', '51', '52', '53', '54', '55', '56', '87', '88', '89', '96']

        if (!comprobantes.includes(i6))
            return {status: false, i6, msg: `Tipo de Comprobante de Pago "${i6}" no válido!`}

        return {status: true, i6}
    },
    vTipoComprobantesVenta: i6 => {
        i6 = i6 ? i6.toString().trim().padStart(2, '0') : ''

        const comprobantes = ['00', '01', '03', '04', '05', '06', '07', '08', '11', '12', '13', '14', '15', '16', '17', '18', '19', '21', '23', '24', '25', '26', '27', '28', '29', '30', '32', '34', '35', '36', '37', '42', '43', '44', '45', '48', '49', '55', '56', '87', '88', '99']

        if (!comprobantes.includes(i6))
            return {status: false, i6, msg: `Tipo de Comprobante de Pago "${i6}" no válido!`}

        return {status: true, i6}
    },
    vTipoComprobantesCompra82: i5 => {
        i5 = i5 ? i5.toString().trim().padStart(2, '0') : ''

        const comprobantes = ['00', '91', '97', '98']

        if (!comprobantes.includes(i5))
            return {status: false, i5, msg: `Tipo de Comprobante de Pago "${i5}" no válido!`}

        return {status: true, i5}
    },
    vTipoComprobantesCf: i11 => {
        i11 = i11 ? i11.toString().trim().padStart(2, '0') : ''

        const comprobantes = ['', '00', '46', '50', '51', '52', '53']

        if (!comprobantes.includes(i11))
            return {status: false, i11, msg: `Tipo de Comprobante de Pago "${i11}" no válido!`}

        return {status: true, i11}
    },
    vTipoComprobantesCompra83: i6 => {
        i6 = i6 ? i6.toString().trim().padStart(2, '0') : ''

        let comprobantes = ['00', '01', '03', '05', '06', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '22',
            '23', '24', '26', '27', '28', '29', '30', '32', '36', '37', '42', '43', '45', '46', '50', '51', '52', '53', '54',
            '55', '56', '87', '88', '96']

        if (!comprobantes.includes(i6))
            return {status: false, i6, msg: `Tipo de Comprobante de Pago "${i6}" no válido!`}

        return {status: true, i6}
    },
    vDua: (i8, e_periodo, i6) => {
        i8 = i8 ? i8.toString().trim() : ''
        e_periodo = e_periodo ? e_periodo : ''
        i6 = i6 ? i6 : ''

        if (['50', '26'].includes(i6) && (Number(i8) < 1981 || Number(i8) > Number(e_periodo.substring(0, 4))))
            return {status: false, i8, msg: `Año de emisión de la DUA o DSI "${i8}" no es válido!`}

        return {status: true, i8}
    },
    vDua82: (i11, e_periodo, i13) => {
        i11 = i11 ? i11.toString().trim() : ''
        e_periodo = e_periodo ? e_periodo : ''
        i13 = i13 ? i13 : ''

        if (['50', '52'].includes(i11) && (Number(i13) < 1981 || Number(i13) > Number(e_periodo.substring(0, 4))))
            return {status: false, i13, msg: `Año de emisión de la DUA o DSI "${i13}" no es válido!`}

        return {status: true, i13}
    },
    vNumberFinal: (i10, i6, i9) => {
        i10 = i10 ? i10.toString().trim() : ''

        if (i10.length > 20)
            return {status: false, i10, msg: `Número final "${i10}" no válido!`}

        if (['00', '03', '05', '06', '08', '11', '12', '13', '14', '15', '16', '18', '18', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88'].includes(i6) && Number(i9) >= 0)
            return isNaN(i10) ? {status: false, i10, msg: `Número final "${i10}" no válido!`} : {status: true, i10}
        else if (i10 !== '')
            return {status: false, i10, msg: `Número final "${i10}" tiene que estar vacío!`}

        return {status: true, i10}
    },
    vTipoDocumentoProveedor: async (i11, i6, i27) => {
        i11 = i11 ? i11.toString().trim() : ''
        i6 = i6 ? i6 : ''
        i27 = i27 ? i27 : ''

        let documentos = await getRedisJson(`t_documentos`)
        if (!documentos) {
            const query = pgp.as.format('SELECT * FROM t_documentos where estado=true')
            documentos = await db.many(query).then(res => res).catch(err => err)
            // documentos = documentos.filter(({codigo}) => codigo !== '0') // Completar validación del campo 11 para el tipo 0
            documentos = documentos.uniqueObject('codigo')
            await setRedisJson(`t_documentos`, documentos)
        }
        if (['00', '03', '05', '06', '07', '08', '11', '12', '12', '14', '15', '16', '18', '19', '22', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88', '91', '97', '98'].includes(i6) && documentos.includes(i11))
            return {status: true, i11}
        if (['07', '08', '87', '88', '97', '98'].includes(i6) && ['03', '12', '13', '14', '36'].includes(i27) && documentos.includes(i11))
            return {status: true, i11}

        if (!documentos.includes(i11))
            return {status: false, i11, msg: `Tipo de identidad del proveedor "${i11}" no es válido!`}

        return {status: true, i11}
    },
    vTipoDocumentoCliente: async (i10, i6, i28, i34, i13, i24, i9) => {
        i9 = i9 ? i9.toString().trim() : ''
        i10 = i10 ? i10.toString().trim() : ''
        i13 = i13 ? Number(i13) : 0
        i24 = i24 ? Number(i24) : 0

        let documentos = await getRedisJson(`t_documentos`)
        if (!documentos) {
            const query = pgp.as.format('SELECT * FROM t_documentos where estado=$1')
            documentos = await db.manyOrNone(query, [true]).then(res => res).catch(err => err)
            documentos = documentos.uniqueObject('codigo')
            await setRedisJson(`t_documentos`, documentos)
        }

        if (['00', '05', '06', '07', '08', '11', '12', '13', '14', '15', '16', '18', '19', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88'].includes(i6) && documentos.includes(i10))
            return {status: true, i10}
        if (['07', '08', '87', '88'].includes(i6) && ['03', '12', '13', '14', '36'].includes(i28) && documentos.includes(i10) || i34 === '2')
            return {status: true, i10}
        if (i13 > 0 && documentos.includes(i10))
            return {status: true, i10}
        if (i24 < 700 && ['03', '12'].includes(i6) && documentos.includes(i10))
            return {status: true, i10}
        if (i9 !== '' && documentos.includes(i10))
            return {status: true, i10}

        if (!documentos.includes(i10))
            return {status: false, i10, msg: `Tipo de identidad del cliente "${i10}" no es válido!`}

        return {status: true, i10}
    },
    vRucProveedor: (i11, i12, i6, i27) => {
        i12 = i12 ? i12.toString().trim() : ''

        if (i11 === '1' && i12.length !== 8)
            return {status: false, i12, msg: `Número de RUC "${i12}" no es válido!`}

        if (i11 === '6' && i12.length === 11) {
            const vaRuc = vRuc(i12).status

            if (!vaRuc)
                return {status: false, i12, msg: `Número de RUC "${i12}" no es válido!`}

            if (['00', '03', '05', '06', '07', '08', '11', '12', '12', '14', '15', '16', '18', '19', '22', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88', '91', '97', '98'].includes(i6) && vaRuc)
                return {status: true, i12}
            if (['07', '08', '87', '88', '97', '98'].includes(i6) && ['03', '12', '13', '14', '36'].includes(i27) && vaRuc)
                return {status: true, i12}
        }

        return {status: true, i12}
    },
    vRucCliente: (i11, i6, i13, i24, i28, i34, i9, i10) => {
        i11 = i11 ? i11.toString().trim() : ''
        i9 = i9 ? i9.toString().trim() : ''
        i10 = i10 ? i10.toString().trim() : ''
        i13 = i13 ? Number(i13) : 0
        i24 = i24 ? Number(i24) : 0

        if (i10 === '1' && i11.length !== 8)
            return {status: false, i11, msg: `Número de RUC "${i11}" no es válido!`}

        if (i10 === '6' && i11.length === 11) {
            const vaRuc = vRuc(i11).status

            if (['00', '05', '06', '07', '08', '11', '12', '13', '14', '15', '16', '18', '19', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88'].includes(i6) && vaRuc)
                return {status: true, i11}
            if (i34 === '2' && vaRuc)
                return {status: true, i11}
            if (['07', '08', '87', '88'].includes(i6) && ['03', '12', '13', '14', '36'].includes(i28) && vaRuc)
                return {status: true, i11}
            if (i13 > 0 && vaRuc)
                return {status: true, i11}
            if (i24 < 700 && ['03', '12'].includes(i6) && vaRuc)
                return {status: true, i11}
            if (i9 !== '' && vaRuc)
                return {status: true, i11}
        }

        if (!['1', '6'].includes(i10) && i11 === '')
            return {status: false, i11, msg: `Número "${i11}" no es válido!`}

        return {status: true, i11}
    },
    vRazonProveedor: (i13, i6, i27) => {
        i13 = i13 ? i13.toString().trim() : ''

        if (i13.length > 100)
            return {status: false, i13, msg: `Denominación o Razón Social "${i13}" no es válido!`}

        if (['00', '03', '05', '06', '07', '08', '11', '12', '12', '14', '15', '16', '18', '19', '22', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88', '91', '97', '98'].includes(i6))
            return {status: true, i13}
        if (['07', '08', '87', '88', '97', '98'].includes(i6) && ['03', '12', '13', '14', '36'].includes(i27))
            return {status: true, i13}

        if (i13.length === 0)
            return {status: false, i13, msg: `Denominación o Razón Social "${i13}" no es válido!`}

        return {status: true, i13}
    },
    vRazonProveedor82: i19 => {
        i19 = i19 ? i19.toString().trim() : ''

        if (i19.length === 0)
            return {status: false, i19, msg: `Apellidos y Nombres "${i19}" no es válido!`}

        if (i19.length > 100)
            return {status: false, i19, msg: `Apellidos y Nombres "${i19}" no es válido!`}

        return {status: true, i19}
    },
    vApellidosNombres82: i23 => {
        i23 = i23 ? i23.toString().trim() : ''

        if (i23.length > 100)
            return {status: false, i23, msg: `Apellidos y Nombres "${i23}" no es válido!`}

        return {status: true, i23}
    },
    vDomicilio82: i20 => {
        i20 = i20 ? i20.toString().trim() : ''

        if (i20.length > 100)
            return {status: false, i20, msg: `Domicilio "${i20}" no es válido!`}

        return {status: true, i20}
    },
    vIdentificacion: i21 => {
        i21 = i21 ? i21.toString().trim() : ''

        if (i21.length === 0)
            return {status: false, i21, msg: `Número de identificación "${i21}" no es válido!`}

        if (i21.length > 15)
            return {status: false, i21, msg: `Número de identificación "${i21}" no es válido!`}

        return {status: true, i21}
    },
    vIdentificacion82: i22 => {
        i22 = i22 ? i22.toString().trim() : ''

        if (i22.length > 15)
            return {status: false, i22, msg: `Número de identificación "${i22}" no es válido!`}

        return {status: true, i22}
    },
    vRazonCliente: (i12, i6, i34, i28, i13, i24, i9) => {
        i12 = i12 ? i12.toString().trim() : ''
        i34 = i34 ? i34.toString().trim() : ''
        i9 = i9 ? i9.toString().trim() : ''
        i13 = i13 ? Number(i13) : ''
        i24 = i24 ? Number(i24) : ''

        if (i12.length === 0 || i12.length > 100)
            return {
                status: false, i12,
                msg: `Denominación o Razón Social "${i12}" no debe ser de mas de 100 dígitos o vacío!`
            }

        if (['00', '05', '06', '07', '08', '11', '12', '13', '14', '15', '16', '18', '19', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88'].includes(i6))
            return {status: true, i12}
        if (i34 === '2')
            return {status: true, i12}
        if (i13 > 0)
            return {status: true, i12}
        if (i24 < 700)
            return {status: true, i12}
        if (['07', '08', '87', '88'].includes(i6) && ['03', '12', '13', '14', '36'].includes(i28))
            return {status: true, i12}
        if (i9 !== '')
            return {status: true, i12}

        return {status: true, i12}
    },
    vBaseImponible: (i14, type) => {
        i14 = i14 ? i14.toString().trim() : ''

        if (isNaN(i14))
            return {status: false, [type]: i14, msg: `Base imponible "${i14}" no es válido!`}

        return {status: true, [type]: i14 !== 0 ? i14 : ''}
    },
    vMonto: (i13, type) => {
        i13 = i13 ? i13 : 0
        if (isNaN(i13))
            return {status: false, [type]: i13, msg: `Monto "${i13}" no es válido!`}
        i13 = Number(i13)
        if (i13 < 0)
            return {status: false, [type]: i13, msg: `Monto "${i13}" debe ser mayor a cero(0)!`}

        return {status: true, [type]: i13}
    },
    vMontoNeg: (i15, type) => {
        i15 = i15 ? i15.toString().trim() : 0
        if (isNaN(i15))
            return {status: false, [type]: i15, msg: `Monto "${i15}" no es válido!`}

        return {status: true, [type]: i15 !== 0 ? i15 : ''}
    },
    vBaseIogi: (i21, i6, i34, type) => {
        i21 = i21 ? i21.toString().trim() : 0
        if (isNaN(i21))
            return {status: false, [type]: i21, msg: `Monto "${i21}" no es válido!`}

        if (['49'].includes(i6) && i34 !== '2' && i21 === 0)
            return {status: false, [type]: i21, msg: `Monto "${i21}" no es válido!`}

        return {status: true, [type]: i21 !== 0 ? i21 : ''}
    },
    vMontoImpuesto: (i15, i14, type) => {
        i15 = i15 ? i15.toString().trim() : ''

        if (isNaN(i15))
            return {status: false, [type]: i15, msg: `Monto del impuesto "${i15}" no es válido!`}

        if (i14 < 0 && i15 >= 0)
            return {status: false, [type]: i15, msg: `Monto del impuesto "${i15}" no es válido!`}

        if (i14 > 0 && i15 < 0)
            return {status: false, [type]: i15, msg: `Monto del impuesto "${i15}" no es válido!`}

        return {status: true, [type]: i15}
    },
    vNoGravadas: i20 => {
        i20 = i20 ? i20.toString().trim() : ''

        if (isNaN(i20))
            return {status: false, i20, msg: `Valor no Gravada "${i20}" no es válido!`}

        return {status: true, i20}
    },
    vIsc: i21 => {
        i21 = i21 ? i21.toString().trim() : ''

        if (isNaN(i21))
            return {status: false, i21, msg: `Monto del ISC "${i21}" no es válido!`}

        return {status: true, i21}
    },
    vOtros: i22 => {
        i22 = i22 ? i22.toString().trim() : ''

        if (isNaN(i22))
            return {status: false, i22, msg: `Otros cargos tributarios "${i22}" no es válido!`}

        return {status: true, i22}
    },
    vImporteTotal: (i23, i14, i15, i16, i17, i18, i19, i20, i21, i22, i42) => {
        i23 = i23 ? i23.toString().trim() : ''

        if (isNaN(i23))
            return {status: false, i23, msg: `Importe Total "${i23}" no es válido!`}

        // if (Number((Number(i14) + Number(i15) + Number(i16) + Number(i17) + Number(i18) + Number(i19) + Number(i20) + Number(i21) + Number(i22) + Number(i42)).myFixed(1)) !== Number(Number(i23).myFixed(1)))
        //     return {status: false, i23, msg: `Importe Total "${i23}" no es igual a la suma de los campos 14 al 22!`}

        return {status: true, i23}
    },
    vImporteTotal82: (i8, i9, i10) => {
        if (isNaN(i10))
            return {status: false, i10, msg: `Importe Total "${i10}" no es válido!`}

        // if (Number((Number(i8) + Number(i9)).myFixed(0)) !== Number(Number(i10).myFixed(0)))
        //     return {status: false, i10, msg: `Importe Total "${i10}" no es igual a la suma de los campos 8 y 9!`}

        return {status: true, i10}
    },
    vImporteTotal83: (i23, i13, i14, i15, i22, i42) => {
        if (isNaN(i23))
            return {status: false, i23, msg: `Importe Total "${i23}" no es válido!`}

        // if (Number((Number(i14) + Number(i15) + Number(i22) + Number(i42)).myFixed(0)) !== Number(Number(i23).myFixed(0)))
        //     return {status: false, i23, msg: `Importe Total "${i23}" no es igual a la suma de los campos 13 al 16!`}

        return {status: true, i23}
    },
    vCodigoMoneda: async (i24, i25, type) => {
        i24 = i24 ? i24.toString().trim() : 'PEN'
        i25 = i25 ? i25.toString().trim() : ''

        let monedas = await getRedisJson(`t_monedas`)
        if (!monedas) {
            const query = pgp.as.format('SELECT * FROM t_monedas where estado=true')
            monedas = await db.many(query).then(res => res).catch(err => err)
            monedas = monedas.uniqueObject('codigo')
            await setRedisJson(`t_monedas`, monedas)
        }

        if (!monedas.includes(i24))
            return {status: false, [type]: i24, msg: `Código de Moneda "${i24}" no es válido!`}

        if (Number(i25) > 1)
            return {status: true, [type]: 'USD'}

        return {status: true, [type]: 'PEN'}
    },
    vCodigoMoneda82: async i16 => {
        i16 = i16 ? i16.toString().trim() : ''

        let monedas = await getRedisJson(`t_monedas`)
        if (!monedas) {
            const query = pgp.as.format('SELECT * FROM t_monedas where estado=true')
            monedas = await db.many(query).then(res => res).catch(err => err)
            monedas = monedas.uniqueObject('codigo')
            await setRedisJson(`t_monedas`, monedas)
        }
        if (!monedas.includes(i16))
            return {status: false, i16, msg: `Código de Moneda "${i16}" no es válido!`}

        return {status: true, i16}
    },
    vConvenios: async i31 => {
        i31 = i31 ? i31.toString().trim() : ''

        let convenios = await getRedisJson(`t_convenios`)
        if (!convenios) {
            const query = pgp.as.format('SELECT * FROM t_convenios where estado=true')
            convenios = await db.many(query).then(res => res).catch(err => err)
            convenios = convenios.uniqueObject('codigo')
            await setRedisJson(`t_convenios`, convenios)
        }
        if (!convenios.includes(i31))
            return {status: false, i31, msg: `Convenio "${i31}" no es válido!`}

        return {status: true, i31}
    },
    vExoneracion: async i32 => {
        i32 = i32 ? i32.toString().trim() : ''

        let exoneraciones = await getRedisJson(`t_exoneraciones_operaciones`)
        if (!exoneraciones) {
            const query = pgp.as.format('SELECT * FROM t_exoneraciones_operaciones where estado=true')
            exoneraciones = await db.many(query).then(res => res).catch(err => err)
            exoneraciones = exoneraciones.uniqueObject('codigo')
            await setRedisJson(`t_exoneraciones_operaciones`, exoneraciones)
        }
        if (!exoneraciones.includes(i32) && i32 !== '')
            return {status: false, i32, msg: `Tipo de Renta "${i32}" no es válido!`}

        return {status: true, i32}
    },
    vTipoRenta: async i33 => {
        i33 = i33 ? i33.toString().trim() : ''

        let rentas = await getRedisJson(`t_tipo_renta`)
        if (!rentas) {
            const query = pgp.as.format('SELECT * FROM t_tipo_renta where estado=true')
            rentas = await db.many(query).then(res => res).catch(err => err)
            rentas = rentas.uniqueObject('codigo')
            await setRedisJson(`t_tipo_renta`, rentas)
        }
        if (!rentas.includes(i33))
            return {status: false, i33, msg: `Tipo de Renta "${i33}" no es válido!`}

        return {status: true, i33}
    },
    vModalidad: async i34 => {
        i34 = i34 ? i34.toString().trim() : ''

        let modalidades = await getRedisJson(`t_modalidad_servicios`)
        if (!modalidades) {
            const query = pgp.as.format('SELECT * FROM t_modalidad_servicios where estado=true')
            modalidades = await db.many(query).then(res => res).catch(err => err)
            modalidades = modalidades.uniqueObject('codigo')
            await setRedisJson(`t_modalidad_servicios`, modalidades)
        }
        if (!modalidades.includes(i34) && i34 !== '')
            return {status: false, i34, msg: `Tipo de Renta "${i34}" no es válido!`}

        return {status: true, i34}
    },
    vImpuestoRenta: i35 => {
        i35 = i35 ? i35 : ''

        if (!['', '1'].includes(i35))
            return {status: false, i35, msg: `Impuesto a la Renta "${i35}" no es válido!`}

        return {status: true, i35}
    },
    vCodigoPais: async i18 => {
        i18 = i18 ? i18 : ''

        let paises = await getRedisJson(`t_paises`)
        if (!paises) {
            const query = pgp.as.format('SELECT * FROM t_paises where estado=true')
            paises = await db.many(query).then(res => res).catch(err => err)
            paises = paises.uniqueObject('codigo')
            await setRedisJson(`t_paises`, paises)
        }
        if (!paises.includes(i18))
            return {status: false, i18, msg: `Código de País "${i18}" no es válido!`}

        return {status: true, i18}
    },
    vCodigoPais82: async i24 => {
        i24 = i24 ? i24.toString().trim() : ''

        let paises = await getRedisJson(`t_paises`)
        if (!paises) {
            const query = pgp.as.format('SELECT * FROM t_paises where estado=true')
            paises = await db.many(query).then(res => res).catch(err => err)
            paises = paises.uniqueObject('codigo')
            await setRedisJson(`t_paises`, paises)
        }
        if (!paises.includes(i24) && i24 !== '')
            return {status: false, i24, msg: `Código de País "${i24}" no es válido!`}

        return {status: true, i24}
    },
    vVinculo82: async i25 => {
        i25 = i25 ? i25.toString().trim() : ''

        let vinculaciones = await getRedisJson(`t_vinculaciones_economicas`)
        if (!vinculaciones) {
            const query = pgp.as.format('SELECT * FROM t_vinculaciones_economicas where estado=true')
            vinculaciones = await db.many(query).then(res => res).catch(err => err)
            vinculaciones = vinculaciones.uniqueObject('codigo')
            await setRedisJson(`t_vinculaciones_economicas`, vinculaciones)
        }
        if (!vinculaciones.includes(i25) && i25 !== '')
            return {status: false, i25, msg: `Código de Vínculaciones Económicas "${i25}" no es válido!`}

        return {status: true, i25}
    },
    vTipoCambio: (i24, i25, type) => {
        i24 = i24 ? i24.toString().trim() : ''
        i25 = i25 ? i25.toString().trim() : ''

        if (isNaN(i25))
            return {status: false, [type]: i25, msg: `Tipo de Cambio "${i25}" no es válido!`}

        if (Math.trunc(i25) < 0 || Math.trunc(i25) > 9)
            return {status: false, [type]: i25, msg: `Tipo de Cambio "${i25}" no es válido!`}
        i24 = i24 === 'PEN' || i24 === '' && Number(i25) > 1 ? 'USD' : i24
        if (i24 === 'PEN' || i24 === '' && Number(i25) > 1)
            return {status: false, [type]: i25, msg: `Tipo de Cambio "${i25}" no es válido para moneda PEN!`}

        i25 = Number(i25).myFixed(3)

        return {status: true, [type]: i25 !== '0.000' ? i25 : ''}
    },
    vTipoCambioVenta: (i24, i25, type) => {
        i24 = i24 ? i24.toString().trim() : ''
        i25 = i25 ? i25.toString().trim() : ''

        if (isNaN(i25))
            return {status: false, [type]: i25, msg: `Tipo de Cambio "${i25}" no es válido!`}

        if (Math.trunc(i25) < 0 || Math.trunc(i25) > 9)
            return {status: false, [type]: i25, msg: `Tipo de Cambio "${i25}" no es válido!`}
        i24 = i24 === 'PEN' || i24 === '' && Number(i25) > 1 ? 'USD' : i24
        if (i24 === 'PEN' || i24 === '' && Number(i25) > 1)
            return {status: false, [type]: i25, msg: `Tipo de Cambio "${i25}" no es válido para moneda PEN!`}

        i25 = Number(i25).myFixed(3)

        return {status: true, [type]: i25 !== '0.000' ? i25 : '1.000'}
    },
    vFechaPagoCompModif: (i26, i6, i1) => {
        i26 = i26 ? i26 : ''
        i6 = i6 ? i6 : ''

        if (['07', '08', '87', '88', '97', '98'].includes(i6) && i26 !== '') {
            const vCvo = vContVencOper(i26, i1, 'operacion')
            if (!vCvo.status)
                return {status: false, i26, msg: `Fecha de Emisión "${i26}" no es válido!`}
        }

        const vFecha = vDate(i26)
        if (!vFecha.status && i26 !== '')
            return {status: false, input: '', msg: vFecha.msg}

        return {status: true, i26: i26 !== '' ? moment(vFecha.fecha).format("DD/MM/YYYY") : ''}
    },
    vFechaPagoCompModifVenta: (i27, i6, i1, i34) => {
        i27 = i27 ? i27 : ''
        i34 = i34 ? i34 : ''

        if (['07', '08', '87', '88'].includes(i6) && i34 !== '2' && i27 !== '') {
            const vCvo = vContVencOper(i27, i1, 'operacion')
            if (!vCvo.status)
                return {status: false, i27, input: '', msg: `Fecha de Emisión "${i27}" no es válido!`}
        }

        const vFecha = vDate(i27)
        if (!vFecha.status && i27 !== '')
            return {status: false, i27, input: '', msg: vFecha.msg}

        return {
            status: true,
            i27: i27 !== '01/01/0001' && i27 !== '' ? moment(vFecha.fecha).format("DD/MM/YYYY") : '',
            i27Input: i27 !== '01/01/0001' && i27 !== '' ? moment(vFecha.fecha).format("YYYY-MM-DD") : ''
        }
    },
    vTipoComprobanteModif: async (i27, i6) => {
        i27 = i27 ? i27.toString().trim() : ''
        i6 = i6 ? i6 : ''

        let comprobantes = await getRedisJson(`t_comprobantes`)
        if (!comprobantes) {
            const query = pgp.as.format('SELECT * FROM t_comprobantes where estado=true')
            comprobantes = await db.many(query).then(res => res).catch(err => err)
            comprobantes = comprobantes.uniqueObject('codigo')
            await setRedisJson(`t_comprobantes`, comprobantes)
        }
        if (['07', '08', '87', '88', '97', '98'].includes(i6) && !comprobantes.includes(i27))
            return {status: false, i27, msg: `Tipo de Comprobante de Pago "${i27}" no válido!`}

        if (!comprobantes.includes(i27) && i27 !== '')
            return {status: false, i27, msg: `Tipo de Comprobante de Pago "${i27}" no válido 1!`}

        return {status: true, i27}
    },
    vTipoComprobanteModifVenta: async (i28, i6, i34) => {
        i28 = i28 ? i28.toString().trim() : ''

        let comprobantes = await getRedisJson(`t_comprobantes`)
        if (!comprobantes) {
            const query = pgp.as.format('SELECT * FROM t_comprobantes where estado=true')
            comprobantes = await db.many(query).then(res => res).catch(err => err)
            comprobantes = comprobantes.uniqueObject('codigo')
            await setRedisJson(`t_comprobantes`, comprobantes)
        }
        if (['07', '08', '87', '88'].includes(i6) && !comprobantes.includes(i28) && i34 !== '2')
            return {status: false, i28, msg: `Tipo de Comprobante de Pago "${i28}" no válido!`}

        if (!comprobantes.includes(i28) && i28 !== '')
            return {status: false, i28, msg: `Tipo de Comprobante de Pago "${i28}" no válido!`}

        return {status: true, i28}
    },
    vSerieCorrelativoModif: (i27, i28, i30, i6) => {
        i6 = i6 ? i6 : ''
        let vI28 = {status: true, i28: ''}, vI30 = {status: true, i30: ''}

        if (['07', '08', '87', '88', '97', '98'].includes(i6)) {
            const {result} = vReglasCpd({comprobante: i27, serie: i28, correlativo: i30}, '8.1')
            const {errSerie, errCorrelativo} = result
            vI28 = errSerie ? {status: false, i28: errSerie.value, msg: errSerie.msg} : {
                status: true,
                i28: result.serie
            }
            vI30 = errCorrelativo ? {status: false, i30: errCorrelativo.value, msg: errCorrelativo.msg} : {
                status: true,
                i30: result.correlativo
            }
        }

        return {vI28, vI30}
    },
    vSerieCorrelativoModifVenta: (i28, i29, i30, i6) => {
        let vI29 = {status: true, i29: ''}, vI30 = {status: true, i30: ''}

        if (['07', '08', '87', '88'].includes(i6)) {
            const {result} = vReglasCpd({comprobante: i28, serie: i29, correlativo: i30}, '14.1')
            const {errSerie, errCorrelativo} = result
            vI29 = errSerie ? {status: false, i29: errSerie.value, msg: errSerie.msg} : {
                status: true,
                i29: result.serie
            }
            vI30 = errCorrelativo ? {status: false, i30: errCorrelativo.value, msg: errCorrelativo.msg} : {
                status: true,
                i30: result.correlativo
            }
        }

        return {vI29, vI30}
    },
    vIdenContrVenta: i31 => {
        i31 = i31 ? i31.toString().trim() : ''

        if (i31.length > 12)
            return {status: false, i31, msg: `Identificación del Contrato o del Proyecto "${i31}" no válido!`}

        return {status: true, i31}
    },
    vDuaModif: async (i29, i27) => {
        i27 = i27 ? i27.toString().trim() : ''
        i29 = i29 ? i29.toString().trim() : ''

        if (['50', '52'].includes(i27)) {
            let aduanas = await getRedisJson(`t_aduanas`)
            if (!aduanas) {
                const query = pgp.as.format('SELECT * FROM t_aduanas where estado=true')
                aduanas = await db.many(query).then(res => res).catch(err => err)
                aduanas = aduanas.uniqueObject('codigo')
                await setRedisJson(`t_aduanas`, aduanas)
            }
            if (!aduanas.includes(i29))
                return {status: false, i29, msg: `Código de dependencia aduanera "${i27}" no válido!`}
        }

        return {status: true, i29}
    },
    vFechaDetraccion: (i31, e_periodo, i1, i32) => {
        i1 = i1 ? i1 : ''
        i31 = i31 ? i31 : ''
        i32 = i32 ? i32.toString().trim() : ''
        i32 = i32 !== '0' ? i32 : ''
        e_periodo = e_periodo ? e_periodo : ''

        if (i31 === '' && i32 === '')
            return {status: true, i31}

        if (i31 === '01/01/0001' && i32 !== '')
            return {status: false, input: '', msg: 'La fecha es obligatoria'}

        let {status, fecha, msg} = vDate(i31)
        if (!status && i32 !== '')
            return {status: false, input: '', msg}

        fecha = moment(fecha).format("YYYY-MM-DD")

        const year = e_periodo.substring(0, 4)
        const month = e_periodo.substring(5, 7)

        const anio = i1.substring(0, 4)
        const mes = i1.substring(5, 7)

        if (moment(fecha).isSameOrAfter(moment(`${year}-${month.toString().padStart(2, '0')}-01`, "YYYY-MM-DD").add(2, 'months')))
            return {status: false, input: '', msg: `Fecha "${fecha}" no debe ser mayor al periodo actual!`}

        if (moment(fecha).isSameOrAfter(moment(`${anio}-${mes.toString().padStart(2, '0')}-01`, "YYYY-MM-DD").add(2, 'months')))
            return {status: false, input: '', msg: `Fecha "${fecha}" no debe ser mayor al periodo 1!`}

        return {status: true, i31: moment(fecha).format('DD/MM/YYYY'), i31Input: moment(fecha).format("YYYY-MM-DD")}
    },
    vConstanciaDeposito: i32 => {
        i32 = i32 ? i32.toString().trim() : ''
        i32 = i32 !== '0' ? i32 : ''

        if (i32 === '') return {status: true, i32}

        if (!isNaN(i32) && Number(i32) < 0)
            return {status: false, i32, msg: `Constancia de Depósito "${i32}" no válida!`}

        return {status: true, i32}
    },
    vMarcaComprobanteRetencion: i33 => {
        i33 = i33 ? Number(i33) : ''

        if (!['', 1].includes(i33))
            return {status: false, i33, msg: `Marca de comprobante de retención "${i33}" no válida!`}

        return {status: true, i33}
    },
    vBbSsAdquiridos: async i34 => {
        i34 = i34 ? i34.toString().trim() : ''

        let bbss = await getRedisJson(`t_bbss_adquiridos`)
        if (!bbss) {
            const query = pgp.as.format('SELECT * FROM t_bbss_adquiridos where estado=true')
            bbss = await db.many(query).then(res => res).catch(err => err)
            bbss = bbss.uniqueObject('codigo')
            await setRedisJson(`t_bbss_adquiridos`, bbss)
        }
        if (!bbss.includes(i34) && i34 !== '')
            return {status: false, i34, msg: `Bien o servicio adquirido "${i34}" no válida!`}

        return {status: true, i34}
    },
    vIdentificacionContratoProyecto: i35 => {
        i35 = i35 ? i35.toString().trim() : ''

        if (i35.length > 12)
            return {status: false, i35, msg: `Identificación del contrato del proyecto "${i35}" no válida!`}

        return {status: true, i35}
    },
    vErrorTipo1234: (i36, type) => {
        i36 = i36 ? i36.toString().trim() : ''

        if (!['', '1'].includes(i36))
            return {status: false, [type]: i36, msg: `Error "${i36}" no válida!`}

        return {status: true, [type]: i36}
    },
    vErrorTipo1Venta: i32 => {
        i32 = i32 ? i32.toString().trim() : ''

        if (i32.length > 1)
            return {status: false, i32, msg: `Identificación del contrato del proyecto "${i32}" no válida!`}

        return {status: true, i32}
    },
    vMedioPago: async i40 => {
        i40 = i40 ? i40.toString().trim() : ''
        if (!['0', '1', ''].includes(i40))
            return {status: false, i40, msg: `Medio de Pago no válido "${i40}" no válida!`}

        return {status: true, i40}
    },
    vMedioPagoVenta: async (i33, i24) => {
        i33 = i33 ? i33.toString().trim() : ''
        i24 = i24 ? i24.toString().trim() : 0

        if (!['0', '1', ''].includes(i33))
            return {status: false, i33, msg: `Medio de Pago no válido "${i33}" no válida!`}

        if (Number(i24) >= 3500)
            return {status: true, i33: '1'}

        return {status: true, i33}
    },
    vEstado: (i41, i15, i17, i19, e_periodo, i4, i1, i5, i6, i7) => {
        i41 = i41 ? i41 : ''
        i6 = i6 ? i6 : ''
        i7 = i7 ? i7 : ''
        e_periodo = e_periodo ? e_periodo.toString().trim() : ''

        if (!['0', '1', '6', '7', '9'].includes(i41))
            return {status: false, i41, msg: `Estado "${i41}" no válida!`}

        switch (i41) {
            case '0':
                // estado = 0
                if (['07', '08'].includes(i6) && i7.charAt(0) !== 'B')
                    return {status: false, i41, msg: `Estado "${i41}" no válida 1!`}
                if (!['00', '02', '03', '06', '10', '11', '12', '13', '14', '15', '16', '18', '18', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88'].includes(i6))
                    return {status: false, i41, msg: `Estado "${i41}" no válida 2!`}

                // if (Number(i15) + Number(i17) + Number(i19) !== 0)
                //     return {status: false, i41, msg: `Estado "${i41}" no válida!`}
                break
            case '1':
                // periodo tiene que ser igual a la fecha de emisión => estado = 1
                if (['07', '08'].includes(i6) && i7.charAt(0) === 'B')
                    return {status: false, i41, msg: `Estado "${i41}" no válida`}

                if (['00', '02', '03', '06', '11', '12', '13', '15', '16', '18', '18', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88'].includes(i6))
                    return {status: false, i41, msg: `Estado "${i41}" no válida`}

                const vFecha = vDate(i4)
                if (vFecha.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha.fecha, "YYYY-MM-DD")

                    if (!moment(date2).isSameOrAfter(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}
                }
                break
            case '6':
                // fecha de emisión es menor al periodo informado pero no mayor a 12 meses la fecha de emisión || el periodo (i1) debe ser menor o igual al periodo informado => estado = 6
                if (['07', '08'].includes(i6) && i7.charAt(0) === 'B')
                    return {status: false, i41, msg: `Estado "${i41}" no válida`}

                if (['00', '02', '03', '06', '11', '12', '13', '15', '16', '18', '18', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88'].includes(i6))
                    return {status: false, i41, msg: `Estado "${i41}" no válida`}

                const vFecha6 = vDate(i4)
                if (vFecha6.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha6.fecha, "YYYY-MM-DD")

                    if (moment(date2).isAfter(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}

                    if (moment(date1).diff(date2, 'months') > 12)
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}

                    const date3 = moment(`${i1}-01`, "YYYY-MM-DD")
                    if (moment(date3).isAfter(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}
                }
                break
            case '7':
                // fecha de emisión es menor al periodo informado es mayor a 12 meses la fecha de emisión || el periodo (i1) denbe ser menor o igual al periodo informad => estado = 7
                const vFecha7 = vDate(i4)

                if (vFecha7.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha7.fecha, "YYYY-MM-DD")

                    if (!moment(date2).isBefore(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}

                    if (moment(date1).diff(date2, 'months') < 12)
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}

                    const date3 = moment(`${i1}-01`, "YYYY-MM-DD")
                    if (moment(date3).isAfter(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}
                }
                break
            case '9':
                // la fecha de emisión es de un periodo anterior y el i1 debe ser menor al periodo informado => estado = 9
                const vFecha9 = vDate(i4)

                if (vFecha9.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha9.fecha, "YYYY-MM-DD")
                    if (date2.get('year') < date1.get('year') && date2.get('month') + 1 < date1.get('month') + 1)
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}

                    const date3 = moment(`${i1}-01`, "YYYY-MM-DD")
                    if (moment(date3).isAfter(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}
                }
                break
        }

        return {status: true, i41}
    },
    vEstadoVenta: (i34, i15, i17, i19, e_periodo, i4, i1, i16, i24, i6) => {
        i6 = i6 ? i6 : ''
        i34 = i34 ? i34 : ''
        i24 = i24 ? Number(i24) : 0
        e_periodo = e_periodo ? e_periodo.toString().trim() : ''

        if (!['0', '1', '2', '8', '9'].includes(i34))
            return {status: false, i34, msg: `Estado "${i34}" no válida!`}

        switch (i34) {
            case '0':
                // Cuando el IGV = 0 => estado = 0
                if (i6 !== '00')
                    return {status: false, i34, msg: `Estado "${i34}" no válida!`}
                break
            case '1':
                // periodo tiene que ser igual a la fecha de emisión => estado = 1
                const vFecha = vDate(i4)
                if (vFecha.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha.fecha, "YYYY-MM-DD")

                    if (!moment(date2).isSameOrAfter(date1))
                        return {status: false, i34, msg: `Estado "${i34}" no válida`}
                }
                break
            case '2':
                // Cuando el Importe total = 0 y fecha de emisión del mismo periodo
                const vFecha6 = vDate(i4)

                if (vFecha6.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha6.fecha, "YYYY-MM-DD")

                    if (!moment(date2).isSame(date1, 'month'))
                        return {status: false, i34, msg: `Estado "${i34}" no válida`}
                }
                break
            case '8':
                // Cuando la fecha es anterior a al periodo declarado
                const vFecha7 = vDate(i4)

                if (vFecha7.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha7.fecha, "YYYY-MM-DD")

                    if (!moment(date2).isBefore(date1))
                        return {status: false, i34, msg: `Estado "${i34}" no válida`}
                }
                break
            case '9':
                // Cuando la fecha es anterior a al periodo declarado
                // la fecha de emisión es de un periodo anterior y el i1 debe ser menor al periodo informado => estado = 9
                const vFecha9 = vDate(i4)

                if (vFecha9.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha9.fecha, "YYYY-MM-DD")

                    if (!moment(date2).isBefore(date1))
                        return {status: false, i34, msg: `Estado "${i34}" no válida`}
                }
                break
        }

        return {status: true, i34}
    },
    vEstado83: (i41, i15, e_periodo, i4, i1, i5, i6) => {
        i41 = i41 ? i41 : ''
        e_periodo = e_periodo ? e_periodo.toString().trim() : ''

        if (!['0', '1', '6', '7', '9'].includes(i41))
            return {status: false, i41, msg: `Estado "${i41}" no válida!`}

        switch (i41) {
            case '0':
                // estado = 0
                if (Number(i15) === 0 && !['00', '03', '06', '07', '08', '11', '12', '13', '14', '15', '16', '18', '19', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88'].includes(i6))
                    return {status: false, i41, msg: `Estado "${i41}" no válida!`}
                break
            case '1':
                // periodo tiene que ser igual a la fecha de emisión => estado = 1
                const vFecha = vDate(i4)
                if (vFecha.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha.fecha, "YYYY-MM-DD")

                    if (!moment(date2).isSameOrAfter(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}
                }
                break
            case '6':
                // fecha de emisión es menor al periodo informado pero no mayor a 12 meses la fecha de emisión || el periodo (i1) debe ser menor o igual al periodo informado => estado = 6
                const vFecha6 = vDate(i4)

                if (vFecha6.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha6.fecha, "YYYY-MM-DD")

                    if (moment(date2).isAfter(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}

                    if (moment(date1).diff(date2, 'months') > 12)
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}

                    const date3 = moment(`${i1}-01`, "YYYY-MM-DD")
                    if (moment(date3).isAfter(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}
                }
                break
            case '7':
                // fecha de emisión es menor al periodo informado es mayor a 12 meses la fecha de emisión || el periodo (i1) denbe ser menor o igual al periodo informad => estado = 7
                const vFecha7 = vDate(i4)

                if (vFecha7.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha7.fecha, "YYYY-MM-DD")

                    if (!moment(date2).isBefore(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}

                    if (moment(date1).diff(date2, 'months') < 12)
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}

                    const date3 = moment(`${i1}-01`, "YYYY-MM-DD")
                    if (moment(date3).isAfter(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}
                }
                break
            case '9':
                // la fecha de emisión es de un periodo anterior y el i1 debe ser menor al periodo informado => estado = 9
                const vFecha9 = vDate(i4)

                if (vFecha9.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha9.fecha, "YYYY-MM-DD")
                    if (date2.get('year') < date1.get('year') && date2.get('month') + 1 < date1.get('month') + 1)
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}

                    const date3 = moment(`${i1}-01`, "YYYY-MM-DD")
                    if (moment(date3).isAfter(date1))
                        return {status: false, i41, msg: `Estado "${i41}" no válida`}
                }
                break
        }

        return {status: true, i41}
    },
    vEstado82: (i36, e_periodo, i4, i1) => {
        i1 = i1 ? i1 : ''
        i4 = i4 ? i4 : ''
        i36 = i36 ? i36 : ''
        e_periodo = e_periodo ? e_periodo.toString().trim() : ''

        if (!['0', '9'].includes(i36))
            return {status: false, i36, msg: `Estado "${i36}" no válida!`}

        switch (i36) {
            case '0':
                e_periodo = e_periodo.replace('-', '')
                e_periodo = e_periodo.padEnd(8, '0')
                i1 = i1.replace('-', '')
                i1 = i1.padEnd(8, '0')

                if (e_periodo !== i1)
                    return {status: false, i36, msg: `Estado "${i36}" no válida`}
                break
            case '9':
                // periodo y fecha menor al informado
                const vFecha9 = vDate(i4)

                if (vFecha9.status) {
                    const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
                    const date2 = moment(vFecha9.fecha, "YYYY-MM-DD")
                    if (date2.get('year') < date1.get('year') && date2.get('month') + 1 < date1.get('month') + 1)
                        return {status: false, i36, msg: `Estado "${i36}" no válida 0`}

                    const date3 = moment(`${i1}-01`, "YYYY-MM-DD")
                    if (moment(date3).isAfter(date1))
                        return {status: false, i36, msg: `Estado "${i36}" no válida 1`}

                    e_periodo = e_periodo.replace('-', '')
                    e_periodo = e_periodo.padEnd(8, '0')
                    i1 = i1.replace('-', '')
                    i1 = i1.padEnd(8, '0')

                    if (Number(i1) >= Number(e_periodo))
                        return {status: false, i36, msg: `Estado "${i36}" no válida 2`}
                }
                break
        }

        return {status: true, i36}
    },
    getEstado: (i41, i15, i17, i19, e_periodo, i4, i1, i5, i6, i7) => {
        i6 = i6 ? i6 : ''
        i7 = i7 ? i7 : ''
        e_periodo = e_periodo ? e_periodo.toString().trim() : ''

        // estado = 0
        if (['07', '08'].includes(i6) && i7.charAt(0) === 'B')
            return {status: true, i41: '0'}
        if (Number(i15) + Number(i17) + Number(i19) === 0 && ['00', '02', '03', '06', '10', '11', '12', '13', '14', '15', '16', '18', '19', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88'].includes(i6))
            return {status: true, i41: '0'}

        // periodo tiene que ser igual a la fecha de emisión => estado = 1
        const vFecha = vDate(i4)
        if (vFecha.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha.fecha, "YYYY-MM-DD")

            if (moment(date2).isSameOrAfter(date1))
                return {status: true, i41: '1'}
        }

        // fecha de emisión es menor al periodo informado pero no mayor a 12 meses la fecha de emisión || el periodo (i1) debe ser menor o igual al periodo informado => estado = 6
        const vFecha6 = vDate(i4)

        if (vFecha6.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha6.fecha, "YYYY-MM-DD")

            if (moment(date1).diff(date2, 'months') < 12)
                return {status: true, i41: '6'}
        }

        // fecha de emisión es menor al periodo informado es mayor a 12 meses la fecha de emisión || el periodo (i1) denbe ser menor o igual al periodo informad => estado = 7
        const vFecha7 = vDate(i4)

        if (vFecha7.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha7.fecha, "YYYY-MM-DD")

            if (moment(date1).diff(date2, 'months') > 12)
                return {status: true, i41: '7'}
        }

        // la fecha de emisión es de un periodo anterior y el i1 debe ser menor al periodo informado => estado = 9
        const vFecha9 = vDate(i4)

        if (vFecha9.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha9.fecha, "YYYY-MM-DD")
            if (date2.get('year') < date1.get('year') && date2.get('month') + 1 < date1.get('month') + 1)
                return {status: true, i41: '9'}

            const date3 = moment(`${i1}-01`, "YYYY-MM-DD")
            if (moment(date3).isAfter(date1))
                return {status: true, i41: '9'}
        }

        return {status: true, i41: ''}
    },
    getEstado82: (i36, i1, e_periodo, i4) => {
        i1 = i1 ? i1 : ''
        i4 = i4 ? i4 : ''
        i36 = i36 ? i36 : ''
        e_periodo = e_periodo ? e_periodo.toString().trim() : ''
        e_periodo = e_periodo.replace('-', '')
        e_periodo = e_periodo.padEnd(8, '0')
        i1 = i1.replace('-', '')
        i1 = i1.padEnd(8, '0')

        if (e_periodo === i1)
            return {status: true, i36: '0'}

        // periodo y fecha menor al informado
        const vFecha9 = vDate(i4)

        if (vFecha9.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date3 = moment(`${i1}-01`, "YYYY-MM-DD")

            if (moment(date3).isBefore(date1))
                return {status: true, i36: '9'}

            e_periodo = e_periodo.replace('-', '')
            e_periodo = e_periodo.padEnd(8, '0')
            i1 = i1.replace('-', '')
            i1 = i1.padEnd(8, '0')

            if (Number(i1) < Number(e_periodo))
                return {status: true, i36: '9'}
        }

        return {status: true, i36: '0'}
    },
    getEstadoVenta: (i15, i17, i19, e_periodo, i4, i1, i16, i24) => {
        i24 = i24 ? Number(i24) : 0
        e_periodo = e_periodo ? e_periodo.toString().trim() : ''

        // Cuando el IGV = 0 => estado = 0
        if (Number(i24) === 0)
            return {status: true, i34: '2'}

        // periodo tiene que ser igual a la fecha de emisión => estado = 1
        const vFecha = vDate(i4)
        if (vFecha.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha.fecha, "YYYY-MM-DD")

            if (moment(date2).isSameOrAfter(date1))
                return {status: true, i34: '1'}
        }

        // Cuando el Importe total = 0 y fecha de emisión del mismo periodo
        const vFecha6 = vDate(i4)

        if (vFecha6.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha6.fecha, "YYYY-MM-DD")

            if (moment(date2).isSame(date1, 'month') || i24 === 0)
                return {status: true, i34: '2'}
        }
        // Cuando la fecha es anterior a al periodo declarado
        const vFecha7 = vDate(i4)

        if (vFecha7.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha7.fecha, "YYYY-MM-DD")

            if (moment(date2).isBefore(date1))
                return {status: true, i34: '8'}
        }
        // Cuando la fecha es anterior a al periodo declarado
        const vFecha9 = vDate(i4)

        if (vFecha9.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha9.fecha, "YYYY-MM-DD")

            if (moment(date2).isBefore(date1))
                return {status: true, i34: '9'}
        }

        return {status: true, i34: ''}
    },
    getEstado83: (i41, i15, e_periodo, i4, i1, i5, i6) => {
        i4 = i4 ? i4 : ''
        i41 = i41 ? i41 : ''
        e_periodo = e_periodo ? e_periodo.toString().trim() : ''

        // estado = 0
        if (Number(i15) === 0 && ['00', '02', '03', '06', '07', '08', '11', '12', '13', '14', '15', '16', '18', '19', '23', '26', '28', '30', '34', '35', '36', '37', '55', '56', '87', '88'].includes(i6))
            return {status: true, i41: '0'}

        // periodo tiene que ser igual a la fecha de emisión => estado = 1
        const vFecha = vDate(i4)
        if (vFecha.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha.fecha, "YYYY-MM-DD")

            if (moment(date2).isSameOrAfter(date1))
                return {status: true, i41: '1'}
        }

        // fecha de emisión es menor al periodo informado pero no mayor a 12 meses la fecha de emisión || el periodo (i1) debe ser menor o igual al periodo informado => estado = 6
        const vFecha6 = vDate(i4)

        if (vFecha6.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha6.fecha, "YYYY-MM-DD")

            if (moment(date1).diff(date2, 'months') < 12)
                return {status: true, i41: '6'}
        }

        // fecha de emisión es menor al periodo informado es mayor a 12 meses la fecha de emisión || el periodo (i1) denbe ser menor o igual al periodo informad => estado = 7
        const vFecha7 = vDate(i4)

        if (vFecha7.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha7.fecha, "YYYY-MM-DD")

            if (moment(date1).diff(date2, 'months') > 12)
                return {status: true, i41: '7'}
        }

        // la fecha de emisión es de un periodo anterior y el i1 debe ser menor al periodo informado => estado = 9
        const vFecha9 = vDate(i4)

        if (vFecha9.status) {
            const date1 = moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7)}-01`, "YYYY-MM-DD")
            const date2 = moment(vFecha9.fecha, "YYYY-MM-DD")
            if (!date2.get('year') < date1.get('year') && !date2.get('month') + 1 < date1.get('month') + 1)
                return {status: true, i41: '9'}

            const date3 = moment(`${i1}-01`, "YYYY-MM-DD")
            if (!moment(date3).isAfter(date1))
                return {status: true, i41: '9'}
        }

        return {status: true, i41: ''}
    },
    vFinalVenta: (i9, i6, i24, i4, i34) => {
        i9 = i9 ? i9 : ''
        i6 = i6 ? i6 : ''
        i24 = i24 ? Number(i24) : ''
        i34 = i34 ? i34 : ''
        i4 = i4 ? i4 : ''

        if (i34 === '2' && i9 !== '')
            return {status: false, i9, msg: `Número Final "${i9}" debe ir en blanco para estado 2`}

        if (i9 !== '' && i24 >= 700 && i6 !== '03')
            return {status: false, i9, msg: `Número Final "${i9}" no válido, importe no debe ser mayor a 700`}
        else if (i9 === '' && i24 <= 700)
            return {status: true, i9}

        if (i9.length > 20)
            return {status: false, i9, msg: `Número Final "${i9}" no de ser de mas de 20 dígitos`}

        if (['00', '03', '12', '13', '87'].includes(i6))
            return {status: true, i9}

        if (!['00', '03', '12', '13', '87'].includes(i6) && i9 !== '')
            return {status: false, i9, msg: `Número Final "${i9}" no válida`}

        if (i6 === '03' && i24 >= 700 && moment('2016-07-01').isSameOrAfter(moment(i4, "YYYY-MM-DD")) && i9 === '')
            return {status: false, i9, msg: `Número Final "${i9}" no válida`}

        return {status: true, i9}
    },
    vIcbper: i42 => {
        i42 = i42 ? i42.toString().trim() : '0.00'

        if (isNaN(i42))
            return {status: false, i42, msg: `ICBPER "${i42}" no es válido!`}

        return {status: true, i42: Number(i42).myFixed(2)}
    },
    vIcbper141: i35 => {
        i35 = i35 ? i35 : '0.00'

        if (isNaN(i35))
            return {status: false, i35, msg: `ICBPER "${i35}" no es válido!`}

        return {status: true, i35: Number(i35).myFixed(2)}
    },
    vPagoDiario: (d8, i4, e_periodo) => {
        i4 = i4 ? i4 : ''
        d8 = d8 ? d8 : ''
        d8 = d8 !== '01/01/0001' ? d8 : ''
        e_periodo = e_periodo ? e_periodo : ''

        const vFecha4 = vDate(i4)

        if (d8 === '')
            return {status: true, d8: moment(vFecha4.fecha).format("DD/MM/YYYY")}

        const vFecha = vDate(d8)

        if (!vFecha.status)
            return {status: false, msg: vFecha.msg}

        const newFecha = moment(vFecha.fecha).format("YYYY-MM-DD")
        const newFecha4 = moment(vFecha4.fecha).format("YYYY-MM-DD")

        if (moment(newFecha).isBefore(newFecha4))
            return {
                status: false,
                d8: moment(newFecha).format("DD/MM/YYYY"),
                msg: `Vencimiento "${d8}" no debe ser menor a la fecha de emisión del comprobante!`
            }

        if (moment(newFecha).isAfter(moment(`${e_periodo.substring(0, 4)}-${e_periodo.substring(5, 7).toString().padStart(2, '0')}-${new Date(Number(e_periodo.substring(0, 4)), e_periodo.substring(5, 7).toString().padStart(2, '0'), 0).getDate()}`).format("YYYY-MM-DD")))
            return {
                status: false,
                d8: moment(newFecha).format("DD/MM/YYYY"),
                msg: `Vencimiento "${d8}" no debe ser mayor al mes siguiente del periodo informado!`
            }

        return {status: true, d8: moment(newFecha).format("DD/MM/YYYY")}
    }
}