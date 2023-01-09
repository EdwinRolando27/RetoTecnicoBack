const moment = require("moment")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const uniqid = require("uniqid")
const fs = require("fs")
const {vRuc} = require("../utils/scripts/validate")

const timestamp = (dateTime = null, format = 'YYYY-MM-DD HH:mm:ss') => {
    dateTime = dateTime ? moment(dateTime) : moment()

    return dateTime.utcOffset('-0500').format(format)
}

module.exports = {
    update: ({id, update}) => {
        let set = '', values = [id]
        const keys = Object.keys(update)

        keys.forEach((element, index) => {
            set += `${[element]}=$${index + 2}, `
            let aux = typeof update[element] === 'object' ? JSON.stringify(update[element]) : update[element]
            aux = aux === 'null' ? null : aux
            values.push(aux)
        })

        set += `updated_at=$${keys.length + 2}`
        values = [...values, timestamp()]

        return {set, values}
    },
    fields: (fields, update) => {
        fields = Object.keys(fields)
        update = Object.keys(update)

        const errors = []
        update.forEach(element => {
            const included = fields.includes(element)
            if (!included) errors.push(element)
        })

        return errors
    },
    timestamp: () => timestamp(),
    passwordHash: async password => await bcrypt.hash(password, 12),
    getUser: async (token, User) => {
        token = token ? token.replace('Bearer ', '') : ''
        const {id} = token !== '' && token !== 'undefined' ? jwt.decode(token) : {id: null}

        return id !== null ? User.getById(id) : {}
    },
    eliminarArchivos: (path, minutes = 1) => {
        let fecha_creacion = moment().add(minutes * -1, 'minutes').format('DD/MM/YYYY HH:mm:ss')
        const files = fs.readdirSync(path, {encoding: 'utf8'})
        for (const file of files) {
            let pathEliminar = `${path}/${file}`
            const stat = fs.statSync(pathEliminar)
            if (moment(stat.mtime).format('DD/MM/YYYY HH:mm:ss') <= fecha_creacion)
                fs.rmdirSync(pathEliminar, {recursive: true})
        }
    },
    createNameFile: (rrrrrrrrrrr, aaaa, mm, dd, llllll, cc, o, i, m, g) => {
        const errors = []
        rrrrrrrrrrr = vRuc(rrrrrrrrrrr)
        if (!rrrrrrrrrrr.status)
            errors.push({
                ...rrrrrrrrrrr,
                value: rrrrrrrrrrr.ruc
            })
        rrrrrrrrrrr = rrrrrrrrrrr.ruc

        if (aaaa.length !== 4)
            errors.push({
                value: aaaa,
                msg: `El año ${aaaa}, debe tener 4 dígitos`
            })

        if (Number(mm) < 1 || Number(mm) > 12)
            errors.push({
                value: mm,
                msg: `El mes ${mm}, debe estar comprendido entre 01 y 12`
            })

        mm = mm.toString().padStart(2, '0')
        dd = dd.toString().padStart(2, '0')

        if (llllll.length !== 6)
            errors.push({
                value: llllll,
                msg: `El identificador del libro ${llllll}, debe tener 4 dígitos`
            })

        i = i ? 1 : 0
        m = m === 'PEN' ? 1 : 2

        return `LE${rrrrrrrrrrr}${aaaa}${mm}${dd}${llllll}${cc}${o}${i}${m}${g}`
    },
    NumeroALetras: (num, mon) => {
        const data = {
            numero: num,
            enteros: Math.floor(num),
            centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
            letrasCentavos: "",
            letrasMonedaPlural: mon,
            letrasMonedaSingular: mon
        }

        const Unidades = num => {
            switch (num) {
                case 1:
                    return "UN"
                case 2:
                    return "DOS"
                case 3:
                    return "TRES"
                case 4:
                    return "CUATRO"
                case 5:
                    return "CINCO"
                case 6:
                    return "SEIS"
                case 7:
                    return "SIETE"
                case 8:
                    return "OCHO"
                case 9:
                    return "NUEVE"
            }
            return ""
        }

        const Decenas = num => {
            const decena = Math.floor(num / 10);
            const unidad = num - (decena * 10);

            switch (decena) {
                case 1:
                    switch (unidad) {
                        case 0:
                            return "DIEZ"
                        case 1:
                            return "ONCE"
                        case 2:
                            return "DOCE"
                        case 3:
                            return "TRECE"
                        case 4:
                            return "CATORCE"
                        case 5:
                            return "QUINCE"
                        default:
                            return "DIECI" + Unidades(unidad)
                    }
                case 2:
                    switch (unidad) {
                        case 0:
                            return "VEINTE"
                        default:
                            return "VEINTI" + Unidades(unidad)
                    }
                case 3:
                    return DecenasY("TREINTA", unidad)
                case 4:
                    return DecenasY("CUARENTA", unidad)
                case 5:
                    return DecenasY("CINCUENTA", unidad)
                case 6:
                    return DecenasY("SESENTA", unidad)
                case 7:
                    return DecenasY("SETENTA", unidad)
                case 8:
                    return DecenasY("OCHENTA", unidad)
                case 9:
                    return DecenasY("NOVENTA", unidad)
                case 0:
                    return Unidades(unidad)
            }
        }

        const DecenasY = (strSin, numUnidades) => {
            if (numUnidades > 0) return strSin + " Y " + Unidades(numUnidades)
            return strSin
        }

        const Centenas = num => {
            const centenas = Math.floor(num / 100);
            const decenas = num - (centenas * 100);

            switch (centenas) {
                case 1:
                    if (decenas > 0)
                        return "CIENTO " + Decenas(decenas)
                    return "CIEN";
                case 2:
                    return "DOSCIENTOS " + Decenas(decenas)
                case 3:
                    return "TRESCIENTOS " + Decenas(decenas)
                case 4:
                    return "CUATROCIENTOS " + Decenas(decenas)
                case 5:
                    return "QUINIENTOS " + Decenas(decenas)
                case 6:
                    return "SEISCIENTOS " + Decenas(decenas)
                case 7:
                    return "SETECIENTOS " + Decenas(decenas)
                case 8:
                    return "OCHOCIENTOS " + Decenas(decenas)
                case 9:
                    return "NOVECIENTOS " + Decenas(decenas)
            }

            return Decenas(decenas)
        }

        const Seccion = (num, divisor, strSingular, strPlural) => {
            const cientos = Math.floor(num / divisor)
            const resto = num - (cientos * divisor)
            let letras = ""

            if (cientos > 0)
                if (cientos > 1) letras = Centenas(cientos) + " " + strPlural
                else letras = strSingular

            if (resto > 0) letras += ""

            return letras
        }

        const Miles = num => {
            const divisor = 1000;
            const cientos = Math.floor(num / divisor)
            const resto = num - (cientos * divisor)

            const strMiles = Seccion(num, divisor, "UN MIL", "MIL")
            const strCentenas = Centenas(resto)

            if (strMiles === "") return strCentenas
            return strMiles + " " + strCentenas
            //return Seccion(num, divisor, "UN MIL", "MIL") + " " + Centenas(resto);
        }

        const Millones = num => {
            const divisor = 1000000;
            const cientos = Math.floor(num / divisor)
            const resto = num - (cientos * divisor)

            const strMillones = Seccion(num, divisor, "UN MILLON", "MILLONES")
            const strMiles = Miles(resto)

            if (strMillones === "") return strMiles

            return strMillones + " " + strMiles

            //return Seccion(num, divisor, "UN MILLON", "MILLONES") + " " + Miles(resto);
        }

        if (data.centavos > 0) data.letrasCentavos = "CON " + data.centavos + "/100"
        else data.letrasCentavos = "CON " + "00/100"

        if (data.enteros === 0)
            return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos
        if (data.enteros === 1)
            return Millones(data.enteros) + " " + data.letrasCentavos + " " + data.letrasMonedaSingular
        else
            return Millones(data.enteros) + " " + data.letrasCentavos + " " + data.letrasMonedaPlural
    },
    uniqid: () => uniqid(),
    sleep: milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
}