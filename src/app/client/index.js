const _getX500Val = require('./utils/_getX500Val')
const createApi = require('../api/index.js')

module.exports = function (API_KEYS) {

    if(!API_KEYS || !API_KEYS.length) return false

    let NEW_API = false
    let NEW_API2 = false

    const api = createApi()


    async function checkVersion() {
        try {
            const data = await super.version()

            if(!data.major || !data.minor) return 'E-IMZO Version is undefined'

            const installedVersion = parseInt(data.major) * 100 + parseInt(data.minor)
            NEW_API = installedVersion >= 336
            NEW_API2 = installedVersion >= 412
        }catch (e){
            return e
        }
    }

    function installApiKeys() {
        return api.apikey(this.API_KEYS)
    }


    function getKeys() {
        return new Promise(async (resolve, reject) => {
            if(!NEW_API) return reject('Please install new version of E-IMZO')

            if(NEW_API2){
                const keys = await _findPfxs2()

                resolve(keys)
            }else{
                const pfxsData = await this._findPfxs2()
                const tokenData = await this._findTokens2()
                const firstKey = pfxsData.firstKey ?? tokenData.firstKey

                resolve({
                    firstKey,
                    keys: pfxsData.keys
                })
            }
        })
    }


    async function _findPfxs2(){
        const data = await api.eimzo({plugin: "pfx", name: "list_all_certificates"})

        let keys = []
        let itmkey
        for (let rec in data.certificates) {
            const el = data.certificates[rec]
            let x500name_ex = el.alias.toUpperCase()
            x500name_ex = x500name_ex.replace("1.2.860.3.16.1.1=", "INN=")
            x500name_ex = x500name_ex.replace("1.2.860.3.16.1.2=", "PINFL=")
            const key = {
                disk: el.disk,
                path: el.path,
                name: el.name,
                alias: el.alias,
                serialNumber: _getX500Val(x500name_ex, "SERIALNUMBER"),
                validFrom: new Date(_getX500Val(x500name_ex, "VALIDFROM").replace(/\./g, "-").replace(" ", "T")),
                validTo: new Date(_getX500Val(x500name_ex, "VALIDTO").replace(/\./g, "-").replace(" ", "T")),
                CN: _getX500Val(x500name_ex, "CN"),
                TIN: (_getX500Val(x500name_ex, "INN") ? _getX500Val(x500name_ex, "INN") : _getX500Val(x500name_ex, "UID")),
                UID: _getX500Val(x500name_ex, "UID"),
                PINFL: _getX500Val(x500name_ex, "PINFL"),
                O: _getX500Val(x500name_ex, "O"),
                T: _getX500Val(x500name_ex, "T"),
                type: 'pfx',
            }
            if (!key.TIN && !key.PINFL)
                continue
            itmkey = "itm-" + key.serialNumber + "-" + rec

            keys.push(key)
        }

        return {
            firstKey: itmkey,
            keys
        }
    }

    async function _findTokens2() {
        const data = await api.eimzo({ plugin: "ftjc", name: "list_all_keys", arguments: [''] })

        let keys = []
        let itmkey
        for (let rec in data.tokens) {
            const el = data.tokens[rec]
            let x500name_ex = el.info.toUpperCase()
            x500name_ex = x500name_ex.replace("1.2.860.3.16.1.1=", "INN=")
            x500name_ex = x500name_ex.replace("1.2.860.3.16.1.2=", "PINFL=")
            const key = {
                cardUID: el.cardUID,
                statusInfo: el.statusInfo,
                ownerName: el.ownerName,
                info: el.info,
                serialNumber: _getX500Val(x500name_ex, "SERIALNUMBER"),
                validFrom: new Date(_getX500Val(x500name_ex, "VALIDFROM")),
                validTo: new Date(_getX500Val(x500name_ex, "VALIDTO")),
                CN: _getX500Val(x500name_ex, "CN"),
                TIN: (_getX500Val(x500name_ex, "INN") ? _getX500Val(x500name_ex, "INN") : _getX500Val(x500name_ex, "UID")),
                UID: _getX500Val(x500name_ex, "UID"),
                PINFL: _getX500Val(x500name_ex, "PINFL"),
                O: _getX500Val(x500name_ex, "O"),
                T: _getX500Val(x500name_ex, "T"),
                type: 'ftjc',
            }
            if (!key.TIN && !key.PINFL)
                continue
            itmkey = "itm-" + key.serialNumber + "-" + rec

            keys.push(key)
        }

        return {
            firstKey: itmkey,
            keys
        }
    }

}