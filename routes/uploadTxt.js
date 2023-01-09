const express = require('express')
const router = express.Router()

const {modelStorage, modelUser, modelLocal} = require("../graphql/models")
const {decodeToken} = require("../scripts/jwt")

router.post('/', async (req, res, next) => {
    const {files, body, headers} = req
    const {type, i} = body

    if (!files) res.send({status: false, message: 'No file uploaded'})
    const authentication = headers.authentication ? headers.authentication.replace('Bearer ', '') : ''

    const {id} = decodeToken(authentication)
    const user = await modelUser({}).getById(id)
    const local = await modelLocal({user}).getActivo()
    const storage = await modelStorage({user}).getByUserId(id, local.id)

    const response = []
    let {name, mimetype, size, data} = files.txt
    data = data.toString('utf-8').toString('latin1').split("\n")

    switch (type) {
        case 'sc_050100':
            for (const [index, element] of data.entries()) {
                const row = element.split('|')
                if (row[21] !== undefined)
                    response.push({
                        periodo: row[0],
                        cuo: row[1],
                        correlativo: row[2],
                        cuenta: row[3],
                        unidad: row[4],
                        costos: row[5],
                        moneda: row[6],
                        documento: row[7],
                        identificacion: row[8],
                        comprobante: row[9],
                        serie: row[10],
                        numero: row[11],
                        contable: row[12],
                        vencimiento: row[13],
                        operacion: row[14],
                        descripcion: row[15],
                        referencial: row[16],
                        debe: row[17],
                        haber: row[18],
                        estructurado: row[19],
                        estado: row[20],
                        optativo: row[21],
                        id: index
                    })
            }
            break
        case 'sc_080100':
            for (const [index, value] of data.entries()) {
                const row = value.split('|')
                if (row[40] !== undefined) {
                    const i26 = row.length === 43 ? row[26] !== '01/01/0001' ? row[26] : '' : row[25] !== '01/01/0001' ? row[25] : ''
                    let i27 = row.length === 43 ? row[27] : row[26]
                    i27 = i26 === '' && i27 === '00' ? '' : i27
                    const i31 = row.length === 43 ? row[31] !== '01/01/0001' ? row[31] : '' : row[30] !== '01/01/0001' ? row[31] : ''
                    let i32 = row.length === 43 ? row[32] : row[31]
                    i32 = i31 === '' && i32 === '0' ? '' : i32

                    let compra = {
                        id: index,
                        i1: row[0],
                        i2: row[1],
                        i3: row[2],
                        i4: row[3],
                        i5: row[4] !== '01/01/0001' ? row[4].toString().trim() : '',
                        i6: row[5],
                        i7: row[6],
                        i8: row[7],
                        i9: row[8],
                        i10: row[9],
                        i11: row[10],
                        i12: row[11],
                        i13: row[12],
                        i14: row[13],
                        i15: row[14],
                        i16: row[15],
                        i17: row[16],
                        i18: row[17],
                        i19: row[18],
                        i20: row[19],
                        i21: row[20],
                        i22: row.length === 43 ? row[22] : row[21],
                        i23: row.length === 43 ? row[23] : row[22],
                        i24: row.length === 43 ? row[24] : row[23],
                        i25: row.length === 43 ? row[25] : row[24],
                        i26,
                        i27,
                        i28: row.length === 43 ? row[28] : row[27],
                        i29: row.length === 43 ? row[29] : row[28],
                        i30: row.length === 43 ? row[30] : row[29],
                        i31,
                        i32,
                        i33: row.length === 43 ? row[33] : row[32],
                        i34: row.length === 43 ? row[34] : row[33],
                        i35: row.length === 43 ? row[35] : row[34],
                        i36: row.length === 43 ? row[36] : row[35],
                        i37: row.length === 43 ? row[37] : row[36],
                        i38: row.length === 43 ? row[38] : row[37],
                        i39: row.length === 43 ? row[39] : row[38],
                        i40: row.length === 43 ? row[40] : row[39],
                        i41: row.length === 43 ? row[41] : row[40],
                        i42: row.length === 43 ? row[21] : ''
                    }

                    if (compra.i24.toString().trim() === 'USD') {
                        compra.i25 = Number(compra.i25)
                        compra.i14 = Number(compra.i14) / compra.i25
                        compra.i15 = Number(compra.i15) / compra.i25
                        compra.i16 = Number(compra.i16) / compra.i25
                        compra.i17 = Number(compra.i17) / compra.i25
                        compra.i18 = Number(compra.i18) / compra.i25
                        compra.i19 = Number(compra.i19) / compra.i25
                        compra.i20 = Number(compra.i20) / compra.i25
                        compra.i21 = Number(compra.i21) / compra.i25
                        compra.i22 = Number(compra.i22) / compra.i25
                        compra.i23 = Number(compra.i23) / compra.i25
                        compra.i42 = Number(compra.i42) / compra.i25
                    }
                    response.push(compra)
                }
            }
            break
        case 'sc_140100':
            for (const [index, value] of data.entries()) {
                const row = value.split('|')
                if (row[32] !== undefined) {
                    const i27 = row.length === 36 ? row[27] !== '01/01/0001' ? row[27] : '' : row[26] !== '01/01/0001' ? row[26] : ''
                    let i28 = row.length === 36 ? row[28] : row[27]
                    i28 = i27 === '' && i28 === '00' ? '' : i28
                    let i29 = row.length === 36 ? row[29] : row[28]
                    i29 = i27 === '' && i29 === '-' ? '' : i29
                    let i30 = row.length === 36 ? row[30] : row[29]
                    i30 = i27 === '' && i30 === '-' ? '' : i30

                    let venta = {
                        id: index,
                        i1: row[0],
                        i2: row[1],
                        i3: row[2],
                        i4: row[3],
                        i5: row[4] !== '01/01/0001' ? row[4].toString().trim() : '',
                        i6: row[5],
                        i7: row[6],
                        i8: row[7],
                        i9: row[8],
                        i10: row[9],
                        i11: row[10],
                        i12: row[11],
                        i13: row[12],
                        i14: row[13],
                        i15: row[14],
                        i16: row[15],
                        i17: row[16],
                        i18: row[17],
                        i19: row[18],
                        i20: row[19],
                        i21: row[20],
                        i22: row[21],
                        i23: row.length === 36 ? row[23] : row[22],
                        i24: row.length === 36 ? row[24] : row[23],
                        i25: row.length === 36 ? row[25] : row[24],
                        i26: row.length === 36 ? row[26] : row[25],
                        i27,
                        i28,
                        i29,
                        i30,
                        i31: row.length === 36 ? row[31] : row[30],
                        i32: row.length === 36 ? row[32] : row[31],
                        i33: row.length === 36 ? row[33] : row[32],
                        i34: row.length === 36 ? row[34] : row[33],
                        i35: row.length === 36 ? row[22] : ''
                    }

                    if (venta.i1.toString().trim() === 'USD') {
                        venta.i26 = Number(venta.i26)
                        venta.i13 = Number(venta.i13) / venta.i26
                        venta.i14 = Number(venta.i14) / venta.i26
                        venta.i15 = Number(venta.i15) / venta.i26
                        venta.i16 = Number(venta.i16) / venta.i26
                        venta.i17 = Number(venta.i17) / venta.i26
                        venta.i18 = Number(venta.i18) / venta.i26
                        venta.i19 = Number(venta.i19) / venta.i26
                        venta.i20 = Number(venta.i20) / venta.i26
                        venta.i21 = Number(venta.i21) / venta.i26
                        venta.i22 = Number(venta.i22) / venta.i26
                        venta.i23 = Number(venta.i23) / venta.i26
                        venta.i24 = Number(venta.i24) / venta.i26
                        venta.i35 = Number(venta.i35) / venta.i26
                    }

                    if (row.length > 40)
                        venta = {
                            ...venta,
                            d1: row.length === 44 ? row[35] : (row[34] ? row[34] : ''),
                            d2: row.length === 44 ? row[36] : (row[35] ? row[35] : ''),
                            d3: row.length === 44 ? row[37] : (row[36] ? row[36] : ''),
                            d4: row.length === 44 ? row[38] : (row[37] ? row[37] : ''),
                            d5: row.length === 44 ? row[39] : (row[38] ? row[38] : ''),
                            d6: row.length === 44 ? row[40] : (row[39] ? row[39] : ''),
                            d7: row.length === 44 ? row[41] : (row[40] ? row[40] : ''),
                            d8: row.length === 44 ? row[42] : (row[41] ? row[41] : '')
                        }
                    response.push(venta)
                }
            }
            break
        case '140100':
            data.forEach(value => {
                const row = value.split('|')
                const ple52 = row.length === 36
                if (row[22] !== undefined) {
                    const moneda = ple52 ? row[25] : row[24]
                    row[23] = ple52 ? row[24] : row[23]
                    let importe = row[23] !== '' ? Number(row[23]) : 0
                    importe = Math.abs(importe)

                    if (moneda !== 'PEN') {
                        row[25] = ple52 ? row[26] : row[25]
                        const cambio = row[25] !== '' ? Number(row[25]) : 0

                        if (importe !== 0 && cambio !== 0)
                            importe = importe / cambio
                    }
                    response.push({
                        ruc: name.substring(2, 13),
                        comprobante: row[5].toString().trim(),
                        serie: row[6].toString().trim(),
                        correlativo: row[7].toString().trim(),
                        fecha: row[3].toString().trim(),
                        importe: importe.toFixed(2),
                        respuesta: ''
                    })
                }
            })
            break
        case '080100':
            data.forEach((value) => {
                const row = value.split('|')
                const ple52 = row.length === 43
                if (row[22] !== undefined) {
                    const moneda = ple52 ? row[24] : row[23]
                    row[22] = ple52 ? row[23] : row[22]
                    let importe = row[22] !== '' ? Number(row[22]) : 0
                    importe = Math.abs(importe)

                    if (moneda !== 'PEN') {
                        row[24] = ple52 ? row[25] : row[24]
                        const cambio = row[24] !== '' ? Number(row[24]) : 0

                        if (importe !== 0 && cambio !== 0)
                            importe = importe / cambio
                    }

                    response.push({
                        ruc: row[11].toString().trim(),
                        comprobante: row[5].toString().trim(),
                        serie: row[6].toString().trim(),
                        correlativo: row[8].toString().trim(),
                        fecha: row[3].toString().trim(),
                        importe: importe.toFixed(2),
                        respuesta: ''
                    })
                }
            })
            break
    }

    if (!(type === '080100'))
        await modelStorage({user}).update({id: storage.id, update: {[type]: response}})

    res.send({
        status: true,
        message: 'File is uploaded',
        data: {
            name, mimetype, size, response
        }
    })
})

module.exports = router